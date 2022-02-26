var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => SxfDeadfilePlugin
});
var import_path = __toESM(require("path"));
var import_fast_glob = __toESM(require("fast-glob"));
var import_fs = __toESM(require("fs"));
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
  return import_fast_glob.default.sync(fileList, options.globOptions).map((filePath) => import_path.default.resolve(process.cwd(), filePath));
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
    import_fs.default.unlink(file, (err) => {
      if (err) {
        console.log(`${file}: delete failed.`);
        throw err;
      }
    });
  });
}
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
