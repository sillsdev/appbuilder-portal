import { when } from '@bigtest/convergence';
import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers/index';

import PageInteractor from './-page-interactor';

import Page from '~/ui/routes/project-directory/show/-page';

describe('Acceptance | Project Table | Empty list', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();
  let pageInteractor;
  describe('Render an empty project list page', () => {
    beforeEach(function() {
      this.mockGet(200, 'projects', {
        data: [],
        meta: { 'total-records': 0 },
      });
    });

    beforeEach(async function() {
      pageInteractor = new PageInteractor();
      await visit('/projects/own');
      await when(() => pageInteractor.isPresent);
    });

    it('is in my own projects page', () => {
      expect(location().pathname).to.equal('/projects/own');
    });

    it('is project list empty', () => {
      expect(pageInteractor.projectTable.isEmptyTextPresent).to.be.true;
      expect(pageInteractor.projectTable.emptyText).to.equal('No projects found');
    });
  });

  describe('Render a project list page', () => {
    beforeEach(function() {
      this.mockGet(200, 'projects', {
        data: [
          {
            type: 'projects',
            id: '1',
            attributes: {
              name: 'Dummy project',
              'date-archived': null,
              language: 'English',
              'owner-id': 1,
            },
            relationships: {
              organization: { data: { id: 1, type: 'organizations' } },
              group: { data: { id: 1, type: 'groups' } },
              owner: { data: { id: 1, type: 'users' } },
            },
          },
        ],
        included: [
          { type: 'organizations', id: 1, attributes: { name: 'Dummy organization' } },
          { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
        ],
      });
    });

    describe('navigates to my project page', () => {
      beforeEach(async function() {
        await visit('/projects/own');
        await when(() => pageInteractor.isPresent);
      });

      it('is in my project page', () => {
        expect(location().pathname).to.equal('/projects/own');
      });

      it('empty text is not displayed when project list exist', () => {
        expect(pageInteractor.projectTable.isEmptyTextPresent).to.be.false;
      });
    });
  });
});
