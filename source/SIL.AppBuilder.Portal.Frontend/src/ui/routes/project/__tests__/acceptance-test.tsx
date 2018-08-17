import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers/index';


import page from './page';

describe('Acceptance | Archive Project', () => {
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

  describe('an active prjoject exists', () => {
    beforeEach(function() {
      this.mockGet(200, 'projects/1', {
        data: {
          type: 'projects',
          id: '1',
          attributes: {
            'date-archived': null,
          },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } }
          }
        },
        included: [
          { type: 'organizations', id: 1, }
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
        }});
      });

<<<<<<< HEAD
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
            }
          });
=======
      describe('the archive button is clicked', () => {
        beforeEach(async () => {
          await visit('/project/1');
          await page.clickArchiveLink();
>>>>>>> master
        });

        it("changes the button text", () => {
          expect(page.archiveText).to.equal('Reactivate');
        });
      });
    });
  });

  describe('an archived project exists', () => {
    beforeEach(function() {
      this.mockGet(200, 'projects/1', {
        data: {
          type: 'projects',
          id: '1',
          attributes: {
            'date-archived': "2018-08-10T23:59:55.259Z"
          },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } }
          }
        },
        included: [
          { type: 'organizations', id: 1, }
        ]
      });
    });

<<<<<<< HEAD
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
              }
            });
          });
=======
    describe('reactivating a project', () => {
      beforeEach(function () {
        this.mockPatch(200, 'projects/1', {
          data: {
            type: 'projects',
            id: '1',
            attributes: {
              'date-archived': null
            },
            relationships: {},
          }});
      });

      describe('the reactivate button is clicked', () => {
        beforeEach(async () => {
          await visit('/project/1');
          await page.clickArchiveLink();
        });
>>>>>>> master

        it("changes the button text", () => {
          expect(page.archiveText).to.equal('Archive');
        });

      });
    })
  })
})
