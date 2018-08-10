import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers/index';


import page from './page';

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
      data: {
        type: 'projects',
        id: '1',
        attributes: {},
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

    it('is in detail page',() => {
      expect(location().pathname).to.equal('/project/1');
    });

    describe('archive / reactivate', () => {

      beforeEach(async function () {
        await page.clickArchiveLink();
      })

      describe('archive project', () => {

        beforeEach(async function () {

          const { server } = this.polly;

          server.patch('/project/1').intercept((req, res) => res.sendStatus(200));
        });

        it("it's archived", () => {
          expect(page.archiveText()).to.equal('reactivate');
        });

        describe('reactivate project', () => {

          beforeEach(async function() {
            const { server } = this.polly;
            server.patch('/project/1').intercept((req, res) => res.sendStatus(200));
          });

          it("it's reactivated", () => {
            expect(page.archiveText()).to.equal('archive');
          });
        });
      });
    });

  });

});