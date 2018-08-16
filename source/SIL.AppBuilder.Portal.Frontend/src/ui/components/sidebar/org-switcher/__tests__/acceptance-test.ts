import * as React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest, useFakeAuthentication,
  setupRequestInterceptor, wait
} from 'tests/helpers/index';

import app from 'tests/helpers/pages/app';
import { fakeAuth0Id } from 'tests/helpers/jwt';
import switcher from './page';

describe('Acceptance | Organization Switcher', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  describe('The Current User is a member of multiple organizations', () => {
    useFakeAuthentication(undefined, {
      data: [{
        type: 'organizations', id: 1,
        attributes: {
          name: 'SIL International'
        }
      }, {
        type: 'organizations', id: 2,
        attributes: {
          name: 'DeveloperTown'
        }
      }, {
        type: 'organizations', id: 3,
        attributes: {
          name: 'Kalaam Media'
        }
      }]
    });

    beforeEach(async () => {
      await visit('/');

      expect(location().pathname).to.eq('/');

      await app.openSidebar();

      expect(app.isSidebarVisible).to.be.true;

      await app.openOrgSwitcher();

      expect(app.isOrgSwitcherVisible).to.be.true;
    });

    it('renders each organization by name', () => {
      const nodes = switcher.orgNames;
      const text = nodes.map(t => t.innerText).join();

      expect(text).to.include('SIL International');
      expect(text).to.include('DeveloperTown');
      expect(text).to.include('Kalaam Media');
    });

    describe('Selecting an orgaization', () => {
      beforeEach(async () => {
        await switcher.selectOrg();
      });

      it('hides the org switcher', () => {
        expect(app.isOrgSwitcherVisible).to.be.false;
      });
    });
  });
});
