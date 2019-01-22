import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import Convergence, { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  wait,
} from 'tests/helpers/index';
import { MultiSelectInteractor } from '@ui/components/inputs/multi-select/-page';

import { default as projectShowPage, ProjectInteractor } from './page';

import { ProductsInteractor } from '~/ui/routes/projects/show/overview/products/-page.ts';

describe('Acceptance | Project View | Products', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  let page;

  beforeEach(function() {
    page = new ProductsInteractor();

    this.mockGet(200, 'users', { data: [] });
    this.mockGet(200, 'groups', { data: [] });
    this.mockGet(200, 'organization-stores', {
      data: [
        {
          type: 'organization-stores',
          id: 1,
          attributes: {},
          relationships: {
            store: {
              data: {
                id: 1,
                type: 'stores',
              },
            },
            organization: {
              data: {
                id: this.currentOrganization.id,
                type: 'organizations',
              },
            },
          },
        },
      ],
      included: [
        {
          type: 'stores',
          id: 1,
          attributes: {
            name: 'google play',
          },
          relationships: {
            'store-type': {
              data: {
                id: 1,
                type: 'store-types',
              },
            },
            'organization-stores': {
              data: [{ id: 1, type: 'organization-stores' }],
            },
          },
        },
        {
          type: 'store-types',
          id: 1,
          attributes: {},
          relationships: {
            stores: {
              data: [{ id: 1, type: 'stores' }],
            },
          },
        },
      ],
    });
    this.mockGet(200, 'projects/1', {
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
          products: { data: [] },
        },
      },
      included: [
        { type: 'organizations', id: 1 },
        { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
        { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
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
          relationships: {
            workflow: {
              data: {
                id: 1,
                type: 'workflow-definition',
              },
            },
          },
        },
        {
          type: 'product-definitions',
          id: 2,
          attributes: {
            description: 'Publish Android App to Google Play',
            name: 'android_google',
          },
          relationships: {
            workflow: {
              data: {
                id: 2,
                type: 'workflow-definition',
              },
            },
          },
        },
        {
          type: 'workflow-definitions',
          id: 1,
          attributes: {},
          relationships: {
            'store-type': {
              data: {
                id: 2,
                type: 'store-types',
              },
            },
          },
        },
        {
          type: 'workflow-definitions',
          id: 2,
          attributes: {},
          relationships: {
            'store-type': {
              data: {
                id: 1,
                type: 'store-types',
              },
            },
          },
        },
        {
          type: 'store-types',
          id: 1,
          attributes: {},
          relationships: {
            'workflow-definitions': {
              data: [{ id: 2, type: 'workflow-definitions' }],
            },
          },
        },
        {
          type: 'store-types',
          id: 2,
          attributes: {
            /* this is the store type that the org is not configured to use */
          },
          relationships: {
            'workflow-definitions': {
              data: [{ id: 1, type: 'workflow-definitions' }],
            },
          },
        },
      ],
    });
  });

  beforeEach(async function() {
    await visit('/projects/1');
  });

  describe('the user clicks the add/remove products button', () => {
    let products;
    let stores;

    beforeEach(async function() {
      await page.clickManageProductButton();
      await when(() => page.modal.isVisible);

      products = new MultiSelectInteractor('[data-test-project-product-popup]');
      stores = new MultiSelectInteractor('[data-test-project-product-store-select-modal]');
    });

    it('no products are selected', () => {
      const selected = products.checkedItems();

      expect(selected.length).to.equal(0);
    });

    describe('the user clicks a product that requires a store...', () => {
      describe('... but the store is not configured for the organization', () => {
        beforeEach(async function() {
          await page.modal.multiSelect.itemNamed('android_s3').toggle();
          await when(() => stores.isVisible);
        });

        it('does not yet "check" the product', () => {
          expect(products.itemNamed('android_s3').isChecked).to.equal(false);
        });

        it('shows a message saying to contact the org admin', () => {
          const text = stores.emptyText;

          expect(text).to.include('no stores available for the selected product');
          expect(text).to.include('organization administrator');
        });
      });

      describe('... and the store is configured for the organization', () => {
        beforeEach(async function() {
          await products.itemNamed('android_google').toggle();
          await when(() => stores.isVisible);
        });

        it('does not show the empty text', () => {
          expect(stores.isListEmpty).to.equal(false);
        });

        it('shows the store options', () => {
          const items = stores.items();

          expect(items.length).to.equal(1);
        });

        describe('the user selects a store', () => {
          beforeEach(async function() {
            this.mockPost(200, 'products', {
              data: {
                id: 1,
                type: 'products',
                attributes: {
                  'date-built': null,
                  'date-created': '2018-10-22T17:34:37.3281818Z',
                  'date-published': null,
                  'date-updated': '2018-10-22T17:34:37.3281818Z',
                },
                relationships: {
                  project: { data: { id: 1, type: 'projects' } },
                  'product-definition': { data: { id: 2, type: 'product-definitions' } },
                  store: { data: { id: 1, type: 'store' } },
                },
              },
            });

            await when(() => stores.items().length > 0);
            await stores.itemNamed('google play').toggle();
            await when(() => products.checkedItems().length > 0);
          });

          it('closed the stores modal', () => {
            expect(page.isStoreModalVisible).to.equal(false);
          });

          it('the product is created, and now in the list of products', () => {
            expect(products.checkedItems().length).to.equal(1);
          });
        });
      });
    });
  });
});
