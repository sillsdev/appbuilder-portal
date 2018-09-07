import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers/index';


import page from './page';

describe('Acceptance | Project View | Settings toggles', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('Toggle default to true', () => {

    beforeEach(function () {
      this.mockGet(200, 'users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, 'projects/1', {
        data: {
          type: 'projects',
          id: '1',
          attributes: {
            'automaticBuilds': true,
            'allowDownloads': true
          },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
            group: { data: { id: 1, type: 'groups' } },
            owner: { data: { id: 2, type: 'users' } }
          }
        },
        included: [
          { type: 'organizations', id: 1, },
          { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
          { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
        ]
      });
    });

    beforeEach(async function () {
      await visit('/project/1');
    });

    it('Toggles are on', () => {
      expect(location().pathname).to.equal('/project/1');
      expect(page.isAutomaticRebuildChecked).to.be.true;
      expect(page.isAllowDownloadChecked).to.be.true;
    });
  });
});