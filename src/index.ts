const path = require('path');
const glob = require('fast-glob');

interface IOptions {
  include: string[];
  exclude: string[];
  globOptions: any;
}
interface ICompiler {
  hooks: {
    afterEmit: {
      tapAsync: (name: string, callback: Function) => void;
    }
  };
  plugin: (
    eventName: 'after-emit',
    callback: (compilation: ICompilation, doneFn: Function) => void
  ) => void;
}
interface ICompilation {
  fileDependencies: any;
  assets: any;
}

/**
 * 获取文件依赖关系map
 * @param compilation 
 */
function getFileDepsMap (compilation: ICompilation) {
  const resMap = Array.from(compilation.fileDependencies).reduce((total: Map<string, boolean>, usedFilePath) => {
    total.set(usedFilePath as string, true);
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
function getIncludeFiles (options: IOptions) {
  const { include, exclude } = options;
  const fileList = include.concat(exclude.map((item: string) => `!${item}`));
  return glob.sync(fileList, options.globOptions)
             .map((filePath: string) => path.resolve(process.cwd(), filePath));
}

function applyAfterEmit (options: IOptions, compilation: ICompilation) {
  const usedFileDeps = getFileDepsMap(compilation);
  const includeFiles = getIncludeFiles(options);

  const deadFiles = includeFiles.filter((file: string) => !usedFileDeps.has(file));

  console.log('\n--------------------- Unused Files ---------------------');
  if (!deadFiles.length) {
    console.log('\x1B[32m%s\x1B[0m', '\nPerfect, there is nothing to do ٩(◕‿◕｡)۶.');
    return;
  }
  deadFiles.forEach((file: string) => console.log('\x1B[33m%s\x1B[0m', `\n${file}`));
  console.log('\x1B[33m%s\x1B[0m', `\nThere are ${deadFiles.length} unused files (¬º-°)¬.`);
  console.log('\x1B[31m%s\x1B[0m', '\n\nPlease be careful if you want to remove them.\n');
}

class SxfDeadfilePlugin {
  options: IOptions;

  constructor (options: IOptions) {
    this.options = {
      ...options,
      include: options.include || ['src/**/*'],
      exclude: ['node_modules/**/*'].concat(options.exclude),
      globOptions: options.globOptions || {}
    };
  }

  apply (compiler: ICompiler) {

    // webpack 4
    if (compiler.hooks) {
      compiler.hooks.afterEmit.tapAsync('SxfDeadfilePlugin', this.onAfterEmit.bind(this, this.options));
    } else {

      // webpack 3
      compiler.plugin('after-emit', this.onAfterEmit.bind(this, this.options));
    }
  }

  onAfterEmit (options: IOptions, compilation: ICompilation, doneFn: Function) {
    applyAfterEmit(options, compilation);
    doneFn();
  }
}

module.exports = SxfDeadfilePlugin;
