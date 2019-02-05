import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  wait,
} from 'tests/helpers/index';
import { roles, userRoleFrom } from 'tests/helpers/fixtures';
import { fakeAuth0Id } from 'tests/helpers/jwt';
import { merge, mergeWith, isArray } from 'lodash';

import * as factory from './-factory';
import ProjectListPage from './-page-interactor';

import { ProjectTableInteractor } from '~/ui/components/project-table/__tests__/page';

const pageInteractor = new ProjectListPage();

describe('Acceptance | Projects | Bulk Action Permissions', () => {
  setupApplicationTest({
    data: { currentOrganizationId: '1' },
  });
  setupRequestInterceptor();

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

  context('when I am an org admin', () => {
    useFakeAuthentication({
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
    });
    describe('the project list', () => {
      beforeEach(async function() {
        visit('/projects/organization');

        await when(() => pageInteractor.projectTable.isPresent);
        await when(() => pageInteractor.projectTable.rows().length === 2);
      });

      it('has nothing checked initially', () => {
        const rows = pageInteractor.projectTable.rows();

        expect(rows[0].isSelected).to.equal(false);
        expect(rows[1].isSelected).to.equal(false);
      });

      context('when I select all projects (including those that I do not own)', () => {
        beforeEach(async () => {
          const table = new ProjectTableInteractor('[data-test-project-table]');

          await table.rows(0).select();
          await table.rows(1).select();

          await when(() => table.rows(0).isSelected === true);
          await when(() => table.rows(1).isSelected === true);
        });

        it('has available bulk archive action', () => {
          expect(pageInteractor.actionHeader.archive.isPresent).to.be.true;
        });
      });
    });
  });

  context('when i am an app builder', () => {
    useFakeAuthentication({
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
    });
    describe('the project list', () => {
      beforeEach(async function() {
        visit('/projects/organization');

        await when(() => pageInteractor.projectTable.isPresent);
        await when(() => pageInteractor.projectTable.rows().length === 2);
      });

      it('has nothing checked initially', () => {
        const rows = pageInteractor.projectTable.rows();

        expect(rows[0].isSelected).to.equal(false);
        expect(rows[1].isSelected).to.equal(false);
      });

      context('when i have selected projects that I own and do not own', () => {
        beforeEach(async () => {
          const rows = await pageInteractor.projectTable.rows();

          await rows[0].select();
          await rows[1].select();

          await when(() => rows[0].isSelected === true);
          await when(() => rows[1].isSelected === true);
        });

        it('has no bulk archive action', () => {
          expect(pageInteractor.actionHeader.archive.isPresent).to.be.false;
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
});
