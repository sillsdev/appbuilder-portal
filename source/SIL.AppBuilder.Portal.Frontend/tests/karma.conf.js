
var path = require("path");
var root = path.resolve(__dirname, '..');

console.log('root path: ', root);

const TEST_PORT = 9876;

// process.env.API_HOST = `localhost:${TEST_PORT}`;

module.exports = function(config) {
  config.set({
    singleRun: false,
    retryLimit: 20, // hack around concurrency issues....
    concurrency: 1,
    basePath: '',
    frameworks: [
      'mocha',
     ],
    reporters: [ 'mocha' ],
    browsers: ['Chrome'],
    mime: { 'text/x-typescript': ['ts','tsx'] },

    port: TEST_PORT,
    colors: true,
    logLevel: 'DEBUG',

    files: [
      { pattern: path.resolve(root, 'tests/index.ts'), watched: false }
    ],

    exclude: [
      `${root}/dist`,
      `${root}/.cache`,
    ],

    preprocessors: {
      [`${root}/tests/index.ts`]: [
        'webpack',
      ],
    },

    client: {
      mocha: {
        reporter: 'html',
        ui: 'bdd',
        globals: false,
        opts: root + '/tests/mocha.opts'
      },
    },

    webpack: require(__dirname + '/webpack.config.js'),
    webpackMiddleware: { stats: 'minimal' },
    plugins: [
      'karma-mocha',
      'karma-webpack',
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
    ],
  });

  if (process.env.DETACHED) {
    config.customLaunchers = {};
    config.browsers = [];
  }

  if (process.env.CI) {
    config.customLaunchers = {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox', // required to run without privileges in Docker
          '--disable-web-security',
          '--disable-gpu',
          '--disable-extensions',
          '--window-size=1280,720'
        ]
      },
      FirefoxHeadless: {
        base: 'Firefox',
        flags: [ '-headless' ],
      },
    };

    config.browsers = ['ChromeHeadlessNoSandbox'];
    // config.browsers = ['FirefoxHeadless'];
    config.colors = true;
  }
};
