import * as React from 'react';
import { compose, mapProps } from 'recompose';
import { withData as withOrbit, attributesFor } from 'react-orbitjs';
import { compareVia, isEmpty } from '@lib/collection';

import { OrganizationResource, UserResource, RoleResource, UserRoleResource } from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';
import { withCurrentUserContext, ICurrentUserProps } from '@data/containers/with-current-user';

import { RequireRole } from '~/ui/components/authorization';

import { ROLE } from '~/data/models/role';

import ActiveRolesDisplay from './active-roles-display';
import RoleSelect from './role-select';

export const pathName = '/users/:userId/newedit/settings/roles';

interface INeededProps {
  user: UserResource;
  organizations: OrganizationResource[];
  roles: RoleResource[];
}

interface IOwnProps {
  roleNames: string;
  editable: boolean;
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

class RolesRoute extends React.Component<IProps> {
  render() {
    const { organizations, user, roles, userRoles, editable, t } = this.props;

    if (isEmpty(organizations)) {
      return t('errors.orgMembershipRequired');
    }

    organizations.sort(compareVia((org) => attributesFor(org).name.toLowerCase()));
    return organizations.map((organization) => {
      const organizationName = attributesFor(organization).name;
      const roleProps = {
        organization,
        user,
        roles,
        userRoles,
      };
      return (
        <div data-test-roles-active key={organization.id}>
          <div className='p-t-md p-b-sm'>
            <span className='bold fs-14'>{organizationName}</span>
          </div>
          {editable && (
            <RequireRole
              roleName={ROLE.OrganizationAdmin}
              forOrganization={organization}
              componentOnForbidden={() => {
                return (
                  <span className='item'>
                    <ActiveRolesDisplay {...roleProps} />
                  </span>
                );
              }}
            >
              <RoleSelect {...roleProps} />
            </RequireRole>
          )}
          {!editable && (
            <span className='item'>
              <ActiveRolesDisplay {...roleProps} />
            </span>
          )}
        </div>
      );
    });
  }
}

export default compose<IProps, INeededProps>(
  withTranslations,
  withCurrentUserContext,
  withOrbit<INeededProps & ICurrentUserProps, IFromOrbit>(({ currentUser, roles }) => {
    const superAdmin = roles.find((role) => attributesFor(role).roleName === ROLE.SuperAdmin);
    return {
      superAdminRoles: (q) =>
        q
          .findRecords('userRole')
          .filter({ relation: 'role', record: superAdmin })
          .filter({ relation: 'user', record: currentUser }),
    };
  }),
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
)(RolesRoute);
