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
      data: [{
        type: 'projects',
        id: '1',
        attributes: {
          'name': 'Dummy project',
          'date-archived': null,
          'language': 'English'
        },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } },
          group: { data: { id: 1, type: 'groups' } },
          owner: { data: { id: 1, type: 'users' } }
        }
      }],
      included: [
        { type: 'organizations', id: 1, attributes: { name: 'Dummy organization'} },
        { type: 'groups', id: 1, attributes: { name: 'Some Group' } }
      ]
    });
  });

  describe('navigates to project directory page', () => {

    beforeEach(async function () {
      await visit('/directory');
    });

    it('is in directory page', () => {
      expect(location().pathname).to.equal('/directory');
    });

    describe('Default columns are selected',() => {

      beforeEach(async function() {
        await page.clickColumnSelector();
      });

      it('default options are selected',() => {

        const items = page.selectedItems();
        const itemsText = items.map(i => i.text);

        expect(itemsText).to.contain('Organization');
        expect(itemsText).to.contain('Language');
        expect(itemsText).to.contain('Build Version');
        expect(itemsText).to.contain('Updated On');

        expect(itemsText).to.not.contain('Owner');
        expect(itemsText).to.not.contain('Group');
        expect(itemsText).to.not.contain('Build Date');
        expect(itemsText).to.not.contain('Created On');
      });

      describe('Add owner column to project table',() => {

        beforeEach(async function() {
          await page.clickOwnerColumn();
        });

        it('owner column its added to project table',() => {
          const columns = page.columns();
          const columnsText = columns.map(c => c.text);

          expect(columnsText).to.contain('Owner');
          expect(columnsText).to.contain('fake fake');
        });

        describe('Remove Organization from project table',() => {

          beforeEach(async function() {
            await page.selectorItems(1).click();
          });

          it('organization column is no longer present', () => {
            const columns = page.columns();
            const columnsText = columns.map(c => c.text);

            expect(columnsText).to.not.contain('Organization');
            expect(columnsText).to.not.contain('Dummy organization');
          });
        });
      });
    });

  });
});