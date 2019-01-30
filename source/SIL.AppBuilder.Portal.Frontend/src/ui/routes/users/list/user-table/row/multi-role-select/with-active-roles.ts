import { compose, mapProps, withProps } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import pick from 'lodash/pick';
import { withTranslations, i18nProps } from '@lib/i18n';

import {
  OrganizationResource,
  UserResource,
  RoleResource,
  UserRoleResource,
  attributesFor,
  idFor,
  relationshipFor,
  recordsWithIdIn,
  withLoader,
} from '@data';

import { isEmpty, unique, areResourceListsEqual, areResourcesEqual } from '@lib/collection';

import { withCurrentUserContext } from '~/data/containers/with-current-user';

interface INeededProps {
  user: UserResource;
  organization: OrganizationResource;
  roles: RoleResource[];
}

interface IAfterUserRoles {
  userRoles: UserRoleResource[];
}

export const withActiveRoles = (InnerComponent) =>
  compose(
    withTranslations,
    withCurrentUserContext,
    withOrbit((props: INeededProps) => {
      const { user } = props;

      return {
        userRoles: (q) => q.findRelatedRecords(user, 'userRoles'),
      };
    }),
    withLoader(({ userRoles }) => !userRoles),
    mapProps((allProps: any) => {
      const remainingProps = pick(allProps, [
        'user',
        'userRoles',
        'currentUser',
        'organization',
        'roles',
        't',
      ]);

      return remainingProps;
    }),
    withProps((props: INeededProps & IAfterUserRoles & i18nProps) => {
      const { userRoles, organization, roles, t } = props;

      const applicable = userRoles.filter((userRole) => {
        const id = idFor(relationshipFor(userRole, 'organization'));

        return idFor(organization) === id;
      });

      const names = applicable.map((userRole) => {
        const roleId = idFor(relationshipFor(userRole, 'role'));
        const role = roles.find((r) => r.id === roleId);

        return attributesFor(role).roleName;
      });

      if (isEmpty(names)) {
        return { roleNames: t('users.noRoles') };
      }

      const result = unique(names)
        .sort()
        .join(', ');

      return {
        roleNames: result,
      };
    }),
    withProps(({ currentUser, user, roleNames }) => {
      const isSuperAdmin = roleNames.includes('SuperAdmin');

      return {
        editable: isSuperAdmin || currentUser.id !== user.id,
      };
    })
  )(InnerComponent);
