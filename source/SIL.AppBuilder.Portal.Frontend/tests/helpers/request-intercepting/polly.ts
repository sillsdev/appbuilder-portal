import { Polly } from '@pollyjs/core';
import * as XHRAdapter from '@pollyjs/adapter-xhr';
import * as FetchAdapter from '@pollyjs/adapter-fetch';
import Orbit from '@orbit/data';

import { roles } from '../fixtures';

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
    },
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
        context: window,
      },
    },
    persisterOptions: {
      keepUnusedRequests: false,
    },
    // logging: true,
    recordFailedRequests: false,
    recordIfMissing: false,
    recordIfExpired: false,
    matchRequestsBy: {
      order: false,
      // headers: false,
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
    ...config,
  };

  this.polly = new Polly(name, pollyConfig);
  this.polly.configure(pollyConfig);

  global.fetch = Orbit.fetch = window.fetch.bind(window);

  const { server } = this.polly;

  this.mockGet = mockGet(server);
  this.mockPatch = mockPatch(server);
  this.mockPost = mockPost(server);
  this.mockDelete = mockDelete(server);

  this.server = server;

  // by default? stub out auth0 so that auth0/lock.js doesn't
  // try to contact auth0 during testing.
  server.options('*anypath').intercept((req, res) => {
    req.headers.Allow = 'OPTIONS, GET, HEAD, POST, PUT, PATCH, DELETE, TRACE';
  });

  // by default, unless overridden manually, we should force a 401 on current-user
  this.mockGet(401, '/users/current-user');

  this.mockGet(200, '/user-tasks', { data: [] });
  this.mockGet(200, '/notifications', { data: [] });

  server.get('/assets/language/alltags.json').intercept((req, res) => {
    res.status(200);
    res.json([]);
  });

  server.get('/assets/language/en-US/ldml.json').intercept((req, res) => {
    res.status(200);
    res.json({ localeDisplayNames: {} });
  });

  server.get('/assets/language/es-419/ldml.json').intercept((req, res) => {
    res.status(200);
    res.json({});
  });

  server.get('/assets/language/fr-FR/ldml.json').intercept((req, res) => {
    res.status(200);
    res.json({});
  });

  this.mockGet(200, '/roles', {
    data: [roles.superAdmin, roles.orgAdmin, roles.appBuilder],
    meta: { 'total-records': 3 },
  });
};
