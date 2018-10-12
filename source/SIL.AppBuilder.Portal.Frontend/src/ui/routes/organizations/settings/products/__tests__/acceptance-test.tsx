import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication
} from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Organization Settings | Product view', () => {

  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('Products and publishing setting page', () => {

    beforeEach(function () {

      this.mockGet(200,'/organizations/1',{
        data: {
          id: 1,
          type: 'organizations',
          attributes: {
            'public-by-default': true
          },
          relationships: {
            'organization-product-definitions': { data: [] }
          }
        }
      });

      this.mockGet(200, '/product-definitions',{
        data: [{
          id: 2,
          type: 'product-definitions',
          attributes: {
            name: 'first fake product definition',
            description: 'first fake product description'
          }
        },{
          id: 3,
          type: 'product-definitions',
          attributes: {
            name: 'Fake product definition',
            description: 'fake product description'
          }
        }],
        meta: { 'total-records': 2 }
      });

    });

    beforeEach(async function () {
      await visit('/organizations/1/settings/products');
    });

    it('is in product organization settings page', () => {
      expect(location().pathname).to.equal('/organizations/1/settings/products');
    });

    it('show product definition list', () => {
      const productList = page.productsText();
      const productDefinitionText = productList.map(item => item.text);

      expect(productDefinitionText).to.contain('first fake product description');
      expect(productDefinitionText).to.contain('fake product description');
    });

    describe('with product definition list',() => {

      beforeEach(function () {
        this.mockPost(201,'/organization-product-definitions',{
          data: {
            attributes: {},
            id: '1',
            type: 'organization-product-definitions',
            relationships: {
              organization: { data: { id: 1, type: 'organizations'} },
              'product-definition': { data: { id: 2, type: 'product-definitions'} }
            }
          }
        });
      });

      describe('check first product definition',() => {

        beforeEach(async function() {
          await page.products(0).click();
        });


        it('first product definition is selected', () => {
          expect(page.products(0).isChecked).to.be.true;
          expect(page.products(1).isChecked).to.be.false;
        });

        describe('uncheck it', () => {

          beforeEach(function () {
            this.mockDelete(204, 'organization-product-definitions/1');
          });

          beforeEach(async function() {
            const productList = page.products();
            await productList[0].click();
          });

          it('first product definition is un selected', () => {
            expect(true).to.be.true;
            expect(page.products(0).isChecked).to.be.false;
            expect(page.products(1).isChecked).to.be.false;
          });

        });

      });
    });

  });

  describe('Empty products', () => {

    beforeEach(function () {

      this.mockGet(200, '/organizations/1', {
        data: {
          id: 1,
          type: 'organizations',
          attributes: {
            'public-by-default': true
          },
          relationships: {
            'organization-product-definitions': { data: [] }
          }
        }
      });

      this.mockGet(200, '/product-definitions', {
        data: [],
        meta: { 'total-records': 0 }
      });

    });

    beforeEach(async function () {
      await visit('/organizations/1/settings/products');
    });

    it('displays empty product label', () => {
      expect(location().pathname).to.equal('/organizations/1/settings/products');
      expect(page.isProductListEmpty).to.be.true;
    });

  });



});