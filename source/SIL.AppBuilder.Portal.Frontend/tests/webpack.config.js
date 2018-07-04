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
  },
  plugins
};
