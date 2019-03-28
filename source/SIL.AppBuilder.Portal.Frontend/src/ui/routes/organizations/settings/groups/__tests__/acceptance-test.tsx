import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Organization Settings | Groups', () => {
  useFakeAuthentication();
  setupApplicationTest();

  describe('Organization group page', () => {
    beforeEach(function() {
      this.mockGet(200, '/organizations/1', {
        data: {
          id: 1,
          type: 'organizations',
          attributes: {
            'public-by-default': true,
          },
          relationships: {
            groups: { data: [] },
          },
        },
      });
    });

    beforeEach(async function() {
      await visit('/organizations/1/settings/groups');
    });

    it('is in groups organization settings page', () => {
      expect(location().pathname).to.equal('/organizations/1/settings/groups');
    });

    it('render empty group list', () => {
      expect(page.emptyLabel).to.equals('Your organization has no groups');
    });

    describe('Add a new group', () => {
      beforeEach(function() {
        this.mockPost(201, 'groups', {
          data: {
            attributes: {
              name: 'TEST GROUP',
              abbreviation: 'TG',
            },
            relationships: {
              owner: { data: { id: 1, type: 'organization' } },
            },
            id: 1,
            type: 'groups',
          },
        });
      });

      beforeEach(async function() {
        await page.clickAddGroupButton();
        await page.fillName('TEST GROUP');
        await page.fillAbbreviation('TG');
        await page.clickSaveButton();
      });

      it('shows the new group', () => {
        const groupNames = page.groupNameList();
        const names = groupNames.map((item) => item.text);
        expect(names).to.contains('TEST GROUP');
      });

      describe('edit the group', () => {
        beforeEach(function() {
          this.mockPatch(200, 'groups/1', {
            data: {
              attributes: {
                name: 'FAKE GROUP',
                abbreviation: 'FG',
              },
              relationships: {
                owner: { data: { type: 'organizations', id: 1 } },
              },
              id: 1,
              type: 'groups',
            },
          });
        });

        beforeEach(async function() {
          await page.groupNameList(0).click();
          await page.fillName('FAKE GROUP');
          await page.fillAbbreviation('FG');
          await page.clickSaveButton();
        });

        it('group is edited', () => {
          const groupNames = page.groupNameList();
          const names = groupNames.map((item) => item.text);
          expect(names).to.contains('FAKE GROUP');
        });

        describe('delete group', () => {
          beforeEach(function() {
            this.mockDelete(204, 'groups/1');
          });

          beforeEach(async function() {
            await page.deleteButtonList(0).click();
          });

          it('render an empty list', () => {
            expect(page.emptyLabel).to.equals('Your organization has no groups');
          });
        });
      });
    });
  });
});
