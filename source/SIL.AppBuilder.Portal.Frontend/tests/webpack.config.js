/* eslint-disable */

const {
  locate, moduleRules, resolver,
  environment, isProduction
} = require('../config/webpack.common.js');

module.exports = {
  mode: environment,
  context: process.cwd(),
  entry: locate('tests/index.ts'),
  module: {
    rules: moduleRules
  },
  resolve: resolver,
  output: {
    filename: 'test-bundle.js',
    path: process.cwd() + '/dist'
  }
};
