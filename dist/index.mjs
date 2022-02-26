var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/index.ts
import path from "path";
import glob from "fast-glob";
import fs from "fs";
var SxfDeadfilePlugin = class {
  constructor(options) {
    var _a, _b;
    this.options = __spreadProps(__spreadValues({}, options), {
      include: (_a = options.include) != null ? _a : ["src/**/*"],
      exclude: (_b = options.exclude) != null ? _b : ["node_modules/**/*"],
      globOptions: options.globOptions
    });
  }
  apply(compiler) {
    if (compiler.hooks) {
      compiler.hooks.afterEmit.tapAsync("SxfDeadfilePlugin", this.onAfterEmit.bind(this, this.options));
    } else {
      compiler.plugin("after-emit", this.onAfterEmit.bind(this, this.options));
    }
  }
  onAfterEmit(options, compilation, doneFn) {
    applyAfterEmit(options, compilation);
    doneFn();
  }
};
function getFileDepsMap(compilation) {
  const resMap = Array.from(compilation.fileDependencies).reduce((total, usedFilePath) => {
    total.set(usedFilePath, true);
    return total;
  }, /* @__PURE__ */ new Map());
  const { assets } = compilation;
  Object.keys(assets).forEach((assetRelpath) => {
    const existsAt = assets[assetRelpath].existsAt;
    resMap.set(existsAt, true);
  });
  return resMap;
}
function getIncludeFiles(options) {
  const { include, exclude } = options;
  const fileList = include.concat(exclude.map((item) => `!${item}`));
  return glob.sync(fileList, options.globOptions).map((filePath) => path.resolve(process.cwd(), filePath));
}
function applyAfterEmit(options, compilation) {
  const usedFileDeps = getFileDepsMap(compilation);
  const includeFiles = getIncludeFiles(options);
  const deadFiles = includeFiles.filter((file) => !usedFileDeps.has(file));
  if (options.delete) {
    removeFiles(deadFiles);
  }
  console.log("\n--------------------- Unused Files ---------------------");
  if (!deadFiles.length) {
    console.log("\x1B[32m%s\x1B[0m", "\nPerfect, there is nothing to do \u0669(\u25D5\u203F\u25D5\uFF61)\u06F6.");
    return;
  }
  deadFiles.forEach((file) => console.log("\x1B[33m%s\x1B[0m", `
${file}`));
  console.log("\x1B[33m%s\x1B[0m", `
There are ${deadFiles.length} unused files (\xAC\xBA-\xB0)\xAC.`);
  console.log("\x1B[31m%s\x1B[0m", "\n\nPlease be careful if you want to remove them.\n");
}
function removeFiles(deadFiles) {
  deadFiles.forEach((file) => {
    fs.unlink(file, (err) => {
      if (err) {
        console.log(`${file}: delete failed.`);
        throw err;
      }
    });
  });
}
export {
  SxfDeadfilePlugin as default
};
