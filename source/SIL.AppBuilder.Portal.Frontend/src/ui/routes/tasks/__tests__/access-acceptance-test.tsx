import * as React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest, setupRequestInterceptor, useFakeAuthentication
} from 'tests/helpers/index';

import { setToken, deleteToken, isLoggedIn } from '@lib/auth0';

describe('Acceptance | Accessing Tasks', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  describe('is authenticated', () => {
    useFakeAuthentication();

    beforeEach(async () => {
      const { server } = this.polly;

      // server.options('http://localhost/api/users/current-user').intercept((req, res) => {
      //   req.headers['Allow'] = 'OPTIONS, GET, HEAD, POST, PUT, PATCH, DELETE, TRACE';
      // });

      server.get('/api/users/*current-user').intercept((req, res) => {
        res.status(200);
        res.json({
          data: {
            attributes: { id: 1, auth0Id: 'my-fake-auth0Id' }
          }
        });
      });

      await visit('/tasks');

      expect(location().pathname).to.equal('/tasks');
    });

    it('loads the the current user', () => {
      const text =  document.querySelector('section.flex.flex-grow').textContent;

      expect(text).to.not.include('what should we do here before we get the current user?');
    });
  });
});
