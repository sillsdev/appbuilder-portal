import { Polly } from '@pollyjs/core';

// inspiration from:
// https://github.com/Netflix/pollyjs/blob/master/packages/%40pollyjs/core/src/test-helpers/mocha.js
export function setupRequestInterceptor(config: any = {}) {
  beforeEach(async function() {
    const name = generateRecordingName(this);
    const pollyConfig = {
      mode: 'replay',
      logging: true,
      recordIfMissing: false,
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

    // await pollyBeforeEach(this, name, pollyConfig);
    this.polly = new Polly(name, pollyConfig);

    const { server } = this.polly;

    // by default? stub out auth0 so that auth0/lock.js doesn't
    // try to contact auth0 during testing.
    // server.options('*anypath').intercept((req, res) => {
    //   console.log('req', req);
    //   req.headers['Allow'] = 'OPTIONS, GET, HEAD, POST, PUT, PATCH, DELETE, TRACE';
    // });

    server.get('https://cdn.auth0.com/*path').intercept((req, res) => {
      res.status(200);
      res.json({});
    });
  });

  afterEach(async function() {
    // await pollyAfterEach(this, 'mocha');
    await this.polly.stop();
  });
}


// helpers stolen from:
// https://github.com/Netflix/pollyjs/blob/master/packages/%40pollyjs/core/src/test-helpers/lib.js
//
// because we want to make our own setup helper, and polly doesn't export
// the underlying tools to do that. :-\
const { defineProperty } = Object;

export async function pollyBeforeEach(context, recordingName, defaults) {
  defineProperty(context, 'polly', {
    writable: true,
    enumerable: true,
    configurable: true,
    value: new Polly(recordingName, defaults)
  });
}

export async function pollyAfterEach(context, framework) {
  await context.polly.stop();

  defineProperty(context, 'polly', {
    enumerable: true,
    configurable: true,
    get() {
      throw new Error(
        `[Polly] You are trying to access an instance of Polly that is no longer available.\n` +
          `See: https://netflix.github.io/pollyjs/#/test-helpers/${framework}?id=test-hook-ordering`
      );
    }
  });
}


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
