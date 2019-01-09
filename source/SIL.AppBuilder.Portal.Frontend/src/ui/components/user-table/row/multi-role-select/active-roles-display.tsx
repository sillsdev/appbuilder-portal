import * as React from 'react';
import { withProps, compose } from 'recompose';

import { withUserRoles, IUserRoleProps } from '@data/containers/resources/user';

import {
  UserRoleResource,
  RoleResource,
  UserResource,
  OrganizationResource,
  attributesFor,
} from '@data';

import { compareVia } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';

interface INeededProps {
  userRoles: UserRoleResource[];
  roles: RoleResource[];
  user: UserResource;
  organization: OrganizationResource;
}

interface IOwnProps {}

type IProps = IOwnProps & i18nProps & IUserRoleProps;

export default compose<IProps, INeededProps>(
  withTranslations,
  withProps((props: INeededProps) => {
    const { user, organization } = props;

    return {
      propsforUserRoles: {
        user,
        organization,
      },
    };
  }),
  withUserRoles
)(({ user, roles, userHasRole, organization, t }) => {
  const activeRoles = roles
    .filter(role => userHasRole(role))
    .sort(compareVia(r => attributesFor(r).roleName));

  if (activeRoles.length === 0) {
    return t('users.noRoles');
  }

  return activeRoles.map(role => attributesFor(role).roleName).join(', ');
});
