import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import { setupApplicationTest, useFakeAuthentication } from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Project edit', () => {
  useFakeAuthentication();
  setupApplicationTest();
  describe('Navigate to a project view with visibility set as Public', () => {
    beforeEach(function() {
      this.mockGet(200, '/users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, '/projects/2', {
        data: {
          type: 'projects',
          id: '2',
          attributes: {
            name: 'Fake project',
            isPublic: true,
            language: 'en',
            description: 'This is a fake project',
          },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
            group: { data: { id: 1, type: 'groups' } },
            owner: { data: { id: 2, type: 'users' } },
            type: { data: { id: 1, type: 'application-types' } },
          },
        },
        included: [
          { type: 'organizations', id: 1 },
          { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
          { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
          {
            type: 'application-types',
            id: 1,
            attributes: {
              name: 'dictionaryappbuilder',
              description: 'Dictionary App Builder',
            },
          },
        ],
      });
      this.mockPatch(200, 'projects/2', {
        data: {
          type: 'projects',
          id: '2',
          attributes: {
            'date-archived': null,
          },
        },
      });
    });

    beforeEach(async function() {
      await visit('/projects/2/edit');
    });

    it('is in project page', () => {
      expect(location().pathname).to.equal('/projects/2/edit');
    });

    it('displays the current project name', () => {
      expect(page.textName).to.eq('Fake project');
    });

    it('displays the current description', () => {
      expect(page.textDescription).to.eq('This is a fake project');
    });

    it('displays the current language', () => {
      expect(page.language.input.valueFromProps).to.eq('en');
    });

    describe('If the cancel button is pressed', () => {
      beforeEach(async function() {
        await page.clickCancel();
      });

      it('returns to the project detail page', () => {
        expect(location().pathname).to.equal('/projects/2');
      });
    });

    describe('If the name is changed', () => {
      beforeEach(async function() {
        await page.fillName('New project name');
      });
      it('the save button is enabled', () => {
        expect(page.isSaveDisabled).to.be.false;
      });
      describe('If save is clicked', () => {
        beforeEach(async function() {
          await page.clickSave();
        });
        it('returns to the project detail page', () => {
          expect(location().pathname).to.equal('/projects/2');
        });
      });
    });

    describe('If the name is set to blanks', () => {
      beforeEach(async function() {
        await page.fillName('');
      });
      it('the save button is disabled', () => {
        expect(page.isSaveDisabled).to.be.true;
      });
    });
  });
});
