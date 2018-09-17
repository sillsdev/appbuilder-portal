import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication
} from 'tests/helpers/index';

import page from '@ui/components/project-table/__tests__/page';

describe('Acceptance | Project Table | Column selector', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function () {
    this.mockGet(200, 'projects', {
      data: {
        type: 'projects',
        id: '1',
        attributes: {
          'name': 'Dummy project',
          'date-archived': null,
          'language': 'English',
          'owner-id': 1
        },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } },
          group: { data: { id: 1, type: 'groups' } },
          owner: { data: { id: 1, type: 'users' } }
        }
      },
      included: [
        { type: 'organizations', id: 1, attributes: { name: 'Dummy organization' } },
        { type: 'groups', id: 1, attributes: { name: 'Some Group' } }
      ]
    });
  });

  describe('navigates to my project page', () => {
    beforeEach(async function () {
      await visit('/projects/own');
    });

    it('is in directory page', () => {
      expect(location().pathname).to.equal('/projects/own');
    });

    describe('Default columns are selected', () => {

      beforeEach(async function () {
        await page.clickColumnSelector();
      });

      it('default options are selected', () => {
        const items = page.selectedItems();
        const itemsText = items.map(i => i.text);

        expect(itemsText).to.contain('Owner');
        expect(itemsText).to.contain('Group');
        expect(itemsText).to.contain('Build Version');
        expect(itemsText).to.contain('Updated On');

        expect(itemsText).to.not.contain('Organization');
        expect(itemsText).to.not.contain('Language');
        expect(itemsText).to.not.contain('Build Date');
        expect(itemsText).to.not.contain('Created On');
      });

    });
  });

});