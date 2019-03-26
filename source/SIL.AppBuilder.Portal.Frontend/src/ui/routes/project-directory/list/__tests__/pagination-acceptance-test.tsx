import { when } from '@bigtest/convergence';
import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers/index';
import app from 'tests/helpers/pages/app';
import ProjectTableInteractor from '@ui/components/project-table/__tests__/page';
import pagination from '@data/containers/api/pagination-footer/page';

import { zeroProjects, fullPageOfProjects, moreThanOnePageOfProjects } from './scenarios';
const page = new ProjectTableInteractor();

function navigateTo(path: string) {
  beforeEach(async function() {
    visit(path);
    await when(() => expect(location().pathname).to.equal(path));
    await when(() => page.isPresent);
  });
}

const screens = [
  {
    path: '/directory',
    name: 'Project Directory',
    config: {},
  },
  {
    path: '/projects/own',
    name: 'My Projects',
    config: {},
  },
  {
    path: '/projects/archived',
    name: 'Archived Projects',
    config: {
      data: { currentOrganizationId: '1' },
    },
  },
  {
    path: '/projects/organization',
    name: 'Organization Projects',
    config: {
      data: { currentOrganizationId: '1' },
    },
  },
];

describe('Acceptance | Pagination', () => {
  useFakeAuthentication();

  screens.forEach((screen) => {
    setupApplicationTest(screen.config);

    beforeEach(function() {
      this.mockGet(200, 'product-definitions', { data: [] });
    });

    describe(`on the ${screen.name} page`, () => {
      describe('there are 0 projects', () => {
        beforeEach(function() {
          this.mockGet(200, 'projects', zeroProjects);
        });

        navigateTo(screen.path);

        xit('Pagination is not displayed', () => {
          expect(app.isPaginationVisible).to.equal(false);
        });

        it('shows 0 projects', () => {
          expect(page.isEmptyTextPresent).to.equal(true);
        });
      });

      describe('there is less than one page worth of projects', () => {
        beforeEach(function() {
          this.mockGet(200, '/projects', fullPageOfProjects);
        });

        navigateTo(screen.path);

        xit('Pagination is not displayed', () => {
          expect(app.isPaginationVisible).to.equal(false);
        });

        it('shows all the projects', () => {
          const rows = page.rows().length;

          expect(rows).to.equal(20);
        });
      });

      describe('there is more than one page worth of projects', () => {
        beforeEach(function() {
          this.mockGet(200, '/projects', moreThanOnePageOfProjects);
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
