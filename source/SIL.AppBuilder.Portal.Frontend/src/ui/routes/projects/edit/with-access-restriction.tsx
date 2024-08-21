import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import * as toast from '@lib/toast';
import { i18nProps } from '@lib/i18n';
import {
  buildFindRelatedRecord,
  UserResource,
  ProjectResource,
  OrganizationResource,
  withLoader,
} from '@data';
import { withRelationships } from '@data/containers/with-relationship';

interface INeededProps {
  currentUser: UserResource;
  project: ProjectResource;
}

interface IProvidedProps {
  currentUserOrganizations: OrganizationResource[];
  projectOrg: OrganizationResource;
}

// The current user must:
// - have at least organization membership that matches the
//   the organization that the project is assigned to
export function withAccessRestriction<TWrappedProps>(WrappedComponent) {
  return compose<INeededProps, TWrappedProps>(
    withRelationships((props: INeededProps) => {
      const { currentUser } = props;

      return {
        currentUserOrganizations: [currentUser, 'organizationMemberships', 'organization'],
      };
    }),
    withOrbit((passedProps: INeededProps) => {
      const { project } = passedProps;

      return {
        projectOrg: (q) => buildFindRelatedRecord(q, project, 'organization'),
      };
    }),
    withLoader(
      ({ projectOrg, currentUserOrganizations }) => !projectOrg || !currentUserOrganizations
    )
  )((props: INeededProps & IProvidedProps & i18nProps) => {
    const { t, currentUserOrganizations, projectOrg } = props;

    const currentUserOrgIds = currentUserOrganizations.map((o) => o.id);

    const isAMember = currentUserOrgIds.includes(projectOrg.id);

    if (isAMember) {
      return <WrappedComponent {...props} />;
    }

    toast.error(t('errors.notAMemberOfOrg'));

    return <Redirect push={true} to={'/'} />;
  });
}
