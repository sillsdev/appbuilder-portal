const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const path = require("path");
const webpack = require("webpack");

function locate(path) {
  return process.cwd() + '/' + path;
}

const environment = process.env.NODE_ENV || 'development';
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
      "sass-loader", // compiles Sass to CSS
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
    }),
  ]
};

const plugins = [
  new webpack.EnvironmentPlugin([
    "AUTH0_CONNECTION",
    "AUTH0_DOMAIN",
    "AUTH0_CLIENT_ID",
    "AUTH0_SCOPE",
    "API_HOST",
    "HAS_API"
  ])
];

module.exports = {
  locate,
  moduleRules,
  resolver,
  environment,
  isProduction,
  isDevelopment,
  plugins,
}
