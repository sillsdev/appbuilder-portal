import { Polly } from '@pollyjs/core';
import * as XHRAdapter from '@pollyjs/adapter-xhr';
import * as FetchAdapter from '@pollyjs/adapter-fetch';

import Orbit from '@orbit/data';

import { mockGet, mockPatch, mockPost, mockDelete } from './requests';

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
    this.setupIntercepting = () => setup.call(this, config);
    this.teardownIntercepting = () => teardown.call(this, context);

    this.setupIntercepting(config);
  });

  afterEach(async function() {
    await this.teardownIntercepting();
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

const teardown = async function(context) {
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

};

const setup = function(config) {
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
    // logging: true,
    recordFailedRequests: false,
    recordIfMissing: false,
    matchRequestsBy: {
      order: false,
      headers: true,
      // url: {
      //   protocol: true,
      //   username: true,
      //   password: true,
      //   hostname: true,
      //   port: true,
      //   pathname: true,
      //   query: true,
      //   hash: false
      // }
    },
    ...config
  };

  this.polly = new Polly(name, pollyConfig);

  Orbit.fetch = window.fetch.bind(window);

  const { server } = this.polly;

  this.mockGet = mockGet(server);
  this.mockPatch = mockPatch(server);
  this.mockPost = mockPost(server);
  this.mockDelete = mockDelete(server);
  this.stubOrbit = () => Orbit.fetch = window.fetch;
  this.debugFetch = () => {
    const originalFetch = window.fetch;
    const fakeFetch = (...args) => {
      // debugger;
      return originalFetch(...args);
    };

    window.fetch = fakeFetch.bind(window);
    Orbit.fetch = fakeFetch.bind(window);
  };

  // by default? stub out auth0 so that auth0/lock.js doesn't
  // try to contact auth0 during testing.
  server.options('*anypath').intercept((req, res) => {
    req.headers.Allow = 'OPTIONS, GET, HEAD, POST, PUT, PATCH, DELETE, TRACE';
  });

  // This won't work unless we create a polly adapter for
  // https://github.com/auth0/auth0.js/blob/fb53e8c318416ab1b29c99907a9e3cf63fe25164/src/helper/request-builder.js
  // server.host('https://cdn.auth0.com', () => {
  //   server.get('*').on('request', (req, res) => {
  //     res.status(200);
  //     res.headers['Content-Type'] = 'application/x-javascript; charset=utf-8';
  //     res.send(
  //       'Auth0.setClient({"id":"n8IAE2O17FBrlQ667x5mydhpqelCBUWG","tenant":"sil-appbuilder","subscription":"oss","authorize":"https://sil-appbuilder.auth0.com/authorize","callback":"http://localhost:1234","hasAllowedOrigins":true,"strategies":[{"name":"auth0","connections":[{"name":"Username-Password-Authentication","forgot_password_url":"https://login.auth0.com/lo/forgot?wtrealm=urn:auth0:sil-appbuilder:Username-Password-Authentication","signup_url":"https://login.auth0.com/lo/signup?wtrealm=urn:auth0:sil-appbuilder:Username-Password-Authentication","passwordPolicy":"good","showSignup":true,"showForgot":true}]},{"name":"email","connections":[{"name":"email"}]},{"name":"google-oauth2","connections":[{"name":"google-oauth2","scope":["email","profile"]}]},{"name":"samlp","connections":[{"name":"SIL-IdP-Hub"}]}]});'
  //     );
  //   });
  // });

};

