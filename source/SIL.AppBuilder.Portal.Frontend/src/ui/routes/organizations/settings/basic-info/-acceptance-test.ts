import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  fakeAuth0Id,
} from 'tests/helpers';
import app from 'tests/helpers/pages/app';

import page from './-page';

describe('Acceptance | Organization Settings | Basic Info', () => {
  describe('current user is a super admin', () => {
    useFakeAuthentication();
    setupApplicationTest();

    describe('the user visits the settings page', () => {
      beforeEach(async function() {
        this.mockGet(200, '/organizations/1', {
          data: {
            type: 'organizations',
            id: 1,
            attributes: { name: 'DeveloperTown' },
            relationships: {
              ['organization-product-definitions']: {},
              ['groups']: {},
            },
          },
          included: [],
        });

        await visit('/organizations/1/settings');
      });

      it.always('is not redirected', () => {
        expect(location().pathname).to.eq('/organizations/1/settings');
      });

      describe('the user clicks the save button', () => {
        beforeEach(async function() {
          this.mockPatch(
            200,
            '/organizations/1',
            {
              data: {
                id: '1',
                type: 'organizations',
                attributes: {
                  name: 'DeveloperTown2!',
                  'logo-url': '',
                  'public-by-default': true,
                },
              },
            },
            (server, req, res) => {
              expect(req.body).to.include('DeveloperTown2!');
            }
          );

          await page.fillName('DeveloperTown2!');
          await page.submit();
        });

        it('a success message is displayed', () => {
          expect(app.toast.text).to.include('Updated');
        });
      });
    });
  });
});
