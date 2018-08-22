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
        }
      ]
    });

    describe('navigates to the new project page', () => {
      beforeEach(async function() {
        await visit('/projects/new');
      });

      it('is not redirected', () => {
        expect(location().pathname).to.equal('/projects/new');
      });

      it('has the save button disabled', () => {
        expect(page.isSaveDisabled).to.be.true;
      });

      describe('name is required', () => {

      });

      describe('group is required', () => {

      });

      describe('type is required', () => {

      });

      describe('language is required', () => {

      });

      describe('visibility is toggleable', () => {

      });
    });
  });
});
