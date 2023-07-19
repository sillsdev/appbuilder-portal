import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  resetBrowser,
} from 'tests/helpers/index';

import page from './page';

async function visitTheFilesTab() {
  visit('/projects/1');
  await when(() => page.isPresent);
  await page.switchToFilesTab();
  await when(() => page.projectFiles.isPresent);
}

const projectResource = (attributes = {}, relationships = {}) => {
  return {
    type: 'projects',
    id: 1,
    attributes: {
      name: 'Fake project',
      workflowProjectUrl: 'project.url',
      ...attributes,
    },
    relationships: {
      organization: { data: { id: 1, type: 'organizations' } },
      group: { data: { id: 1, type: 'groups' } },
      owner: { data: { id: 2, type: 'users' } },
      reviewers: { data: [] },
      products: { data: [{ id: 1, type: 'products' }] },
      ...relationships,
    },
  };
};

const defaultIncluded = () => {
  return [
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
    },
    {
      type: 'product-definitions',
      id: 2,
      attributes: {
        description: 'Publish Android App to Google Play',
        name: 'android_amazon_app',
      },
    },
  ];
};

const scenarios = {
  noBuilds: {
    data: projectResource(),
    included: [
      ...defaultIncluded(),
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
          productBuilds: { data: [] },
          store: { data: { type: 'stores', id: 1 } },
        },
      },
      {
        type: 'stores',
        id: 1,
        attributes: {
          description: 'Test Store',
          name: 'test_store',
        },
      },
    ],
  },
  oneBuildSuccess: {
    data: projectResource(),
    included: [
      ...defaultIncluded(),
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
          productBuilds: { data: [{ type: 'product-build', id: 1 }] },
          store: { data: { type: 'stores', id: 1 } },
        },
      },
      {
        type: 'product-build',
        id: 1,
        attributes: {
          version: 'v1.0.0',
        },
        relationships: {
          product: { data: { type: 'product', id: 1 } },
        },
      },
      {
        type: 'stores',
        id: 1,
        attributes: {
          description: 'Test Store',
          name: 'test_store',
        },
      },
    ],
  },
  oneBuildPending: {
    data: projectResource(),
    included: [
      ...defaultIncluded(),
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
          productBuilds: { data: [{ type: 'product-build', id: 1 }] },
          store: { data: { type: 'stores', id: 1 } },
        },
      },
      {
        type: 'product-build',
        id: 1,
        attributes: {
          version: null,
        },
        relationships: {
          product: { data: { type: 'product', id: 1 } },
        },
      },
      {
        type: 'stores',
        id: 1,
        attributes: {
          description: 'Test Store',
          name: 'test_store',
        },
      },
    ],
  },
  oneBuildPublished: {
    data: projectResource(),
    included: [
      ...defaultIncluded(),
      {
        type: 'products',
        id: 1,
        attributes: {
          'date-created': '2018-10-20T16:19:09.878193',
          'date-updated': '2018-10-20T16:19:09.878193',
          'date-built': '2018-10-20T16:19:09.878193',
          'date-published': '2018-10-20T16:19:09.878193',
        },
        relationships: {
          'product-definition': { data: { type: 'product-definitions', id: 1 } },
          project: { data: { type: 'projects', id: 1 } },
          productBuilds: { data: [{ type: 'product-build', id: 1 }] },
          productPublications: { data: [{ type: 'product-publication', id: 1 }] },
          store: { data: { type: 'stores', id: 1 } },
        },
      },
      {
        type: 'product-build',
        id: 1,
        attributes: {
          version: 'v1.0.0',
        },
        relationships: {
          product: { data: { type: 'product', id: 1 } },
          productPublications: { data: [{ type: 'product-publication', id: 1 }] },
        },
      },
      {
        type: 'product-publication',
        id: 1,
        attributes: {
          'release-id': '1',
          channel: 'production',
          'log-url':
            'https://prd-aps-artifacts.s3.amazonaws.com/dem/jobs/publish_scriptureappbuilder_17/50/console.log',
          success: true,
          'date-created': '2018-10-20T16:19:09.878193',
          'date-updated': '2018-10-20T16:19:09.878193',
        },
        relationships: {
          product: { data: { type: 'product', id: 1 } },
          productBuild: { data: { type: 'product-build', id: 1 } },
        },
      },
      {
        type: 'stores',
        id: 1,
        attributes: {
          description: 'Test Store',
          name: 'test_store',
        },
      },
    ],
  },
  oneBuildPublishInProgress: {
    data: projectResource(),
    included: [
      ...defaultIncluded(),
      {
        type: 'products',
        id: 1,
        attributes: {
          'date-created': '2018-10-20T16:19:09.878193',
          'date-updated': '2018-10-20T16:19:09.878193',
          'date-built': '2018-10-20T16:19:09.878193',
        },
        relationships: {
          'product-definition': { data: { type: 'product-definitions', id: 1 } },
          project: { data: { type: 'projects', id: 1 } },
          productBuilds: { data: [{ type: 'product-build', id: 1 }] },
          productPublications: { data: [{ type: 'product-publication', id: 1 }] },
          store: { data: { type: 'stores', id: 1 } },
        },
      },
      {
        type: 'product-build',
        id: 1,
        attributes: {
          version: 'v1.0.0',
        },
        relationships: {
          product: { data: { type: 'product', id: 1 } },
          productPublications: { data: [{ type: 'product-publication', id: 1 }] },
        },
      },
      {
        type: 'product-publication',
        id: 1,
        attributes: {
          'release-id': '1',
          channel: 'production',
          'date-created': '2018-10-20T16:19:09.878193',
          'date-updated': '2018-10-20T16:19:09.878193',
        },
        relationships: {
          product: { data: { type: 'product', id: 1 } },
          productBuild: { data: { type: 'product-build', id: 1 } },
        },
      },
      {
        type: 'stores',
        id: 1,
        attributes: {
          description: 'Test Store',
          name: 'test_store',
        },
      },
    ],
  },
};
