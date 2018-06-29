const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const path = require("path");
const webpack = require("webpack");

function locate(path) {
  return process.cwd() + '/' + path;
}

const environment = process.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isDevelopment = environment === 'development';

const moduleRules = [
  {
    test: /\.(t|j)sx?$/,
    use: [{
      loader: 'ts-loader',
      options: {
        transpileOnly: true
      }
    }],
    exclude: [/node_modules/, /dist/, /\.cache/],
  },
  {
    test: /\.s?css$/,
    include: [/node_modules/, /src/],
    use: [
      "style-loader", // creates style nodes from JS strings
      "css-loader", // translates CSS into CommonJS
      "sass-loader" // compiles Sass to CSS
    ]
  },
  {
    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
    loader: 'url-loader?limit=100000'
  }
];

const resolver = {
  extensions: ['.tsx', '.ts', '.js', '.jsx'],
  plugins: [
    new TsconfigPathsPlugin({
      configFile: locate('tsconfig.json')
    })
  ],
  alias: {
    "@data": locate("src/data"),
    "@api": locate('src/data/api'),
    "@models": locate('src/data/models'),
    '@store': locate('src/redux-store'),
    '@ui': locate('src/ui'),
    '@lib': locate('src/lib'),
    '@env': locate('src/env.ts'),
    'tests': locate('tests'),
    'vendor': locate('src/vendor'),
    'example-app': locate('src'),
    'example-app/src': locate('src'),
  }
};


module.exports = {
  locate,
  moduleRules,
  resolver,
  environment,
  isProduction,
  isDevelopment
}
