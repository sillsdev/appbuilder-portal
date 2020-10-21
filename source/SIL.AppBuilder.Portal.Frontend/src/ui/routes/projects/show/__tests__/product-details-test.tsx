import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect, assert } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers/index';

import { ProductsInteractor } from '~/ui/routes/projects/show/overview/products/-page.ts';

import i18n from '@translations';

describe('Acceptance | Project View | Products Details', () => {
  useFakeAuthentication();
  setupApplicationTest();

  let page;

  beforeEach(function() {
    page = new ProductsInteractor();

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
        {
          type: 'users',
          id: 2,
          attributes: {
            name: 'Tester 2',
            familyName: 'last',
            givenName: 'first',
            workflowUserId: '0d824435-ae92-44b5-a876-44ca7a9085a9',
          },
        },
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

    this.mockGet(200, 'products/1/transitions', {
      data: [
        {
          attributes: {
            'workflow-user-id': null,
            'allowed-user-names': null,
            'initial-state': null,
            'destination-state': null,
            'transition-type': 2,
            'workflow-type': 1,
            'date-transition': '2018-10-20T16:19:09.878193',
            command: null,
            comment: null,
          },
          relationships: {},
          type: 'product-transitions',
          id: '2647',
        },
        {
          attributes: {
            'workflow-user-id': '0d824435-ae92-44b5-a876-44ca7a9085a9',
            'allowed-user-names': 'Tester 1',
            'initial-state': 'Readiness Check',
            'destination-state': 'Approval',
            'transition-type': 1,
            'date-transition': '2018-10-20T16:19:09.878193',
            command: 'Continue',
            comment: 'Looks Good',
          },
          relationships: {},
          type: 'product-transitions',
          id: '2648',
        },
        {
          attributes: {
            'workflow-user-id': null,
            'allowed-user-names': null,
            'initial-state': 'Product Creation',
            'transition-type': 1,
            'destination-state': 'Check Product Creation',
            'date-transition': '2018-10-20T16:19:09.878193',
            command: null,
          },
          relationships: {},
          type: 'product-transitions',
          id: '2649',
        },
        {
          attributes: {
            'workflow-user-id': null,
            'allowed-user-names': 'Tester 1',
            'initial-state': 'App Builder Configuration',
            'transition-type': 1,
            'destination-state': 'Product Build',
            'date-transition': null,
            command: null,
            comment: null,
          },
          relationships: {},
          type: 'product-transitions',
          id: '2650',
        },
        {
          attributes: {
            'workflow-user-id': null,
            'allowed-user-names': null,
            'initial-state': 'Product Build',
            'transition-type': 1,
            'destination-state': 'Check Product Build',
            'date-transition': null,
            command: null,
            comment: null,
          },
          relationships: {},
          type: 'product-transitions',
          id: '2651',
        },
        {
          attributes: {
            'workflow-user-id': null,
            'allowed-user-names': null,
            'initial-state': null,
            'destination-state': null,
            'transition-type': 3,
            'workflow-type': 1,
            'date-transition': '2018-10-20T16:19:09.878193',
            command: null,
            comment: null,
          },
          relationships: {},
          type: 'product-transitions',
          id: '2652',
        },
        {
          attributes: {
            'workflow-user-id': null,
            'allowed-user-names': null,
            'initial-state': null,
            'destination-state': null,
            'transition-type': 2,
            'workflow-type': 2,
            'date-transition': '2018-10-20T16:19:09.878193',
            command: null,
            comment: null,
          },
          relationships: {},
          type: 'product-transitions',
          id: '2653',
        },
        {
          attributes: {
            'workflow-user-id': null,
            'allowed-user-names': null,
            'initial-state': null,
            'destination-state': null,
            'transition-type': 4,
            'workflow-type': 2,
            'date-transition': '2018-10-20T16:19:09.878193',
            command: null,
            comment: null,
          },
          relationships: {},
          type: 'product-transitions',
          id: '2654',
        },
        {
          attributes: {
            'workflow-user-id': null,
            'allowed-user-names': null,
            'initial-state': null,
            'destination-state': null,
            'transition-type': 2,
            'workflow-type': 3,
            'date-transition': '2018-10-20T16:19:09.878193',
            command: null,
            comment: null,
          },
          relationships: {},
          type: 'product-transitions',
          id: '2655',
        },
        {
          attributes: {
            'workflow-user-id': null,
            'allowed-user-names': null,
            'initial-state': 'Check Product Build',
            'transition-type': 1,
            'destination-state': 'Synchronize Data',
            'date-transition': '2018-10-20T16:19:09.878193',
            command: null,
            comment:
              'system.publish-failed,https://dem-aps-artifacts.s3.amazonaws.com/dem/jobs/publish_scriptureappbuilder_1/1/console.log',
          },
          relationships: {},
          type: 'product-transitions',
          id: '2656',
        },
      ],
      meta: { 'total-records': 10 },
    });
  });

  beforeEach(async function() {
    await visit('/projects/1');
    await when(() => page.products().length === 1);
  });
  describe('the user selects the project', () => {
    let details;

    beforeEach(async function() {
      await page.productNamed('android_s3').clickDetailsLink();
      await when(() => page.detailsModal.details().length === 10);
    });
    it('opens modal', () => {
      expect(page.detailsModal.isVisible).to.be.true;
    });
    it('has a button with Details text', () => {
      expect(page.productNamed('android_s3').detailsText).to.equal('Details');
    });
    it('sets command', () => {
      expect(page.detailsModal.detailNamed('Readiness Check').command).to.equal('Continue');
    });
    it('sets comment', () => {
      expect(page.detailsModal.detailNamed('Readiness Check').comment).to.equal('Looks Good');
    });
    it('sets user to transition name for transition with transition date', () => {
      expect(page.detailsModal.detailNamed('Readiness Check').user).to.equal('Tester 2');
    });
    it('sets user to scriptoria for transition with date and no wf user id', () => {
      expect(page.detailsModal.detailNamed('Product Creation').user).to.equal('Scriptoria');
    });
    it('sets user to allowed names for transition with no transition date', () => {
      expect(page.detailsModal.detailNamed('App Builder Configuration').user).to.equal('Tester 1');
    });
    it('sets user to scriptoria for transition with no date and no allowed user', () => {
      expect(page.detailsModal.detailNamed('Product Build').user).to.equal('Scriptoria');
    });
    it('has a startup workflow started entry with empty user', () => {
      expect(page.detailsModal.detailNamed('Startup Workflow Started').user).to.be.empty;
    });
    it('has a startup workflow completed entry with empty user', () => {
      expect(page.detailsModal.detailNamed('Startup Workflow Completed').user).to.be.empty;
    });
    it('has a rebuild workflow started entry', () => {
      expect(page.detailsModal.detailNamed('Rebuild Workflow Started').user).to.be.empty;
    });
    it('has a rebuild workflow cancelled entry', () => {
      expect(page.detailsModal.detailNamed('Rebuild Workflow Cancelled').user).to.be.empty;
    });
    it('has a republish workflow started entry', () => {
      expect(page.detailsModal.detailNamed('Republish Workflow Started').user).to.be.empty;
    });
    describe('a publish error entry', () => {
      it('has a translated comment', () => {
        expect(page.detailsModal.detailNamed('Check Product Build').comment).to.contain(
          'Publish failed'
        );
      });
      it('has a link to the console text file', () => {
        expect(page.detailsModal.detailNamed('Check Product Build').commentLink).to.contain(
          'Console Text'
        );
      });
    });
  });
});
