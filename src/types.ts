import FastGlob from 'fast-glob';

export interface IOptions {

  // @default ['src/**/*']
  include?: string[];

  // @default ['node_modules/**/*']
  exclude?: string[];

  /**
   * @default false
   */
  delete?: boolean;
  globOptions?: FastGlob.Options;
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