"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var path = require('path');
var glob = require('fast-glob');
/**
 * 获取文件依赖关系map
 * @param compilation
 */
function getFileDepsMap(compilation) {
    var resMap = Array.from(compilation.fileDependencies).reduce(function (total, usedFilePath) {
        total.set(usedFilePath, true);
        return total;
    }, new Map());
    var assets = compilation.assets;
    Object.keys(assets).forEach(function (assetRelpath) {
        var existsAt = assets[assetRelpath].existsAt;
        resMap.set(existsAt, true);
    });
    return resMap;
}
/**
 * 获取指定目录下的所有指定文件
 * @param options
 */
function getIncludeFiles(options) {
    var include = options.include, exclude = options.exclude;
    var fileList = include.concat(exclude.map(function (item) { return "!" + item; }));
    return glob.sync(fileList, options.globOptions)
        .map(function (filePath) { return path.resolve(process.cwd(), filePath); });
}
function applyAfterEmit(options, compilation) {
    var usedFileDeps = getFileDepsMap(compilation);
    var includeFiles = getIncludeFiles(options);
    var deadFiles = includeFiles.filter(function (file) { return !usedFileDeps.has(file); });
    console.log('\n--------------------- Unused Files ---------------------');
    if (!deadFiles.length) {
        console.log('\x1B[32m%s\x1B[0m', '\nPerfect, there is nothing to do ٩(◕‿◕｡)۶.');
        return;
    }
    deadFiles.forEach(function (file) { return console.log('\x1B[33m%s\x1B[0m', "\n" + file); });
    console.log('\x1B[33m%s\x1B[0m', "\nThere are " + deadFiles.length + " unused files (\u00AC\u00BA-\u00B0)\u00AC.");
    console.log('\x1B[31m%s\x1B[0m', '\n\nPlease be careful if you want to remove them.\n');
}
var SxfDeadfilePlugin = /** @class */ (function () {
    function SxfDeadfilePlugin(options) {
        this.options = __assign(__assign({}, options), { include: options.include || ['src/**/*'], exclude: ['node_modules/**/*'].concat(options.exclude), globOptions: options.globOptions || {} });
    }
    SxfDeadfilePlugin.prototype.apply = function (compiler) {
        // webpack 4
        if (compiler.hooks) {
            compiler.hooks.afterEmit.tapAsync('SxfDeadfilePlugin', this.onAfterEmit.bind(this, this.options));
        }
        else {
            // webpack 3
            compiler.plugin('after-emit', this.onAfterEmit.bind(this, this.options));
        }
    };
    SxfDeadfilePlugin.prototype.onAfterEmit = function (options, compilation, doneFn) {
        applyAfterEmit(options, compilation);
        doneFn();
    };
    return SxfDeadfilePlugin;
}());
module.exports = SxfDeadfilePlugin;
