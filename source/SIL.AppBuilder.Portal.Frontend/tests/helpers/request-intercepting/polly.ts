import { Polly } from '@pollyjs/core';

// inspiration from:
// https://github.com/Netflix/pollyjs/blob/master/packages/%40pollyjs/core/src/test-helpers/mocha.js
export function setupRequestInterceptor(config: any = {}) {
  beforeEach(function() {
    const name = generateRecordingName(this);
    const pollyConfig = {
      mode: 'replay',
      logging: true,
      recordIfMissing: false,
      // persisterOptions: {
      //   host: 'http://localhost:3000',
      // },
      matchRequestBy: {
        order: false,
        url: {
          port: false,
          hostname: false,
          protocol: false,
        }
      },
      ...config
    };

    this.polly = new Polly(name, pollyConfig);

    const { server } = this.polly;

    // by default? stub out auth0 so that auth0/lock.js doesn't
    // try to contact auth0 during testing.
    server.options('/api/*anypath').intercept((req, res) => {
      console.log('req', req);
      req.headers.Allow = 'OPTIONS, GET, HEAD, POST, PUT, PATCH, DELETE, TRACE';
    });

    server.get('https://cdn.auth0.com/*path').intercept((req, res) => {
      res.status(200);
      res.json({});
    });
  });

  afterEach(async function() {
    await this.polly.stop();
  });
}


// helpers stolen from:
// https://github.com/Netflix/pollyjs/blob/master/packages/%40pollyjs/core/src/test-helpers/lib.js
export function generateRecordingName(context) {
  const { currentTest } = context;
  const parts = [currentTest.title];
  let parent = currentTest.parent;

  while (parent && parent.title) {
    parts.push(parent.title);
    parent = parent.parent;
  }

  return parts.reverse().join('/');
}
