import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import Convergence, { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  resetBrowser,
} from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Project View | Products', () => {
  resetBrowser();
  useFakeAuthentication();
  setupApplicationTest();

  describe('Show list of products', () => {
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
      this.mockGet(200, 'organization-stores', { data: [] });
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
                name: 'android_amazon_app',
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
              type: 'workflow-definition',
              id: 1,
              attributes: {},
              relationships: {
                'store-type': {
                  data: {
                    id: 1,
                    type: 'store-type',
                  },
                },
              },
            },
            {
              type: 'workflow-definition',
              id: 2,
              attributes: {},
              relationships: {
                'store-type': {
                  data: null,
                },
              },
            },
            {
              type: 'store-type',
              id: 1,
              attributes: {},
              relationships: {},
            },
          ],
        },
        requestCustomizer
      );
      this.mockPost(
        200,
        'products',
        {
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
            },
          },
        },
        requestCustomizer
      );
      this.mockDelete(204, 'products/1', requestCustomizer);
    });

    beforeEach(async function() {
      await visit('/projects/1');
    });

    it('navigates to project detail page', () => {
      expect(location().pathname).to.equal('/projects/1');
    });

    it('show product list', () => {
      const productList = page.productsInteractor.itemsText();
      const productsText = productList.map((item) => item.text);

      expect(productsText).to.contain('android_s3');
    });

    describe('select products that do not require a store', () => {
      beforeEach(async function() {
        await new Convergence()
          .do(() => page.productsInteractor.clickManageProductButton())
          .when(() => page.productsInteractor.modalInteractor.isVisible);
      });

      it('has render product definitions', () => {
        const items = page.productsInteractor.modalInteractor.multiSelectInteractor.itemsText();
        const itemTexts = items.map((item) => item.text);
        expect(itemTexts).to.contain('android_s3');
        expect(itemTexts).to.contain('android_amazon_app');
      });

      it.always('project product is selected', () => {
        const selector = page.productsList.modal.multiSelect;

        expect(selector.itemNamed('android_s3').isChecked).to.equal(true);
        expect(selector.itemNamed('android_amazon_app').isChecked).to.equal(false);
      });

      describe('select a new product', () => {
        beforeEach(async function() {
          await when(() => page.productsList.modal.isVisible);
          await page.productsList.modal.multiSelect.itemNamed('android_amazon_app').toggle();
          await when(() => page.productsList.products().length === 2);
        });

        it('product is added to product list', () => {
          const productList = page.productsList.itemsText();
          const productsText = productList.map((item) => item.text);

          expect(productsText).to.contain('android_s3');
          expect(productsText).to.contain('android_amazon_app');
        }).timeout(2000);

        it('project product is selected', () => {
          const selector = page.productsList.modal.multiSelect;

          expect(selector.itemNamed('android_s3').isChecked).to.equal(true);
          expect(selector.itemNamed('android_amazon_app').isChecked).to.equal(true);
        }).timeout(2000);
      });

      describe('ignores requests until previous request has completed.', () => {
        let requestCount;
        beforeEach(async function() {
          requestCount = 0;

          customizer = async (server, req, resp) => {
            if (
              req.method === 'POST' ||
              (req.method === 'DELETE' && /\/api\/products/.test(req.pathname))
            ) {
              ++requestCount;
              await server.timeout(1000);
            }
          };

          await page.productsList.modal.multiSelect.itemNamed('android_amazon_app').toggle();
          await page.productsList.modal.multiSelect.itemNamed('android_amazon_app').toggle();
          await page.productsList.modal.multiSelect.itemNamed('android_amazon_app').toggle();
        });

        it('is only requested once.', () => {
          expect(requestCount).to.equal(1);
        }).timeout(4000);

        it('product is added to product list', () => {
          const productList = page.productsInteractor.itemsText();
          const productsText = productList.map((item) => item.text);

          expect(productsText).to.contain('android_s3');
          expect(productsText).to.contain('android_amazon_app');
        }).timeout(4000);

        it('project product is selected', () => {
          const selector = page.productsList.modal.multiSelect;

          expect(selector.itemNamed('android_s3').isChecked).to.equal(true);
          expect(selector.itemNamed('android_amazon_app').isChecked).to.equal(true);
        }).timeout(4000);

        describe('and on deselect', () => {
          beforeEach(async () => {
            await new Convergence()
              .when(
                () => page.productsList.modal.multiSelect.itemNamed('android_amazon_app').isChecked
              )
              .do(async () => {
                await page.productsList.modal.multiSelect.itemNamed('android_amazon_app').toggle();
                await page.productsList.modal.multiSelect.itemNamed('android_amazon_app').toggle();
                await page.productsList.modal.multiSelect.itemNamed('android_amazon_app').toggle();
              });
            await when(
              () => page.productsList.modal.multiSelect.itemNamed('android_amazon_app').isChecked
            );
          });
          it('is only requested one additional time.', () => {
            expect(requestCount).to.equal(2);
          }).timeout(4000);
        });
      });
    });
  });

  describe('Workflow project URL not present', () => {
    beforeEach(function() {
      this.mockGet(200, 'users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, 'projects/1', {
        data: {
          type: 'projects',
          id: 1,
          attributes: {
            name: 'Fake project',
            workflowProjectUrl: null,
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
      });
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
          },
        },
      });
    });

    beforeEach(async function() {
      await visit('/projects/1');
    });

    it('navigates to project detail page', () => {
      expect(location().pathname).to.equal('/projects/1');
    });

    describe('try to add a product to the list', () => {
      beforeEach(async function() {
        await page.productsInteractor.clickManageProductButton();
      });

      it('popup is not visible', () => {
        expect(page.isProductModalPresent).to.be.false;
      });
    });
  });

  describe('Show empty product list', () => {
    beforeEach(function() {
      this.mockGet(200, 'users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
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
        ],
      });
    });

    beforeEach(async function() {
      await visit('/projects/1');
    });

    it('navigates to project detail page', () => {
      expect(location().pathname).to.equal('/projects/1');
    });

    it('render empty list', () => {
      expect(page.productsInteractor.emptyLabel).to.contain(
        'You have no products for this project.'
      );
    });
  });

  describe('Show product list', () => {
    beforeEach(function() {
      this.mockGet(200, 'users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
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
            type: 'products',
            id: 1,
            attributes: {
              'date-created': '2018-10-20T16:19:09.878193',
              'date-updated': '2018-10-20T16:19:09.878193',
              'date-built': '2018-10-30T14:19:09.878193',
              'date-published': '2018-10-30T16:19:09.878193',
              'publish-link':
                'https://play.google.com/store/apps/details?id=org.wycliffe.app.eng.bible.t4t',
            },
            relationships: {
              'product-definition': { data: { type: 'product-definitions', id: 1 } },
              project: { data: { type: 'projects', id: 1 } },
            },
          },
          {
            type: 'products',
            id: 2,
            attributes: {
              'date-created': '2018-10-20T16:19:09.878193',
              'date-updated': '2018-10-20T16:19:09.878193',
              'date-built': '2018-10-30T14:19:09.878193',
              'date-published': null,
              'publish-link': null,
            },
            relationships: {
              'product-definition': { data: { type: 'product-definitions', id: 2 } },
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
      });
    });

    beforeEach(async function() {
      await visit('/projects/1');
      await when(() => page.productsInteractor.products().length === 2);
    });

    it('navigates to project detail page', () => {
      expect(location().pathname).to.equal('/projects/1');
    });

    it('shows the icon link for a product with a link', () => {
      expect(page.productsList.productNamed('android_s3').hasProductLink).to.equal(true);
    });

    it('does not shows the icon link for a product without a link', () => {
      expect(page.productsList.productNamed('android_amazon_app').hasProductLink).to.equal(false);
    });
  });
});
