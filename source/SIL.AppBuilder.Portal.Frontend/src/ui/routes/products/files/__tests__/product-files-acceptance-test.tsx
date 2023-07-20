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

async function visitTheFilesPage() {
  visit('/products/1/files');
  await when(() => page.isPresent);
}

const defaultIncluded = () => {
  return [
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
    data: {
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
        productBuilds: { data: [] },
      },
    },
    included: [...defaultIncluded()],
  },
  oneBuildSuccess: {
    data: {
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
    included: [
      ...defaultIncluded(),
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
    data: {
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
    included: [
      ...defaultIncluded(),
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
    data: {
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
    included: [
      ...defaultIncluded(),
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
    data: {
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
    included: [
      ...defaultIncluded(),
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

describe('Acceptance | Product Files', () => {
  resetBrowser();
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
      this.mockGet(200, 'products/1', scenarios.noBuilds, requestCustomizer);
    });

    beforeEach(async () => {
      await visitTheFilesPage();
    });

    it('render no builds', () => {
      expect(page.selectedBuild).equal('No Builds Yet');
    });

    it('renders no artifacts', () => {
      expect(page.artifactCount).contains('No Product Files');
    });
  });

  describe('there is one build', () => {
    beforeEach(function() {
      this.mockGet(200, 'users', { data: [] });
      this.mockGet(200, 'groups', { data: [] });
    });

    describe('the build was successful', () => {
      beforeEach(async function() {
        this.mockGet(200, 'products/1', scenarios.oneBuildSuccess);

        await visitTheFilesPage();
      });

      it('shows the version number', () => {
        expect(page.selectedBuild).contains('v1.0.0');
      });

      it('does not show the publish detail', () => {
        expect(page.publicationInfoVisible).to.be.false;
      });
    });

    describe('the build has not yet finished', () => {
      beforeEach(async function() {
        this.mockGet(200, 'products/1', scenarios.oneBuildPending);

        await visitTheFilesPage();
      });

      it('does not show a version, and instead indicates that it is pending', () => {
        expect(page.selectedBuild).contains('Build Pending');
      });
    });

    describe('the build was published', () => {
      beforeEach(async function() {
        this.mockGet(200, 'products/1', scenarios.oneBuildPublished);

        await visitTheFilesPage();
      });

      it('shows the version number', () => {
        expect(page.selectedBuild).contains('v1.0.0');
      });

      it('shows the publish detail', () => {
        expect(page.publicationInfoVisible).to.be.true;
      });

      it('has production publishing channel', () => {
        expect(page.publicationChannel).contains('production');
      });

      it('has a successful status', () => {
        expect(page.publicationStatus).contains('Success');
      });
    });

    describe('the publish is in progress', () => {
      beforeEach(async function() {
        this.mockGet(200, 'products/1', scenarios.oneBuildPublishInProgress);

        await visitTheFilesPage();
      });

      it('shows the version number', () => {
        expect(page.selectedBuild).contains('v1.0.0');
      });

      it('does not display the publish information', () => {
        expect(page.publicationInfoVisible).to.be.false;
      });
    });
  });
});
