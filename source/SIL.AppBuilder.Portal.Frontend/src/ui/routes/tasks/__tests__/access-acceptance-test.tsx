import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers/index';

import i18n from '@translations';

import page from './-page';

import { build } from '~/data/store-helpers';

describe('Acceptance | Accessing Tasks', () => {
  useFakeAuthentication();
  setupApplicationTest();

  beforeEach(function() {
    this.mockGet(200, '/organizations', {
      data: [
        {
          type: 'organizations',
          id: 1,
          attributes: {},
        },
      ],
    });
  });

  describe('is authenticated', () => {
    beforeEach(async function() {
      await visit('/tasks');

      expect(location().pathname).to.equal('/tasks');
    });

    it('loads the the current user', () => {
      const text = document.querySelector('section.flex.flex-grow').textContent;

      expect(text).to.not.include('what should we do here before we get the current user?');
    });
  });

  describe('there are 0 tasks', () => {
    beforeEach(async function() {
      this.mockGet(200, '/user-tasks', {
        data: [],
      });

      await visit('/tasks');
    });

    it('shows the no tasks message', () => {
      const text = page.tableText;

      expect(text).to.include(i18n.t('tasks.noTasksDescription'));
    });
  });

  describe('there are tasks', () => {
    beforeEach(async function() {
      // TODO: error: check failed TypeError: "record is undefined"
      //       don't know why.
      //       need to move on to other things atm.

      // this payload is copied from real data
      const payload = {
        data: [
          {
            attributes: {
              'activity-name': 'Definition',
              status: 'Definition',
              comment: 'a comment!',
              'date-created': '2019-01-14T15:08:37.970292',
              'date-updated': '2019-01-14T15:08:37.970292',
            },
            relationships: {
              user: { data: { type: 'users', id: '1' } },
              product: { data: { type: 'products', id: 'dce23290-e7db-40be-8f68-38553fd5378b' } },
            },
            type: 'user-tasks',
            id: '1',
          },
          {
            attributes: {
              'activity-name': 'Synchronize Data',
              status: 'Synchronize Data',
              comment:
                'system.publish-failed,https://dem-aps-artifacts.s3.amazonaws.com/dem/jobs/publish_scriptureappbuilder_1/1/console.log',
              'date-created': '2019-01-14T15:08:37.970292',
              'date-updated': '2019-01-14T15:08:37.970292',
            },
            relationships: {
              user: { data: { type: 'users', id: '1' } },
              product: { data: { type: 'products', id: 'dce23290-e7db-40be-8f68-38553fd5378b' } },
            },
            type: 'user-tasks',
            id: '2',
          },
        ],
        included: [
          {
            attributes: {
              'date-created': '2019-01-14T15:08:37.059083',
              'date-updated': '2019-01-14T15:08:37.059083',
              'workflow-job-id': 0,
              'workflow-build-id': 0,
              'date-built': null,
              'workflow-publish-id': 0,
              'workflow-comment': null,
              'date-published': null,
            },
            relationships: {
              project: {
                links: {
                  self:
                    'http://dev.scriptoria.io/api/products/dce23290-e7db-40be-8f68-38553fd5378b/relationships/project',
                  related:
                    'http://dev.scriptoria.io/api/products/dce23290-e7db-40be-8f68-38553fd5378b/project',
                },
                data: { type: 'projects', id: '1' },
              },
              'product-definition': {
                links: {
                  self:
                    'http://dev.scriptoria.io/api/products/dce23290-e7db-40be-8f68-38553fd5378b/relationships/product-definition',
                  related:
                    'http://dev.scriptoria.io/api/products/dce23290-e7db-40be-8f68-38553fd5378b/product-definition',
                },
                data: { type: 'product-definitions', id: '1' },
              },
              store: {
                links: {
                  self:
                    'http://dev.scriptoria.io/api/products/dce23290-e7db-40be-8f68-38553fd5378b/relationships/store',
                  related:
                    'http://dev.scriptoria.io/api/products/dce23290-e7db-40be-8f68-38553fd5378b/store',
                },
              },
              'store-language': {
                links: {
                  self:
                    'http://dev.scriptoria.io/api/products/dce23290-e7db-40be-8f68-38553fd5378b/relationships/store-language',
                  related:
                    'http://dev.scriptoria.io/api/products/dce23290-e7db-40be-8f68-38553fd5378b/store-language',
                },
              },
              'product-builds': {},
            },
            type: 'products',
            id: 'dce23290-e7db-40be-8f68-38553fd5378b',
          },
          {
            attributes: {
              name: 'aoeueeee',
              'type-id': 1,
              description: 'aoeu',
              'owner-id': 3,
              'organization-id': 2,
              language: 'oeau3323',
              'is-public': true,
              'date-created': '2019-01-14T15:01:05.745342',
              'date-updated': '2019-01-14T15:03:00.402189',
              'date-archived': null,
              'allow-downloads': true,
              'automatic-builds': true,
              'workflow-project-id': 172,
              'workflow-project-url':
                'ssh://APKAJAPGTSI52WSGWWRA@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-CIDT-DEV-oeau3323-aoeueeee',
            },
            relationships: {
              type: {
                links: {
                  self: 'http://dev.scriptoria.io/api/projects/1/relationships/type',
                  related: 'http://dev.scriptoria.io/api/projects/1/type',
                },
                data: { type: 'application-types', id: '1' },
              },
              owner: {
                links: {
                  self: 'http://dev.scriptoria.io/api/projects/1/relationships/owner',
                  related: 'http://dev.scriptoria.io/api/projects/1/owner',
                },
                data: { type: 'users', id: '3' },
              },
              group: {
                links: {
                  self: 'http://dev.scriptoria.io/api/projects/1/relationships/group',
                  related: 'http://dev.scriptoria.io/api/projects/1/group',
                },
                data: { type: 'groups', id: '14' },
              },
              organization: {
                links: {
                  self: 'http://dev.scriptoria.io/api/projects/1/relationships/organization',
                  related: 'http://dev.scriptoria.io/api/projects/1/organization',
                },
                data: { type: 'organizations', id: '2' },
              },
              reviewers: {},
              products: {
                data: [{ type: 'products', id: 'dce23290-e7db-40be-8f68-38553fd5378b' }],
              },
            },
            type: 'projects',
            id: '1',
          },
          {
            attributes: {
              name: 'Android App to Google Play',
              description:
                'Build an Android App from a Scripture App Builder project and publish to a Google Play Store',
            },
            relationships: {
              type: {
                links: {
                  self: 'http://dev.scriptoria.io/api/product-definitions/1/relationships/type',
                  related: 'http://dev.scriptoria.io/api/product-definitions/1/type',
                },
                data: { type: 'application-types', id: '1' },
              },
              workflow: {
                links: {
                  self: 'http://dev.scriptoria.io/api/product-definitions/1/relationships/workflow',
                  related: 'http://dev.scriptoria.io/api/product-definitions/1/workflow',
                },
                data: { type: 'workflow-definitions', id: '1' },
              },
            },
            type: 'product-definitions',
            id: '1',
          },
          {
            attributes: {
              name: 'sil_android_google_play',
              enabled: true,
              description: 'SIL Default Workflow for Publishing to Google Play',
              'workflow-scheme': 'SIL_Default_AppBuilders_Android_GooglePlay',
              'workflow-business-flow': 'SIL_Default_AppBuilders_Android_GooglePlay_Flow',
            },
            relationships: {
              'store-type': {
                links: {
                  self:
                    'http://dev.scriptoria.io/api/workflow-definitions/1/relationships/store-type',
                  related: 'http://dev.scriptoria.io/api/workflow-definitions/1/store-type',
                },
                data: { type: 'store-types', id: '1' },
              },
            },
            type: 'workflow-definitions',
            id: '1',
          },
        ],
        meta: { 'total-records': 1 },
      };

      this.mockGet(200, '/user-tasks', payload);

      await visit('/tasks');
    });

    it('renders a task with a comment', () => {
      const text = page.tableText;

      expect(text).to.include('a comment!');
    });
    describe('for a task with a failed comment', () => {
      it('displays the translated failure message', () => {
        const text = page.tableText;

        expect(text).to.include('Publish failed');
      });
      it('displays the console text link', () => {
        const text = page.tableText;

        expect(text).to.include('Console Text');
      });
    });
  });
});
