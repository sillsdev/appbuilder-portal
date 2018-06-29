/* eslint-disable */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

const {
  locate, moduleRules, resolver,
  environment, isProduction, isDevelopment
} = require('./config/webpack.common.js');

let config = {
  mode: isProduction ? 'production' : 'development',
  context: process.cwd(),
  entry: {
    app: locate('src/index.tsx'),
  },
  module: {
    rules: moduleRules
  },
  resolve: resolver,
  output: {
    path: locate('dist'),
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[hash].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: locate('src/index.html'),
    }),
    // sep-thread type checking
    new ForkTsCheckerWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin({
      // Options...
    }),
    new webpack.EnvironmentPlugin([
      "AUTH0_CONNECTION",
      "AUTH0_DOMAIN",
      "AUTH0_CLIENT_ID",
      "AUTH0_SCOPE",
      "API_HOST",
      "HAS_API"
    ])
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          enforce: true,
          chunks: 'all'
        }
      }
    }
  }
};

if (isDevelopment) {
  config.devtool = 'cheap-module-eval-source-map';
  config.devServer = {
    contentBase: locate('dist'),
    port: process.env.PORT,
    host: '0.0.0.0',
    hot: true,
    historyApiFallback: true,
    // hotOnly: true,
    inline: true,
    overlay: true,
    progress: true,
    proxy: [{
      context: ['/api', '/ui', '/configapi'],
      target: `http://${process.env.API_HOST}`
    }]
  }
}

module.exports = config;
