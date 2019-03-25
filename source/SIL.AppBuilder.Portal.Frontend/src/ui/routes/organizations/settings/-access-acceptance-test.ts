import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  useFakeAuthentication,
  setupBrowser,
} from 'tests/helpers/index';
import { userIsAppBuilderOf, userIsOrgAdminOf } from 'tests/helpers/factories/user';
import app from 'tests/helpers/pages/app';

import i18n from '@translations';

describe('Acceptance | Accessing Organization Settings', () => {
  setupBrowser();

  describe('the current user is an org admin of the current organization', () => {
    const url = '/organizations/1/settings';
    const organization = {
      type: 'organizations',
      id: 1,
      attributes: {
        name: 'Some Organization',
      },
    };

    useFakeAuthentication(userIsOrgAdminOf(organization));
    setupApplicationTest();

    beforeEach(async function() {
      this.mockGet(200, '/organizations/1', { data: organization });
      await visit(url);
    });

    it('is not redirected away from the target URL', () => {
      expect(location().pathname).to.equal(url);
    });

    it('does not redirect back to tasks', () => {
      expect(location().pathname).to.not.equal('/tasks');
    })
  });

  describe('the current user is a super admin', () => {
    const url = '/organizations/1/settings';
    
    useFakeAuthentication();
    setupApplicationTest();

    beforeEach(async function() {
      this.mockGet(200, '/organizations/1', {
        data: {
          id: 1,
          type: 'organizations',
          attributes: {
            name: 'Not org admin of this one',
          },
        },
      });
      await visit(url);
    });

    it('is not redirected away from the target URL', () => {
      expect(location().pathname).to.equal(url);
    });

    it('does not redirect back to tasks', () => {
      expect(location().pathname).to.not.equal('/tasks');
    })
  });

  describe('the current user is an org admin of a different org', () => {
    const url = '/organizations/1/settings';
    const organization = {
      type: 'organizations',
      id: 2,
      attributes: {
        name: 'Some Organization',
      },
    };

    useFakeAuthentication(userIsOrgAdminOf(organization));
    setupApplicationTest();

    beforeEach(async function() {
      this.mockGet(200, '/organizations/1', {
        data: {
          id: 1,
          type: 'organizations',
          attributes: {
            name: 'Not org admin of this one',
          },
        },
      });
      
      await visit(url);
    });


    it('is redirected away from the target URL', () => {
      expect(location().pathname).to.equal('/tasks');
    });

    it('shows a message', () => {
      const expected = i18n.t('errors.friendlyForbidden');

      expect(app.toast.text).to.include(expected);
    });
  });

  describe('the current user is an app builder', () => {
    const url = '/organizations/1/settings';
    const organization = {
      type: 'organizations',
      id: 1,
      attributes: {
        name: 'Some Organization',
      },
    };

    useFakeAuthentication(userIsAppBuilderOf(organization));
    setupApplicationTest();

    beforeEach(async function() {
      this.mockGet(200, '/organizations/1', { data: organization });
      await visit(url);
    });

    it('is redirected away from the target URL', () => {
      expect(location().pathname).to.equal('/tasks');
    });

    it('shows a message', () => {
      const expected = i18n.t('errors.friendlyForbidden');

      expect(app.toast.text).to.include(expected);
    });
  });
});
