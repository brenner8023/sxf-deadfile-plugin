# sxf-deadfile-plugin

一款可以扫描项目僵尸文件的 webpack 插件

## 使用方法

`webpack.prod.config.js`：

```js
const SxfDeadfilePlugin = require("./dist/index.js").default;

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "bundle.[hash].js",
    path: path.resolve("dist"),
  },
  plugins: [
    new SxfDeadfilePlugin({
      include: ["src/components/**/*.(js|ts|vue)", "src/style/**/*"],
      exclude: ["node_modules/**/*"],
    }),
  ],
};
```
