import { when } from '@bigtest/convergence';
import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication
} from 'tests/helpers/index';

import ProjectTableInteractor from '@ui/components/project-table/__tests__/page';

import { zeroProjects, fullPageOfProjects, moreThanOnePageOfProjects } from './scenarios';

const page = new ProjectTableInteractor();
function navigateTo(path: string) {
  beforeEach(async function () {
    visit(path);
    await when( () => expect(location().pathname).to.equal(path));
    await when( () => page.isPresent);
  });
}

const screens = [{
  path: '/directory',
  name: 'Project Directory',
  config: {},
}, {
  path: '/projects/own',
  name: 'My Projects',
  config: {},
}, {
  path: '/projects/archived',
  name: 'Archived Projects',
  config: {
    data: { currentOrganizationId: '1' }
  },
}, {
  path: '/projects/organization',
  name: 'Organization Projects',
  config: {
    data: { currentOrganizationId: '1' }
  }
}, {
  path: '/projects/all',
  name: 'All Projects',
  config: {
    data: { currentOrganizationId: '1' }
  }
}];

describe('Acceptance | Sorting', () => {
  setupRequestInterceptor();

  beforeEach(function () {
    this.mockGet(200, 'product-definitions', { data: [] });
  });

  screens.forEach(screen => {
    setupApplicationTest(screen.config);
    useFakeAuthentication();

    describe(`on the ${screen.name} page`, () => {

      describe('there are 0 projects', () => {
        beforeEach(function() {
          this.mockGet(200, 'projects', zeroProjects);
        });

        navigateTo(screen.path);

        it('Sorting is not displayed',() => {
          expect(page.isSortingUp).to.equal(false);
          expect(page.isSortingDown).to.equal(false);
        });
      });

      describe('there is less than one page worth of projects', () => {
        beforeEach(function() {
          this.mockGet(200, 'projects', fullPageOfProjects);
        });

        navigateTo(screen.path);

        it('default sort is displayed', () => {
          expect(page.isSortingUp).to.equal(true);
          expect(page.isSortingDown).to.equal(false);
        });


        describe('a sortable column is clicked', () => {
          beforeEach(async () => {
            await page.clickColumn('Project');
          });

          it('sorts down', () => {
            expect(page.isSortingUp).to.equal(false);
            expect(page.isSortingDown).to.equal(true);
          });

          describe('the same sortable column is clicked again', () => {
            beforeEach(async function() {
              await page.clickColumn('Project');
            });

            it('sorts up', () => {
              expect(page.isSortingUp).to.equal(true);
              expect(page.isSortingDown).to.equal(false);
            });
          });
        });
      });
    });
  });

});
