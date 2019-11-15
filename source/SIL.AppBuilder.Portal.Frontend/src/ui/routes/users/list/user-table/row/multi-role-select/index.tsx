import { compose, mapProps } from 'recompose';
import { withData as withOrbit, attributesFor } from 'react-orbitjs';

import { OrganizationResource, UserResource, RoleResource, UserRoleResource } from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';
import { withCurrentUserContext, ICurrentUserProps } from '@data/containers/with-current-user';
import { is } from '@bigtest/interactor';

import Display from './display';

import { ROLE } from '~/data/models/role';

interface INeededProps {
  user: UserResource;
  organizations: OrganizationResource[];
  roles: RoleResource[];
}

interface IOwnProps {
  roleNames: string;
}

interface IAfterUserRoles {
  userRoles: UserRoleResource[];
}

interface IFromOrbit {
  superAdminRoles: UserRoleResource[];
}

type IProps = INeededProps &
  IOwnProps &
  IAfterUserRoles &
  i18nProps &
  IFromOrbit &
  ICurrentUserProps;

export default compose<IProps, INeededProps>(
  withTranslations,
  withCurrentUserContext,
  withOrbit<INeededProps & ICurrentUserProps, IFromOrbit>(
    ({ currentUser, roles }) => {
      const superAdmin = roles.find((role) => attributesFor(role).roleName === ROLE.SuperAdmin);

      return {
        superAdminRoles: (q) =>
          q
            .findRecords('userRole')
            .filter({ relation: 'role', record: superAdmin })
            .filter({ relation: 'user', record: currentUser }),
      };
    },
    {
      label: 'user-roles-for-dropdown',
    }
  ),
  mapProps(({ user, superAdminRoles, currentUser, organizations, roles, t }: IProps) => {
    const isSuperAdmin = (superAdminRoles || []).length > 0;

    return {
      user,
      superAdminRoles,
      currentUser,
      organizations,
      roles,
      t,
      editable: isSuperAdmin || currentUser.id !== user.id,
    };
  })
)(Display);
