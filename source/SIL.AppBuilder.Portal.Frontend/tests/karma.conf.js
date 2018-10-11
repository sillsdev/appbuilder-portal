
var path = require("path");
var root = path.resolve(__dirname, '..');

console.log('root path: ', root);

const TEST_PORT = 9876;

// process.env.API_HOST = `localhost:${TEST_PORT}`;

module.exports = function(config) {
  config.set({
    port: TEST_PORT,
    colors: true,
    logLevel: 'DEBUG',
    singleRun: false,
    retryLimit: 20, // hack around concurrency issues....
    concurrency: 1,
    basePath: '',
    frameworks: [
      'mocha',
     ],
    reporters: [
      'mocha',
      'coverage-istanbul',
      // 'coverage',
      // 'remap-coverage'
    ],
    browsers: ['Chrome'],
    mime: { 'text/x-typescript': ['ts','tsx'] },
    // coverageReporter: {
    //   type : 'in-memory',
    // },
    // remapCoverageReporter: {
    //   html: path.resolve(root, './coverage')
    // },

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
        // 'sourcemap',
        // 'coverage'
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

    coverageIstanbulReporter: {
      reports: ['html', 'lcov', 'text-summary'],
      dir: path.join(root, './coverage'),
      combineBrowserReports: true,
      fixWebpackSourcePaths: true,
      skipFilesWithNoCoverage: false,
      'report-config': {
        html: { subdir: 'html' }
      },
      thresholds: {
        emitWarning: true,
        global: {
          statements: 85,
          lines: 85,
          branches: 75,
          functions: 85
        }
      }
    },

    webpack: require(path.join(root, './tests/webpack.config.js')),
    webpackMiddleware: { stats: 'minimal' },
    plugins: [
      'karma-mocha',
      'karma-webpack',
      // 'karma-coverage',
      // 'karma-sourcemap-loader',
      'karma-coverage-istanbul-reporter',
      // 'karma-remap-coverage',
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
