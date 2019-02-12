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
    // WorkflowApp: locate('src/ui/routes/workflow/app.tsx'),
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
        favicon: '/favicon.ico',
        viewport: 'width=device-width,initial-scale=1,shrink-to-fit=no',
      },
    }),
    new ReactRootPlugin(),
    ...plugins
  ],
  optimization: {
    // TODO: figure out how to make multiple vendor splits
    //       based on which entry is using what dependencies
    runtimeChunk: 'single',
    sideEffects: false,
    splitChunks: {
      cacheGroups: {
				commons: {
					chunks: "initial",
					minChunks: 2,
					maxInitialRequests: 10, // The default limit is too small to showcase the effect
					minSize: 200 // This is example is too small to create commons chunks
				},
				vendor: {
					test: /node_modules/,
					chunks: "initial",
					name: "vendor",
					priority: 10,
					enforce: true
				}
      },
    },
  },
};

if (isDevelopment) {
  config.plugins = config.plugins.concat([
    // new ForkTsCheckerWebpackPlugin(),
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
    disableHostCheck: true,
    inline: true,
    overlay: true,
    progress: true,
    proxy: [{
      context: ['/api', '/ui', '/configapi', '/account', '/data', '/workflow', '/hubs'],
      target: `http://${process.env.API_HOST}`,
      ws: true
    }]
  }
}

module.exports = config;
