import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers/index';


describe('Acceptance | Archive Project', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function () {

    this.mockGet(200, 'organizations', {
      data: [{
        type: 'organizations',
        id: 1,
        attributes: {}
      }]
    });

    this.mockGet(200, 'projects/1?include=organization', {
      data: [{
        type: 'projects',
        id: 1,
        attributes: {
          'date-archived': null
        }
      }]
    });
  });

  describe('navigates to project', () => {
    beforeEach(async function () {
      await visit('/project/1');
    });
  });


})