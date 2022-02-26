
import type {
  IOptions,
  ICompiler,
  ICompilation,
} from './types';
import path from 'path';
import glob from 'fast-glob';
import fs from 'fs';

export default class SxfDeadfilePlugin {
  private options: IOptions;

  constructor(options: IOptions) {
    this.options = {
      ...options,
      include: options.include ?? ['src/**/*'],
      exclude: options.exclude ?? ['node_modules/**/*'],
      globOptions: options.globOptions,
    };
  }

  apply(compiler: ICompiler) {

    // webpack 4
    if (compiler.hooks) {
      compiler.hooks.afterEmit.tapAsync('SxfDeadfilePlugin', this.onAfterEmit.bind(this, this.options));
    } else {

      // webpack 3
      compiler.plugin('after-emit', this.onAfterEmit.bind(this, this.options));
    }
  }

  onAfterEmit(options: IOptions, compilation: ICompilation, doneFn: Function) {
    applyAfterEmit(options, compilation);
    doneFn();
  }
}

/**
 * 获取文件依赖关系map
 * @param compilation 
 */
function getFileDepsMap(compilation: ICompilation) {

  const resMap = Array.from<string>(compilation.fileDependencies)
    .reduce((total: Map<string, boolean>, usedFilePath) => {
      total.set(usedFilePath, true);
      return total;
    }, new Map());

  const { assets } = compilation;
  Object.keys(assets).forEach(assetRelpath => {
    const existsAt = assets[assetRelpath].existsAt;
    resMap.set(existsAt, true);
  });

  return resMap;
}

/**
 * 获取指定目录下的所有指定文件
 * @param options 
 */
function getIncludeFiles(options: IOptions) {
  const { include, exclude } = options;
  const fileList = include.concat(exclude.map(item => `!${item}`));
  return glob.sync(fileList, options.globOptions)
    .map(filePath => path.resolve(process.cwd(), filePath));
}

function applyAfterEmit(options: IOptions, compilation: ICompilation) {
  const usedFileDeps = getFileDepsMap(compilation);
  const includeFiles = getIncludeFiles(options);

  const deadFiles = includeFiles.filter(file => !usedFileDeps.has(file));

  if (options.delete) {
    removeFiles(deadFiles);
  }

  console.log('\n--------------------- Unused Files ---------------------');
  if (!deadFiles.length) {
    console.log('\x1B[32m%s\x1B[0m', '\nPerfect, there is nothing to do ٩(◕‿◕｡)۶.');
    return;
  }
  deadFiles.forEach(file => console.log('\x1B[33m%s\x1B[0m', `\n${file}`));
  console.log('\x1B[33m%s\x1B[0m', `\nThere are ${deadFiles.length} unused files (¬º-°)¬.`);
  console.log('\x1B[31m%s\x1B[0m', '\n\nPlease be careful if you want to remove them.\n');
}

function removeFiles(deadFiles: string[]) {
  deadFiles.forEach(file => {
    fs.unlink(file, (err) => {
      if (err) {
        console.log(`${file}: delete failed.`);
        throw err;
      }
    });
  });
}
