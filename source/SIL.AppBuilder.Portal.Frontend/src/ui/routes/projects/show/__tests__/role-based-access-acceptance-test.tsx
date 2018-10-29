import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest, setupRequestInterceptor, useFakeAuthentication
} from 'tests/helpers/index';


import {
  currentUserIsOrgAdmin,
  currentUserIsSuperAdmin,
  currentUserIsAppBuilder,
  currentUserHasNoRoles,
  currentUserOwnsProject,
  currentUserDoesNotOwnProject
} from './user-scenarios';

import page from './page';

const accessGrantedPath = '/projects/1';

function attemptsToVisitTheProject() {
  beforeEach(async function() {
    await visit(accessGrantedPath);
  });
}


describe('Acceptance | Project View | Role Based Access', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  describe('Current User Owns the Project', () => {
    const projectName = 'owned by current user';

    currentUserHasNoRoles();
    currentUserOwnsProject(projectName);
    attemptsToVisitTheProject();

    it('shows the project page', () => {
      expect(page.projectName).to.equal(projectName);
    });
  });

  describe('Current User does not own the Project', () => {
    const projectName = 'not owned by the current user';
    const accessDeniedPath = '/tasks';

    describe('Current User is a Super Admin', () => {
      currentUserIsSuperAdmin();
      currentUserDoesNotOwnProject(projectName);
      attemptsToVisitTheProject();

      it('shows the project page', () => {
        expect(location().pathname).to.equal(accessGrantedPath);
        expect(page.projectName).to.equal(projectName);
      });
    });

    describe('Current User is an Organization Admin', () => {
      describe('for the organization that the project belongs to', () => {
        currentUserIsOrgAdmin({ orgId: 1 });
        currentUserDoesNotOwnProject(projectName);
        attemptsToVisitTheProject();

        it('shows the project page', () => {
          expect(location().pathname).to.equal(accessGrantedPath);
          expect(page.projectName).to.equal(projectName);
        });
      });

      describe('for a different organization than what the project belongs to', () => {
        currentUserIsOrgAdmin({ orgId: 2 });
        currentUserDoesNotOwnProject(projectName);
        attemptsToVisitTheProject();

        it('does not show the page', () => {
          expect(location().pathname).to.equal(accessDeniedPath);
        });
      });
    });

    describe('Current User is an AppBuilder', () => {
      currentUserIsAppBuilder();
      currentUserDoesNotOwnProject(projectName);
      attemptsToVisitTheProject();

      it('does not show the page', () => {
        expect(location().pathname).to.equal(accessDeniedPath);
      });
    });

  });


});
