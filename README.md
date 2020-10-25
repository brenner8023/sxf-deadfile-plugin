# sxf-deadfile-plugin

一款可以扫描项目僵尸文件的webpack插件

## 使用方法
`webpack.prod.config.js`：
```js
const SxfDeadfilePlugin = require('sxf-deadfile-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle.[hash].js',
    path: path.resolve('dist')
  },
  plugins: [
    new SxfDeadfilePlugin({
      include: ['src/home/**/*.(js|ts|vue)', 'src/style/**/*'],
      exclude: ['node_modules/**/*']
    })
  ]
};
```