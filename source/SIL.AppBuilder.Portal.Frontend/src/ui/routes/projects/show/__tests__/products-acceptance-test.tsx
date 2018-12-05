import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import Convergence from '@bigtest/convergence';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Project View | Products', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('Show list of products', () => {
    let customizer: (server, req, resp) => Promise<void>;
    const requestCustomizer = async (server, req, resp) => {
      if (customizer) {
        await customizer(server, req, resp);
      }
    };
    beforeEach(function () {
      customizer = null;
      this.mockGet(200, 'users', { data: [] }, requestCustomizer);
      this.mockGet(200, '/groups', { data: [] }, requestCustomizer);
      this.mockGet(200, 'projects/1', {
        data: {
          type: 'projects',
          id: 1,
          attributes: {
            name: 'Fake project',
            workflowProjectUrl: 'project.url'
          },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
            group: { data: { id: 1, type: 'groups' } },
            owner: { data: { id: 2, type: 'users' } },
            reviewers: { data: [] },
            products: { data: [{ id: 1, type: 'products' }] }
          }
        },
        included: [
          { type: 'organizations', id: 1, },
          { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
          { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
          {
            type: 'products', id: 1,
            attributes: {
              'date-created': '2018-10-20T16:19:09.878193',
              'date-updated': '2018-10-20T16:19:09.878193',
              'date-built': null,
              'date-published': null
            },
            relationships: {
              'product-definition': { data: { type: 'product-definitions', id: 1 } },
              project: { data: { type: 'projects', id: 1 } }
            }
          }, {
            type: 'organization-product-definitions', id: 1,
            attributes: {},
            relationships: {
              organization: { data: { type: 'organization', id: 1 } },
              'product-definition': { data: { type: 'product-definitions', id: 1 } }
            }
          }, {
            type: 'organization-product-definitions', id: 2,
            attributes: {},
            relationships: {
              organization: { data: { type: 'organization', id: 1 } },
              'product-definition': { data: { type: 'product-definitions', id: 2 } }
            }
          }, {
            type: 'product-definitions', id: 1,
            attributes: {
              description: 'Publish Android app to S3',
              name: 'android_s3'
            }
          }, {
            type: 'product-definitions', id: 2,
            attributes: {
              description: 'Publish Android App to Google Play',
              name: 'android_amazon_app'
            }
          }
        ]
      }, requestCustomizer);
      this.mockPost(200, 'products', {
        data: {
          id: 1,
          type: 'products',
          attributes: {
            'date-built': null,
            'date-created': "2018-10-22T17:34:37.3281818Z",
            'date-published': null,
            'date-updated': "2018-10-22T17:34:37.3281818Z",
          },
          relationships: {
            project: { data: { id: 1, type: 'projects' } },
            'product-definition': { data: { id: 2, type: 'product-definitions' } }
          }
        }
      }, requestCustomizer);
    });

    beforeEach(async function () {
      await visit('/projects/1');
    });

    it('navigates to project detail page', () => {
      expect(location().pathname).to.equal('/projects/1');
    });

    it('show product list', () => {
      const productList = page.productsInteractor.itemsText();
      const productsText = productList.map(item => item.text);

      expect(productsText).to.contain('Publish Android app to S3');
    });

    describe('manage products', () => {

      beforeEach(async function() {
        await new Convergence()
          .do(() => page.productsInteractor.clickManageProductButton() )
          .when( () => page.productsInteractor.modalInteractor.isVisible );
      });

      it('has render product definitions',() => {
        const items = page.productsInteractor.modalInteractor.multiSelectInteractor.itemsText();
        const itemTexts = items.map(item => item.text);
        expect(itemTexts).to.contain('Publish Android app to S3');
        expect(itemTexts).to.contain('Publish Android App to Google Play');
      });

      it.always('project product is selected',() => {
        const selector = page.productsInteractor.modalInteractor.multiSelectInteractor;
        expect(selector.items(0).isChecked).to.be.true;
        expect(selector.items(1).isChecked).to.be.false;
      });

      describe("select a new product", () => {
        beforeEach(async function () {
          await page.productsInteractor.modalInteractor.multiSelectInteractor.items(1).click();
        });

        it('product is added to product list', () => {
          const productList = page.productsInteractor.itemsText();
          const productsText = productList.map(item => item.text);
          expect(productsText).to.contain('Publish Android app to S3');
          expect(productsText).to.contain('Publish Android App to Google Play');
        });

        it('project product is selected',() => {
          const selector = page.productsInteractor.modalInteractor.multiSelectInteractor;
          expect(selector.items(0).isChecked).to.be.true;
          expect(selector.items(1).isChecked).to.be.true;
        });
      });

      describe("ignores requests until previous request has completed.", () => {
        let requestCount;
        beforeEach(async function () {
          requestCount = 0;
          customizer = async (server, req, resp) => {
            ++requestCount;
            console.log(req);
            await server.timeout(1000);
          };
          console.log(`select the product start ${Date.now().valueOf()}`);
          await page.productsInteractor.modalInteractor.multiSelectInteractor.items(1).click();
          await page.productsInteractor.modalInteractor.multiSelectInteractor.items(1).click();
          await page.productsInteractor.modalInteractor.multiSelectInteractor.items(1).click();
          console.log(`select the product finished ${Date.now().valueOf()}`);
        });

        it("is only requested once.", () => {
          expect(requestCount).to.equal(1);
        }).timeout(4000);

        it('product is added to product list', () => {
          const productList = page.productsInteractor.itemsText();
          const productsText = productList.map(item => item.text);
          expect(productsText).to.contain('Publish Android app to S3');
          expect(productsText).to.contain('Publish Android App to Google Play');
        }).timeout(4000);

        it('project product is selected',() => {
          const selector = page.productsInteractor.modalInteractor.multiSelectInteractor;
          expect(selector.items(0).isChecked).to.be.true;
          expect(selector.items(1).isChecked).to.be.true;
        }).timeout(4000);
      });
    });

  });

  describe('Workflow project URL not present', () => {

    beforeEach(function () {
      this.mockGet(200, 'users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, 'projects/1', {
        data: {
          type: 'projects',
          id: 1,
          attributes: {
            name: 'Fake project',
            workflowProjectUrl: null
          },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
            group: { data: { id: 1, type: 'groups' } },
            owner: { data: { id: 2, type: 'users' } },
            reviewers: { data: [] },
            products: { data: [{ id: 1, type: 'products' }] }
          }
        },
        included: [
          { type: 'organizations', id: 1, },
          { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
          { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
          {
            type: 'products', id: 1,
            attributes: {
              'date-created': '2018-10-20T16:19:09.878193',
              'date-updated': '2018-10-20T16:19:09.878193',
              'date-built': null,
              'date-published': null
            },
            relationships: {
              'product-definition': { data: { type: 'product-definitions', id: 1 } },
              project: { data: { type: 'projects', id: 1 } }
            }
          }, {
            type: 'organization-product-definitions', id: 1,
            attributes: {},
            relationships: {
              organization: { data: { type: 'organization', id: 1 } },
              'product-definition': { data: { type: 'product-definitions', id: 1 } }
            }
          }, {
            type: 'organization-product-definitions', id: 2,
            attributes: {},
            relationships: {
              organization: { data: { type: 'organization', id: 1 } },
              'product-definition': { data: { type: 'product-definitions', id: 2 } }
            }
          }, {
            type: 'product-definitions', id: 1,
            attributes: {
              description: 'Publish Android app to S3',
              name: 'android_s3'
            }
          }, {
            type: 'product-definitions', id: 2,
            attributes: {
              description: 'Publish Android App to Google Play',
              name: 'android_amazon_app'
            }
          }
        ]
      });
      this.mockPost(200, 'products', {
        data: {
          id: 1,
          type: 'products',
          attributes: {
            'date-built': null,
            'date-created': "2018-10-22T17:34:37.3281818Z",
            'date-published': null,
            'date-updated': "2018-10-22T17:34:37.3281818Z",
          },
          relationships: {
            project: { data: { id: 1, type: 'projects' } },
            'product-definition': { data: { id: 2, type: 'product-definitions' } }
          }
        }
      });
    });

    beforeEach(async function () {
      await visit('/projects/1');
    });

    it('navigates to project detail page', () => {
      expect(location().pathname).to.equal('/projects/1');
    });

    describe('try to add a product to the list', () => {

      beforeEach(async function () {
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
            workflowProjectUrl: 'project.url'
          },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
            group: { data: { id: 1, type: 'groups' } },
            owner: { data: { id: 2, type: 'users' } },
            reviewers: { data: [] },
            products: { data: [] }
          }
        },
        included: [
          { type: 'organizations', id: 1, },
          { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
          { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } }
        ]
      });
    });

    beforeEach(async function () {
      await visit('/projects/1');
    });

    it('navigates to project detail page', () => {
      expect(location().pathname).to.equal('/projects/1');
    });

    it('render empty list', () => {
      expect(page.productsInteractor.emptyLabel).to.contain('You have no products for this project.');
    });
  });

});
