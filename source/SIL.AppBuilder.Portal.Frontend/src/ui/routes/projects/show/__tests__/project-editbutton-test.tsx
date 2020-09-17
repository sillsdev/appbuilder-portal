import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import { setupApplicationTest, useFakeAuthentication } from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Project view | project edit button', () => {
  useFakeAuthentication();
  setupApplicationTest();
  describe('Navigate to a project view with visibility set as Public', () => {
    beforeEach(function() {
      this.mockGet(200, '/users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, '/projects/2', {
        data: {
          type: 'projects',
          id: '2',
          attributes: {
            name: 'Fake project',
            isPublic: true,
            language: 'en',
          },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
            group: { data: { id: 1, type: 'groups' } },
            owner: { data: { id: 2, type: 'users' } },
            type: { data: { id: 1, type: 'application-types' } },
          },
        },
        included: [
          { type: 'organizations', id: 1 },
          { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
          { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
          {
            type: 'application-types',
            id: 1,
            attributes: {
              name: 'dictionaryappbuilder',
              description: 'Dictionary App Builder',
            },
          },
        ],
      });
    });

    beforeEach(async function() {
      await visit('/projects/2');
    });

    it('is in project page', () => {
      expect(location().pathname).to.equal('/projects/2');
    });

    describe('When you press the project edit button', () => {
      beforeEach(async function() {
        await page.clickEditLink();
      });

      it('is in project edit page', () => {
        expect(location().pathname).to.equal('/projects/2/edit');
      });
    });
  });
});
