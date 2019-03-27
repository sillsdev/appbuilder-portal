import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Project View | Product Files', () => {
  useFakeAuthentication();
  setupApplicationTest();

  describe('no builds yet', () => {
    let customizer: (server, req, resp) => Promise<void>;

    const requestCustomizer = async (server, req, resp) => {
      if (customizer) {
        await customizer(server, req, resp);
      }
    };
    beforeEach(function() {
      customizer = null;
      this.mockGet(200, 'users', { data: [] }, requestCustomizer);
      this.mockGet(200, '/groups', { data: [] }, requestCustomizer);
      this.mockGet(
        200,
        'projects/1',
        {
          data: {
            type: 'projects',
            id: 1,
            attributes: {
              name: 'Fake project',
              workflowProjectUrl: 'project.url',
            },
            relationships: {
              organization: { data: { id: 1, type: 'organizations' } },
              group: { data: { id: 1, type: 'groups' } },
              owner: { data: { id: 2, type: 'users' } },
              reviewers: { data: [] },
              products: { data: [{ id: 1, type: 'products' }] },
            },
          },
          included: [
            { type: 'organizations', id: 1 },
            { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
            { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
            {
              type: 'products',
              id: 1,
              attributes: {
                'date-created': '2018-10-20T16:19:09.878193',
                'date-updated': '2018-10-20T16:19:09.878193',
                'date-built': null,
                'date-published': null,
              },
              relationships: {
                'product-definition': { data: { type: 'product-definitions', id: 1 } },
                project: { data: { type: 'projects', id: 1 } },
              },
            },
            {
              type: 'organization-product-definitions',
              id: 1,
              attributes: {},
              relationships: {
                organization: { data: { type: 'organization', id: 1 } },
                'product-definition': { data: { type: 'product-definitions', id: 1 } },
              },
            },
            {
              type: 'organization-product-definitions',
              id: 2,
              attributes: {},
              relationships: {
                organization: { data: { type: 'organization', id: 1 } },
                'product-definition': { data: { type: 'product-definitions', id: 2 } },
              },
            },
            {
              type: 'product-definitions',
              id: 1,
              attributes: {
                description: 'Publish Android app to S3',
                name: 'android_s3',
              },
            },
            {
              type: 'product-definitions',
              id: 2,
              attributes: {
                description: 'Publish Android App to Google Play',
                name: 'android_amazon_app',
              },
            },
          ],
        },
        requestCustomizer
      );
    });

    beforeEach(async () => {
      visit('/projects/1');
      await when(() => page.isPresent);
      await page.switchToFilesTab();
      await when(() => page.projectFiles.isPresent);
    });

    it('shows one product for project with one product', () => {
      expect(page.projectFiles.products().length).to.equal(1);
    });
    it('render no builds', () => {
      expect(page.projectFiles.products(0).selectedBuild).equal('No Builds Yet');
    });

    it('renders no artifacts', () => {
      expect(page.projectFiles.products(0).artifactCount).contains('No Product Files');
    });
  });
});
