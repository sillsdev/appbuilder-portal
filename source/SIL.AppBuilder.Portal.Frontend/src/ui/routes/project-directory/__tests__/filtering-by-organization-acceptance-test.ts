import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  wait
} from 'tests/helpers/index';

import page from './page';
import { threeProjects, DTProjects } from './scenarios';

describe('Acceptance | Project Directory | Filtering | By Organization', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function () {
    const { server } = this.polly;

    this.mockGet(200, 'product-definitions', { data: [] });

    server.namespace('/api', () => {
      server.get('/projects').intercept((req, res) => {
        res.status(200);
        res.headers['Content-Type'] = 'application/vnd.api+json';

        if (!req.query['filter[organization-header]']) {
          res.json(threeProjects);

        } else {
          res.json(DTProjects);
        }

        expect(req.headers.Organization).to.equal(undefined);
      });
    });
  });


  describe('navigating to the project directory page', () => {
    beforeEach(async function() {
      await visit('/directory');
    });

    it('is on the directory page', () => {
      expect(location().pathname).to.equal('/directory');
    });

    it('shows all the possible projects', () => {
      const rows = page.table.rows();

      expect(rows.length).to.equal(3);
    });

    it('defaults to all organizations', () => {
      expect(page.orgSelect.selected).to.include('All Organizations');
    });

    it('the header displays the total number of projects', () => {
      expect(page.header).to.include('(3)');
    });

    it('shows all the projects', () => {
      const rows = page.table.rows();
      const text = rows.map(r => r.text).join();

      expect(text).to.include('Dummy project');
      expect(text).to.include('project 3');
      expect(text).to.include('project 2');
    });

    describe('selecting your own organization', () => {
      let rows;

      beforeEach(async function() {
        await page.orgSelect.choose('DeveloperTown');
        await wait(500);
        rows = page.table.rows();
      });

      it('The selected organization is changed', () => {
        expect(page.orgSelect.selected).to.include('DeveloperTown');
      });

      it('shows the relevant projects', () => {
        const text = rows.map(r => r.text).join();

        expect(rows.length).to.equal(2);
        expect(text).to.include('Dummy project');
        expect(text).to.include('project 3');
      });

      it('does not show projects from another organization', () => {
        const text = rows.map(r => r.text).join();

        expect(text).to.not.include('project 2');
      });

      it('the count in the header is updated', () => {
        expect(page.header).to.include('(2)');
      });
    });
  });
});
