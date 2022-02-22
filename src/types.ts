import FastGlob from 'fast-glob';

export interface IOptions {
  include: string[];
  exclude: string[];
  globOptions: FastGlob.Options;
}

export interface ICompiler {
  hooks: {
    afterEmit: {
      tapAsync: (name: string, callback: Function) => void;
    },
  };
  plugin: (
    eventName: 'after-emit',
    callback: (compilation: ICompilation, doneFn: Function) => void,
  ) => void;
}

export interface ICompilation {
  fileDependencies: any;
  assets: any;
}