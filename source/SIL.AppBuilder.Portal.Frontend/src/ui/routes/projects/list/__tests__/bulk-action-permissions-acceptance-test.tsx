import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect, assert } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  wait,
  setupBrowser,
} from 'tests/helpers/index';
import { roles, userRoleFrom } from 'tests/helpers/fixtures';
import { fakeAuth0Id } from 'tests/helpers/jwt';
import { merge, mergeWith, isArray } from 'lodash';

import * as factory from './-factory';
import ProjectListPage from './-page-interactor';

import { isLoggedIn } from '~/lib/auth0';

const pageInteractor = new ProjectListPage();

function setupProjects() {
  beforeEach(function() {
    const otherOwnerProject = merge({}, factory.project, {
      id: 2,
      attributes: {
        'owner-id': 2,
        name: 'Dummy project-2',
      },
      relationships: {
        owner: {
          data: {
            id: 2,
          },
        },
      },
    });
    const projectsResponse = mergeWith(
      {},
      factory.projectsResponse,
      { data: [otherOwnerProject] },
      (objVal, srcVal) => {
        if (isArray(objVal)) {
          return [...objVal, ...srcVal];
        }
      }
    );
    this.mockGet(200, 'product-definitions', { data: [] });
    this.mockGet(200, 'projects', projectsResponse);
  });
}

async function visitOrgProjectsPage() {
  visit('/projects/organization');

  await when(() => assert(isLoggedIn(), 'is logged in'));
  await when(() =>
    assert(location().pathname === '/projects/organization', 'is on the organization page')
  );
  await when(() =>
    assert(pageInteractor.projectTable.isPresent, 'project table is rendered')
  );
  await when(() =>
    assert(pageInteractor.projectTable.rows().length === 2, 'two projects are visible')
  );
}

const users = {
  orgAdmin: {
    data: {
      id: 1,
      type: 'users',
      attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
      relationships: {
        ['organization-memberships']: {
          data: [{ id: 1, type: 'organization-memberships' }],
        },
        ['user-roles']: { data: [{ id: 1, type: 'user-roles' }] },
      },
    },
    included: [
      {
        id: 1,
        type: 'organization-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          organization: { data: { id: 1, type: 'organizations' } },
        },
      },
      {
        type: 'organizations',
        id: 1,
        attributes: { name: 'DeveloperTown' },
      },
      {
        id: 1,
        type: 'groups',
        attributes: { name: 'Some Group' },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } },
        },
      },
      userRoleFrom(roles.orgAdmin, { id: 1, userId: 1, orgId: 1 }),
      roles.orgAdmin,
    ],
  },
  appBuilder: {
    data: {
      id: 1,
      type: 'users',
      attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
      relationships: {
        ['organization-memberships']: {
          data: [{ id: 1, type: 'organization-memberships' }],
        },
        ['user-roles']: { data: [{ id: 1, type: 'user-roles' }] },
      },
    },
    included: [
      {
        id: 1,
        type: 'organization-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          organization: { data: { id: 1, type: 'organizations' } },
        },
      },
      {
        type: 'organizations',
        id: 1,
        attributes: { name: 'DeveloperTown' },
      },
      {
        id: 1,
        type: 'groups',
        attributes: { name: 'Some Group' },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } },
        },
      },
      userRoleFrom(roles.appBuilder, { id: 1, userId: 1, orgId: 1 }),
      roles.appBuilder,
    ],
  },
};

const scenarios = [
  {
    title: 'when I am an org Admin',
    user: users.orgAdmin,
    hasBulkArchive: true,
  }, {
    title: 'when I am an app builder',
    user: users.appBuilder,
    hasBulkArchive: false,
  }
]

describe('Acceptance | Projects | Bulk Action Permissions', () => {
  setupBrowser();

  scenarios.forEach(scenario => {
    context(scenario.title, () => {
      useFakeAuthentication(scenario.user);
      setupProjects();
      setupApplicationTest({ data: { currentOrganizationId: '1' }});

      describe('the project list', () => {
        beforeEach(async function() {
          await visitOrgProjectsPage();
        });
  
        it('has nothing checked initially', () => {
          const rows = pageInteractor.projectTable.rows();
  
          expect(rows[0].isSelected).to.equal(false);
          expect(rows[1].isSelected).to.equal(false);
        });
  
        context('when I select all projects (including those that I do not own)', () => {
          beforeEach(async () => {
            const rows = await pageInteractor.projectTable.rows();
  
            await rows[0].select();
            await rows[1].select();
  
            await when(() => rows[0].isSelected === true);
            await when(() => rows[1].isSelected === true);
          });
  
          it('has available bulk archive action', () => {
            expect(pageInteractor.actionHeader.archive.isPresent).to.equal(scenario.hasBulkArchive);
          });
        });

        context('when I have selected only projects that I own', () => {
          beforeEach(async () => {
            await pageInteractor.projectTable.rowForProjectId(1).select();
          });
  
          it('has available bulk archive action', () => {
            expect(pageInteractor.actionHeader.archive.isPresent).to.be.true;
          });
        });
      });
    });
  })
});
