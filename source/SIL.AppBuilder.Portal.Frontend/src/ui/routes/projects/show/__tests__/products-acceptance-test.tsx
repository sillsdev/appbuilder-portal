import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Project View | Reviewers', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('Show list of products', () => {

    beforeEach(function () {
      this.mockGet(200, 'users', { data: [] });
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, 'projects/1', {
        data: {
          type: 'projects',
          id: 1,
          attributes: {
            name: 'Fake project'
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

    it('show product list', () => {
      const productList = page.productsInteractor.itemsText();
      const productsText = productList.map(item => item.text);

      expect(productsText).to.contain('Publish Android app to S3');
    });

    describe('select a new product', () => {

      beforeEach(async function() {
        await page.productsInteractor.clickManageProductButton();
      });

      it('popup is visible', () => {
        expect(page.productsInteractor.modalInteractor.isVisible).to.be.true;
      });

      it('has render product definitions',() => {
        const items = page.productsInteractor.modalInteractor.multiSelectInteractor.itemsText();
        const itemTexts = items.map(item => item.text);
        expect(itemTexts).to.contain('Publish Android app to S3');
        expect(itemTexts).to.contain('Publish Android App to Google Play');
      });

      it('project product is selected',() => {
        const selector = page.productsInteractor.modalInteractor.multiSelectInteractor;
        expect(selector.items(0).isChecked).to.be.true;
        expect(selector.items(1).isChecked).to.be.false;
      });

      beforeEach(async function() {
        await page.productsInteractor.modalInteractor.multiSelectInteractor.items(1).click();
      });

      it('product is added to product list', () => {
        const productList = page.productsInteractor.itemsText();
        const productsText = productList.map(item => item.text);

        expect(productsText).to.contain('Publish Android app to S3');
        expect(productsText).to.contain('Publish Android App to Google Play');
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
            name: 'Fake project'
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