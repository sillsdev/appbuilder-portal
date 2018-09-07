import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Project Edit | Archive Project', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('navigates to project details page', () => {
    beforeEach(async function () {
      await visit('/project/1');
    });
    it('is in detail page', () => {
      expect(location().pathname).to.equal('/project/1');
    });
  });

  describe('an active project exists', () => {
    beforeEach(function () {
      this.mockGet(200, 'users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, 'projects/1', {
        data: {
          type: 'projects',
          id: '1',
          attributes: {
            'date-archived': null,
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
    describe('archiving the project', () => {
      beforeEach(function () {
        this.mockPatch(200, 'projects/1', {
          data: {
            type: 'projects',
            id: '1',
            attributes: {
              'date-archived': "2018-08-10T23:59:55.259Z"
            },
          }
        });
      });
      describe('the archive button is clicked', () => {
        beforeEach(async () => {
          await visit('/project/1');
          await page.clickArchiveLink();
        });
        it("changes the button text", () => {
          expect(page.archiveText).to.equal('Reactivate');
        });
      });
    });
  });

  describe('an archived project exists', () => {
    beforeEach(function () {
      this.mockGet(200, 'users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, 'projects/1', {
        data: {
          type: 'projects',
          id: '1',
          attributes: {
            'date-archived': "2018-08-10T23:59:55.259Z"
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
    describe('reactivating a project', () => {
      beforeEach(function () {
        this.mockPatch(200, 'projects/1', {
          data: {
            type: 'projects',
            id: '1',
            attributes: {
              'date-archived': null
            },
          }
        });
      });
      describe('the reactivate button is clicked', () => {
        beforeEach(async function () {
          await visit('/project/1');
          await page.clickArchiveLink();
        });
        it("changes the button text", () => {
          expect(page.archiveText).to.equal('Archive');
        });
      });
    });
  });
});