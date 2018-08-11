import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers/index';


import page from './page';

describe.only('Acceptance | Archive Project', () => {
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

    this.mockGet(200, 'projects/1', {
      data: {
        type: 'projects',
        id: '1',
        attributes: {
          'date-archived': null,
          'date-created': "2018-08-09T20:23:54.809962",
          'date-updated': "2018-08-10T18:56:45.525297",
          'description': "This is a dummy project",
          'language': "Sogdian",
          'name': "Dummy Project",
          'private': false,
          'type': "Sogdian Transalation"
        },
        relationships: {
          organization: {
            data: { id: 1, type: 'organizations' }
          }
        }
      },
      included: [
        {
          type: 'organizations',
          id: 1,
          attributes: {},
          relationships: {}
        }
      ]
    });
  });

  describe('navigates to project details page', () => {
    beforeEach(async function () {
      await visit('/project/1');
    });

    it('is in detail page', () => {
      expect(location().pathname).to.equal('/project/1');
    });

    describe('archive / reactivate', () => {

      beforeEach(async function () {
        await page.clickArchiveLink();
      });

      describe('archive project', () => {

        beforeEach(async function () {
          this.mockPatch(200, 'projects/1', {
            data: {
              type: 'projects',
              id: '1',
              attributes: {
                'name': "Dummy Project",
                'type': "Sogdian Transalation",
                'description': "This is a dummy project",
                'language': "Sogdian",
                'private': false,
                'date-created': "2018-08-09T20:23:54.809962",
                'date-updated': "2018-08-10T23:59:55.7694263Z",
                'date-archived': "2018-08-10T23:59:55.259Z"
              },
              relationships: {}
          });
        });

        it("it's archived", () => {
          expect(page.archiveText).to.equal('Reactivate');
        });

        describe('reactivate project', () => {

          beforeEach(async function () {
            this.mockPatch(200, 'projects/1', {
              data: {
                type: 'projects',
                id: '1',
                attributes: {
                  'name': "Dummy Project",
                  'type': "Sogdian Transalation",
                  'description': "This is a dummy project",
                  'language': "Sogdian",
                  'private': false,
                  'date-created': "2018-08-09T20:23:54.809962",
                  'date-updated': "2018-08-10T23:59:55.7694263Z",
                  'date-archived': null
                },
                relationships: {}
              });
          });

          it("it's reactivated", () => {
            expect(page.archiveText).to.equal('Archive');
          });
        });
      });
    });

  });

});