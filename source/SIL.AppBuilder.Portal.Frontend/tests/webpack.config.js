/* eslint-disable */

var path = require("path");
var webpack = require("webpack");

function locate(path) {
  return process.cwd() + '/' + path;
}

module.exports = {
  mode: 'development',
  context: process.cwd(),
  entry: locate('tests/index.ts'),
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        use: 'ts-loader',
        exclude: [/node_modules/, /dist/, /\.cache/]
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@store': locate('src/redux-store'),
      '@ui': locate('src/ui'),
      '@lib': locate('src/lib'),
      '@env': locate('src/env.ts'),
      'tests': locate('tests'),
      'vendor': locate('src/vendor'),
      'example-app': locate('src'),
      'example-app/src': locate('src'),
    }
  },
  output: {
    filename: 'test-bundle.js',
    path: process.cwd() + '/dist',
  }
};
