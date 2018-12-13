import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication
} from 'tests/helpers/index';

import multiSelect from '@ui/components/inputs/multi-select/-page';

describe('Acceptance | Organization Settings | Store view', () => {

  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('Store setting page', () => {

    beforeEach(function () {

      this.mockGet(200, '/organizations/1', {
        data: {
          id: 1,
          type: 'organizations',
          attributes: {},
          relationships: {
            'organization-stores': { data: [] }
          }
        }
      });

      this.mockGet(200, '/stores', {
        data: [{
          id: 2,
          type: 'stores',
          attributes: {
            name: 'Store name 1',
            description: 'Store description 1'
          }
        }, {
          id: 3,
          type: 'stores',
          attributes: {
            name: 'Store name 2',
            description: 'Store description 2'
          }
        }],
        meta: { 'total-records': 2 }
      });

    });

    beforeEach(async function () {
      await visit('/organizations/1/settings/stores');
    });

    it('is in store organization settings page', () => {
      expect(location().pathname).to.equal('/organizations/1/settings/stores');
    });

    it('show store list', () => {
      const storeList = multiSelect.itemsText();
      const storeText = storeList.map(item => item.text);

      expect(storeText).to.contain('Store name 1');
      expect(storeText).to.contain('Store name 2');
    });

    describe('with store list', () => {

      beforeEach(function () {
        this.mockPost(201, '/organization-stores', {
          data: {
            attributes: {},
            id: '1',
            type: 'organization-stores',
            relationships: {
              organization: { data: { id: 1, type: 'organizations' } },
              store: { data: { id: 2, type: 'stores' } }
            }
          }
        });
      });

      describe('select first store', () => {

        beforeEach(async function () {
          await multiSelect.items(0).click();
        });


        it('first store is selected', () => {
          expect(multiSelect.items(0).isChecked).to.be.true;
          expect(multiSelect.items(1).isChecked).to.be.false;
        });

        describe('unselect it', () => {

          beforeEach(function () {
            this.mockDelete(204, 'organization-stores/1');
          });

          beforeEach(async function () {
            const storeList = multiSelect.items();
            await storeList[0].click();
          });

          it('no store is selected', () => {
            expect(true).to.be.true;
            expect(multiSelect.items(0).isChecked).to.be.false;
            expect(multiSelect.items(1).isChecked).to.be.false;
          });

        });

      });
    });

  });

  describe('Empty stores', () => {

    beforeEach(function () {

      this.mockGet(200, '/organizations/1', {
        data: {
          id: 1,
          type: 'organizations',
          attributes: {},
          relationships: {
            'organization-stores': { data: [] }
          }
        }
      });

      this.mockGet(200, '/stores', {
        data: [],
        meta: { 'total-records': 0 }
      });

    });

    beforeEach(async function () {
      await visit('/organizations/1/settings/stores');
    });

    it('displays empty store label', () => {
      expect(location().pathname).to.equal('/organizations/1/settings/stores');
      expect(multiSelect.isListEmpty).to.be.true;
    });
  });
});