import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication
} from 'tests/helpers/index';

import page from '@ui/components/project-table/__tests__/page';

describe('Acceptance | Project Directory | Row Actions', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function () {
    this.mockGet(200, 'product-definitions', { data: [] });
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
        { type: 'organizations', id: 1, attributes: { name: 'Dummy organization' } },
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

    describe('Row actions', () => {

      it('row action is not present', () => {
        const isPresent = page.rows(1).isRowActionPresent;
        expect(isPresent).to.be.false;
      });
    });

  });
});
