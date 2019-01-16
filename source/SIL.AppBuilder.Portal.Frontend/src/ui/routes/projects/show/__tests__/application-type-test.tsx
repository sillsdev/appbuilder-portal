import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Project view | Application Type', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('Use dictonary app Builder type', () => {
    beforeEach(function() {
      this.mockGet(200, '/users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, '/projects/1', {
        data: {
          type: 'projects',
          id: '1',
          attributes: {
            name: 'Fake project',
            'type-id': 1,
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
      await visit('/projects/1');
    });

    it('is in project page', () => {
      expect(location().pathname).to.equal('/projects/1');
    });

    describe('application type field is correctly displayed', () => {
      it('application type displays Dictonary App Builder name', () => {
        expect(page.detailsInteractor.isApplicationTypePresent).to.be.true;
        expect(page.detailsInteractor.applicationTypeText).to.equal('Dictionary App Builder');
      });
    });
  });

  describe('Use Scripture App Builder type', () => {
    beforeEach(function() {
      this.mockGet(200, '/projects/2', {
        data: {
          type: 'projects',
          id: '2',
          attributes: {
            name: 'Fake project',
            'type-id': 1,
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
              name: 'scriptureappbuilder',
              description: 'Scripture App Builder',
            },
          },
        ],
      });
    });

    beforeEach(async function() {
      await visit('/projects/2');
    });

    it('application type displays Scripture App Builder name', () => {
      expect(page.detailsInteractor.isApplicationTypePresent).to.be.true;
      expect(page.detailsInteractor.applicationTypeText).to.equal('Scripture App Builder');
    });
  });
});
