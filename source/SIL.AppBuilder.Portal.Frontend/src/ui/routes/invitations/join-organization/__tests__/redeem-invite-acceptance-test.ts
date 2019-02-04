import { describe, beforeEach, it } from '@bigtest/mocha';
import { when } from '@bigtest/convergence';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import { fakeAuth0Id } from 'tests/helpers/jwt';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers';

import i18n from '@translations';

import page from './-page';

describe('Acceptance | Organization Membership Invites', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  describe('follow an invitation link', () => {
    context('when not logged in', () => {
      beforeEach(() => {
        visit('/invitations/organization-membership/any-token');
      });

      it('redirects to login', () => {
        expect(location().pathname).to.eql('/login');
      });
    });

    context('when logged in', () => {
      useFakeAuthentication({
        data: {
          attributes: {
            'given-name': 'Test',
            'family-name': 'User',
            auth0Id: fakeAuth0Id,
          },
          relationships: {
            'organization-memberships': {
              data: [
                {
                  type: 'organization-memberships',
                  id: '41',
                },
              ],
            },
            'group-memberships': {
              data: [],
            },
            'user-roles': {
              data: [],
            },
            notifications: {},
          },
          type: 'users',
          id: '1',
        },
        included: [
          {
            attributes: {
              email: null,
              'user-id': 1,
              'organization-id': 1,
            },
            relationships: {
              user: {
                data: {
                  type: 'users',
                  id: '1',
                },
              },
              organization: {
                data: {
                  type: 'organizations',
                  id: '1',
                },
              },
            },
            type: 'organization-memberships',
            id: '41',
          },
          {
            attributes: {
              name: 'DeveloperTown',
              'website-url': 'https://developertown.com',
              'build-engine-url': 'https://buildengine.gtis.guru:8443',
              'build-engine-api-access-token': 'nMdPdrcbjJDCp2QwLHajXAUunZUqNeDe',
              'logo-url': null,
              'use-default-build-engine': false,
              'public-by-default': true,
            },
            relationships: {
              owner: {
                data: {
                  type: 'users',
                  id: '3',
                },
              },
              'organization-memberships': {
                data: [
                  {
                    type: 'organization-memberships',
                    id: '41',
                  },
                ],
              },
              'organization-product-definitions': {},
              'organization-stores': {},
              'user-roles': {},
            },
            type: 'organizations',
            id: '2',
          },
        ],
      });

      context('invite is not redeemed', () => {
        beforeEach(function() {
          this.mockPatch(404, '/organization-membership-invites/redeem/any-token', {
            errors: [{ title: 'organization-membership.invite.error.not-found', status: '404' }],
          });
        });

        beforeEach(() => {
          visit('/invitations/organization-membership/any-token');
        });

        it('shows not found error.', () => {
          expect(page.errorMessage).to.contain(
            i18n.t('organization-membership.invite.error.not-found')
          );
        });
      });

      describe('error handling', () => {
        context('invite is expired', () => {
          beforeEach(function() {
            this.mockPatch(403, '/organization-membership-invites/redeem/any-token', {
              errors: [
                {
                  title: 'organization-membership.invite.error.expired',
                  status: '403',
                },
              ],
            });
          });

          beforeEach(() => {
            visit('/invitations/organization-membership/any-token');
          });

          it('shows expired error.', () => {
            expect(page.errorMessage).to.eql('Invitation has expired');
          });

          it('shows home link.', () => {
            expect(page.homeLink.isPresent).to.be.true;
          });
        });

        context('invite is already redeemed', () => {
          beforeEach(function() {
            this.mockPatch(403, '/organization-membership-invites/redeem/any-token', {
              errors: [
                {
                  title: 'organization-membership.invite.error.redeemed',
                  status: '403',
                },
              ],
            });
          });

          beforeEach(() => {
            visit('/invitations/organization-membership/any-token');
          });

          it('shows already redeemed.', () => {
            expect(page.errorMessage).to.eql('Invitation has already been redeemed');
          });

          it('shows home link.', () => {
            expect(page.homeLink.isPresent).to.be.true;
          });
        });
        context('invite is not found', () => {
          beforeEach(function() {
            this.mockPatch(404, '/organization-membership-invites/redeem/any-token', {
              errors: [
                {
                  title: 'organization-membership.invite.error.not-found',
                  status: '404',
                },
              ],
            });
          });

          beforeEach(() => {
            visit('/invitations/organization-membership/any-token');
          });

          it('shows not found error.', () => {
            expect(page.errorMessage).to.equal('Invitation was not found');
          });

          it('shows home link.', () => {
            expect(page.homeLink.isPresent).to.be.true;
          });
        });

        context('unexpected error', () => {
          beforeEach(function() {
            this.mockPatch(
              400,
              '/organization-membership-invites/redeem/any-token',
              'any unexpected error'
            );
          });

          beforeEach(() => {
            visit('/invitations/organization-membership/any-token');
          });

          it('shows unexpected error.', () => {
            expect(page.errorMessage).to.equal('Unexpected error occured: "any unexpected error"');
          });

          it('shows home link.', () => {
            expect(page.homeLink.isPresent).to.be.true;
          });
        });
      });
    });
  });
});
