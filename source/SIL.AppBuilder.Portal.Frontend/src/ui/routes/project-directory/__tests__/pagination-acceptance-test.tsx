import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication
} from 'tests/helpers/index';

import app from 'tests/helpers/pages/app';
import page from '@ui/components/project-table/__tests__/page';
import pagination from '@data/containers/api/pagination-footer/page';
import { zeroProjects, fullPageOfProjects, moreThanOnePageOfProjects } from './scenarios';

function navigateTo(path: string) {
  beforeEach(async function () {
    await visit(path);

    expect(location().pathname).to.equal(path);
  });
}

const screens = [{
  path: '/directory',
  name: 'Project Directory'
}, {
  path: '/projects/own',
  name: 'My Projects'
}, {
  path: '/projects/archived',
  name: 'Archived Projects',
}, {
  path: '/projects/organization',
  name: 'Organization Projects'
}];

describe('Acceptance | Pagination', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function () {
    this.mockGet(200, 'product-definitions', { data: [] });
  });

  screens.forEach(screen => {
    describe(`on the ${screen.name} page`, () => {

      describe('there are 0 projects', () => {
        beforeEach(function() {
          this.mockGet(200, 'projects', zeroProjects);
        });

        navigateTo(screen.path);

        it('Pagination is not displayed',() => {
          expect(app.isPaginationVisible).to.equal(false);
        });

        it('shows 0 projects', () => {
          expect(page.isEmptyTextPresent).to.equal(true);
        });
      });

      describe('there is less than one page worth of projects', () => {
        beforeEach(function() {
          this.mockGet(200, 'projects', fullPageOfProjects);
        });

        navigateTo(screen.path);

        it('Pagination is not displayed', () => {
          expect(app.isPaginationVisible).to.equal(false);
        });


        it('shows all the projects', () => {
          const rows = page.rows().length;

          expect(rows).to.equal(20);
        });
      });

      describe('there is more than one page worth of projects', () => {
        beforeEach(function() {
          this.mockGet(200, 'projects', moreThanOnePageOfProjects);
        });

        navigateTo(screen.path);

        it('Pagination is displayed', () => {
          expect(app.isPaginationVisible).to.equal(true);
        });

        it('shows 20 projects', () => {
          const rows = page.rows().length;

          expect(rows).to.equal(20);
        });

        describe('Clicking the next button', () => {

          xit('shows the second page of results', () => {
            // TODO
          });

          describe('Clicking the previous button', () => {

            xit('shows the first page of results', () => {
              // TODO
            });
          });
        });
      });
    });
  });

});
