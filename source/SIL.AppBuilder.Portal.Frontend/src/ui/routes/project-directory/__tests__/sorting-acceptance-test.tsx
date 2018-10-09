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

describe('Acceptance | Sorting', () => {
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

        it('No sorting is displayed', () => {
          expect(page.isSortingUp).to.equal(false);
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
