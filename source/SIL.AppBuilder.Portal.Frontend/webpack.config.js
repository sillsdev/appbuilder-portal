/* eslint-disable */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRootPlugin = require('html-webpack-root-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const webpack = require('webpack');
const dotenv = require('dotenv');

const {
  locate, plugins, moduleRules, resolver,
  environment, isProduction, isDevelopment
} = require('./config/webpack.common.js');

if (isDevelopment) {
  const dotenvPath = locate('.env.dev');
  const result = dotenv.config({ path: dotenvPath });

  if(result.error) throw result.error;
}

function checkEnvVar(varName) {
  if (!process.env[varName]) {
    console.error(`${varName} is not defined!`);
    process.exit(1);
  }
}

// sorry for the serial env var checking.
checkEnvVar('AUTH0_CLIENT_ID');
checkEnvVar('AUTH0_DOMAIN');
checkEnvVar('AUTH0_CONNECTION');

let config = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'none' : 'inline-source-map',
  context: process.cwd(),
  entry: {
    app: locate('src/index.tsx'),
    WorkflowApp: locate('src/ui/routes/workflow/app.tsx'),
  },
  module: {
    rules: moduleRules
  },
  resolve: resolver,
  output: {
    path: locate('dist'),
    publicPath: '/',
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[hash].js'
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Scriptoria',
      meta: {
        viewport: 'width=device-width,initial-scale=1,shrink-to-fit=no',
      },
    }),
    new ReactRootPlugin(),
    // source maps!
    // new webpack.SourceMapDevToolPlugin({

    // }),
    ...plugins
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      // maxInitialRequests: Infinity,
      // minSize: 500,
      // cacheGroups: {
      //   dwkitDependencies: {
      //     test(module, chunks) {
      //       return 
      //     }
      //   }
      // }
      // cacheGroups: {
      //   vendors: {
      //     test: /[\\/]node_modules[\\/]/,
      //     enforce: true,
      //     chunks: 'all',
      //     name: 'vendor',
      //     // name(module) {
      //     //   // get the name. E.g. node_modules/packageName/not/this/part.js
      //     //   // or node_modules/packageName
      //     //   const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

      //     //   // npm package names are URL-safe, but some servers don't like @ symbols
      //     //   return `npm.${packageName.replace('@', '')}`;
      //     // },
      //   }
      // }
    }
  }
};

if (isDevelopment) {
  config.plugins = config.plugins.concat([
    new ForkTsCheckerWebpackPlugin(),
    // new BundleAnalyzerPlugin(),
    new webpack.HotModuleReplacementPlugin({
      // Options...
    }),
  ]);

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
      context: ['/api', '/ui', '/configapi', '/account', '/data', '/workflow'],
      target: `http://${process.env.API_HOST}`
    }]
  }
}

module.exports = config;
