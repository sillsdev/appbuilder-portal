/* eslint-disable */
const dotenv = require('dotenv');

const {
  locate, plugins, moduleRules, resolver,
  environment, isProduction, isDevelopment
} = require('../config/webpack.common.js');

if (isDevelopment) {
  const dotenvPath = locate('tests/.env.test');
  const result = dotenv.config({ path: dotenvPath });

  if(result.error) throw result.error;
}

if (process.env.COVERAGE) {
  moduleRules.push({
    enforce: 'post',
    test: /\.(t|j)sx?$/,
    use: [{
      loader: 'istanbul-instrumenter-loader'
    }],
    exclude: [/node_modules/],
  });
}

module.exports = {
  mode: environment,
  devtool: 'inline-source-map',
  context: process.cwd(),
  entry: locate('tests/index.ts'),
  module: {
    rules: moduleRules
  },
  resolve: resolver,
  output: {
    filename: 'test-bundle-[name].js',
    path: process.cwd() + '/dist'
  },
  plugins: [
    ...plugins,
  ],
  // optimization: {
    // runtimeChunk: 'single',
    // in order to reduce load on the browser tools for faster debugging
    // splitChunks: {
    //   chunks: 'all',
    //   maxInitialRequests: Infinity,
    //   minSize: 0,
    //   cacheGroups: {
    //     vendor: {
    //       test: /[\\/]node_modules[\\/]/,
    //       name(module) {
    //         // get the name. E.g. node_modules/packageName/not/this/part.js
    //         // or node_modules/packageName
    //         const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

    //         // npm package names are URL-safe, but some servers don't like @ symbols
    //         return `npm.${packageName.replace('@', '')}`;
    //       },
    //     }
    //   }
    // },
  // }
};
