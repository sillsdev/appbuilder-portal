import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication
} from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Project view | project visibility', () => {

  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('Navigate to a project view with visibility set as Private', () => {

    beforeEach(function () {
      this.mockGet(200, '/users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, '/projects/1', {
        data: {
          type: 'projects',
          id: '1',
          attributes: {
            name: 'Fake project',
            isPublic: false
          },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
            group: { data: { id: 1, type: 'groups' } },
            owner: { data: { id: 2, type: 'users' } },
            type: { data: { id: 1, type: 'application-types' } }
          }
        },
        included: [
          { type: 'organizations', id: 1, },
          { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
          { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
          {
            type: 'application-types', id: 1, attributes: {
              name: 'dictionaryappbuilder', description: "Dictionary App Builder"
            }
          }
        ]
      });
    });

    beforeEach(async function () {
      await visit('/project/1');
    });

    it('is in project page', () => {
      expect(location().pathname).to.equal('/project/1');
    });

    it('Private label is rendered', () => {
      expect(page.publicText).to.equal('Private');
    });
  });

  describe('Navigate to a project view with visibility set as Public', () => {

    beforeEach(function () {
      this.mockGet(200, '/users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, '/projects/2', {
        data: {
          type: 'projects',
          id: '2',
          attributes: {
            name: 'Fake project',
            isPublic: true
          },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
            group: { data: { id: 1, type: 'groups' } },
            owner: { data: { id: 2, type: 'users' } },
            type: { data: { id: 1, type: 'application-types' } }
          }
        },
        included: [
          { type: 'organizations', id: 1, },
          { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
          { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
          {
            type: 'application-types', id: 1, attributes: {
              name: 'dictionaryappbuilder', description: "Dictionary App Builder"
            }
          }
        ]
      });
    });

    beforeEach(async function () {
      await visit('/project/2');
    });

    it('is in project page', () => {
      expect(location().pathname).to.equal('/project/2');
    });


    it('Public label is rendered', () => {
      expect(page.publicText).to.equal('Public');
    });
  });

});