import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest, setupRequestInterceptor, useFakeAuthentication,
  fakeAuth0Id
} from 'tests/helpers';

import page from './page';

describe('Acceptance | New Project', () => {
  setupApplicationTest();
  setupRequestInterceptor();


  describe('the user has no groups', () => {
    useFakeAuthentication({
      data: {
        id: 1, type: 'users',
        attributes: { auth0Id: fakeAuth0Id },
        relationships: {
          ['organization-memberships']: { data: [
            { id: 1, type: 'organization-memberships' }
          ]}
        }
      },
      included: [
        {
          id: 1,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } }
          }
        }
      ]
    });

    describe('navigates to new project page', () => {
      beforeEach(async function() {
        await visit('/projects/new');
      });

      it('is redirected', () => {
        expect(location().pathname).to.equal('/');
      });
    });
  });


  describe('the user has groups', () => {
    useFakeAuthentication({
      data: {
        id: 1, type: 'users',
        attributes: { auth0Id: fakeAuth0Id },
        relationships: {
          ['organization-memberships']: { data: [
            { id: 1, type: 'organization-memberships' }
          ] },
          ['group-memberships']: { data: [
            { id: 1, type: 'group-memberships' }
          ] }
        }
      },
      included: [
        {
          id: 1,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } }
          }
        },
        {
          id: 1,
          type: 'group-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            group: { data: { id: 1, type: 'groups' } }
          }
        },
        {
          id: 1, type: 'groups', attributes: { name: 'Group 1' }
        }
      ]
    });

    // beforeEach(function() {
    //   this.mockGet(200, '/groups', {
    //     data: [
    //       { id: 1, type: 'groups', attributes: { name: 'Group 1' } }
    //     ]
    //   });
    // });

    describe('navigates to the new project page', () => {
      beforeEach(async function() {
        await visit('/projects/new');

        expect(location().pathname).to.equal('/projects/new');
      });

      it('has the save button disabled', () => {
        expect(page.isSaveDisabled).to.be.true;
      });

      describe('name is required', () => {
        beforeEach(() => {
          page.fillLanguage('english');
          page.fillType('SAB');
          page.groupSelect.chooseGroup('Group 1');
        });


        it('has not enabled the save button', () => {
          expect(page.isSaveDisabled).to.be.true;
        });
      });

      describe('group defaults to first option', () => {
        beforeEach(async function() {
          await page.fillName('some name');
          await page.fillLanguage('english');
          await page.fillType('SAB');
        });

        it('has a value', () => {
          expect(page.groupSelect.selectedGroup).to.equal('Group 1');
        });

        it('has enabled the save button', () => {
          expect(page.isSaveDisabled).to.be.false;
        });
      });

      describe('type is required', () => {
        beforeEach(() => {
          page.fillName('some name');
          page.fillLanguage('english');
        });

        it('has not enabled the save button', () => {
          expect(page.isSaveDisabled).to.be.true;
        });
      });

      describe('language is required', () => {
        beforeEach(() => {
          page.fillName('some name');
          page.fillType('SAB');
        });

        it('has not enabled the save button', () => {
          expect(page.isSaveDisabled).to.be.true;
        });
      });

      describe('visibility is toggleable', () => {
        it('defaults to true / checked', () => {
          expect(page.isVisibilityChecked).to.be.true;
        });

        describe('is toggled', () => {
          beforeEach(async function() {
            await page.toggleVisibility();
          });

          it('is now unchecked', () => {
            expect(page.isVisibilityChecked).to.be.false;
          });
        });
      });
    });
  });
});

