import { Polly } from '@pollyjs/core';
import * as XHRAdapter from '@pollyjs/adapter-xhr';
import * as FetchAdapter from '@pollyjs/adapter-fetch';

import Orbit from '@orbit/data';
/*
  Register the adapters and persisters we want to use. This way all future
  polly instances can access them by name.
*/
Polly.register(XHRAdapter);
Polly.register(FetchAdapter);

// inspiration from:
// https://github.com/Netflix/pollyjs/blob/master/packages/%40pollyjs/core/src/test-helpers/mocha.js
export function setupRequestInterceptor(config: any = {}) {
  beforeEach(function() {
    const name = generateRecordingName(this);
    const pollyConfig = {
      // passthorugh bypasses Polly's request recording feature
      mode: 'passthrough',
      adapters: ['fetch', 'xhr'],
      adapterOptions: {
        fetch: {
          context: window
        }
      },
      logging: true,
      recordFailedRequests: false,
      recordIfMissing: false,
      matchRequestsBy: {
        order: false,
      },
      ...config
    };

    this.polly = new Polly(name, pollyConfig);

    Orbit.fetch = window.fetch.bind(window);

    const { server } = this.polly;

    // by default? stub out auth0 so that auth0/lock.js doesn't
    // try to contact auth0 during testing.
    server.options('*anypath').intercept((req, res) => {
      req.headers.Allow = 'OPTIONS, GET, HEAD, POST, PUT, PATCH, DELETE, TRACE';
    });

    server.host('https://cdn.auth0.com', () => {
      server.get('*').on('request', (req, res) => {
        res.status(200);
        res.json({});
      });
    });
  });

  afterEach(async function() {
    await this.polly.stop();

    Object.defineProperty(context, 'polly', {
      enumerable: true,
      configurable: true,
      get() {
        throw new Error(
          `[Polly] You are trying to access an instance of Polly that is no longer available.\n`
        );
      }
    });
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
