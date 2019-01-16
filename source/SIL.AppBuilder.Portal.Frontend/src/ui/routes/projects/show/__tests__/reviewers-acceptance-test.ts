import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Project View | Reviewers', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function() {
    this.mockGet(200, 'users', { data: [] });
    this.mockGet(200, '/groups', { data: [] });
    this.mockGet(200, 'projects/1', {
      data: {
        type: 'projects',
        id: 1,
        attributes: {
          name: 'Fake project',
        },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } },
          group: { data: { id: 1, type: 'groups' } },
          owner: { data: { id: 2, type: 'users' } },
          reviewers: {
            data: [{ type: 'reviewers', id: 1 }],
          },
        },
      },
      included: [
        { type: 'organizations', id: 1 },
        { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
        { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
        {
          type: 'reviewers',
          id: 1,
          attributes: {
            name: 'Fake reviewer',
            email: 'fake@reviewer.com',
          },
          relationships: {
            project: { data: { type: 'projects', id: 1 } },
          },
        },
      ],
    });
  });

  beforeEach(async function() {
    await visit('/projects/1');
  });

  describe('with project reviewers', () => {
    it('show the list of reviewers', () => {
      expect(location().pathname).to.equal('/projects/1');

      const list = page.reviewers.list();
      const listText = list.map((item) => item.text);

      expect(listText).to.contain('Fake reviewer (fake@reviewer.com)');
    });
  });

  describe('Open add reviewer form', () => {
    beforeEach(async function() {
      await page.reviewers.clickAddFormToggler();
    });

    it('Add Reviewer form shows up', () => {
      expect(page.reviewers.isAddFormPresent).to.be.true;
    });

    describe('Add a reviewer', () => {
      beforeEach(async function() {
        await page.reviewers.fillReviewerName('fake user 1');
        await page.reviewers.fillReviewerEmail('fake@fakerland.com');
        await page.reviewers.clickAddReviewerSubmitButton();
      });

      beforeEach(function() {
        this.mockPost(201, '/reviewers', {
          data: {
            type: 'reviewers',
            id: 2,
            attributes: {
              email: 'fake@fakerland.com',
              name: 'fake user 1',
            },
            relationships: {
              project: { data: { type: 'projects', id: 1 } },
            },
          },
        });
      });

      it('A new reviewer is added to the list', () => {
        expect(page.reviewers.listCount).to.equal(2);

        const list = page.reviewers.list();
        const listText = list.map((item) => item.text);

        expect(listText).to.contain('Fake reviewer (fake@reviewer.com)');
        expect(listText).to.contain('fake user 1 (fake@fakerland.com)');
      });

      describe('Remove a reviewer from the list', () => {
        beforeEach(async function() {
          await page.reviewers.clickRemoveReviewer();
        });

        beforeEach(function() {
          this.mockDelete(204, '/reviewers/1');
        });

        it('Only one reviewer remains', () => {
          expect(page.reviewers.listCount).to.equal(1);

          const list = page.reviewers.list();
          const listText = list.map((item) => item.text);

          expect(listText).to.contain('fake user 1 (fake@fakerland.com)');
          expect(listText).to.not.equal('Fake reviewer (fake@reviewer.com)');
        });
      });
    });
  });
});
