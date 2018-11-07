import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';

import { isEmpty, unique } from '@lib/collection';

import {
  attributesFor,
  OrganizationResource, UserResource,
  RoleResource, UserRoleResource
} from '@data';
import { ROLE } from '@data/models/role';

import { i18nProps } from '@lib/i18n';
import { RequireRole } from '@ui/components/authorization';
import ActiveRolesDisplay from './active-roles-display';
import RoleSelect from './role-select';

export interface IOwnProps {
  user: UserResource;
  organizations: OrganizationResource[];
  roles: RoleResource[];
  userRoles: UserRoleResource[];
  roleNames: string;
}

export type IProps =
& IOwnProps
& i18nProps;

export default class MultiRoleSelect extends React.Component<IProps> {
  render() {
    const { roles, userRoles, organizations, user, roleNames, t } = this.props;

    if (isEmpty(organizations)) {
      return t('errors.orgMembershipRequired');
    }

    return (
      <Dropdown
        data-test-role-multi-select
        multiple
        text={roleNames}
        className='w-100 multiDropdown'
      >
        <Dropdown.Menu data-test-role-menu>
          {
            organizations.map((organization, index) => {
              const organizationName = attributesFor(organization).name;
              const roleProps = {
                organization,
                user,
                roles,
                userRoles
              };

              return (
                <React.Fragment key={index}>
                  <Dropdown.Header
                    data-test-organization-name
                    content={organizationName} />

                  <RequireRole
                    roleName={ROLE.OrganizationAdmin}
                    forOrganization={organization}
                    componentOnForbidden={() => {
                      return (
                        <span className='item'>
                          <ActiveRolesDisplay { ...roleProps } />
                        </span>
                      );
                    }}>
                    <RoleSelect { ...roleProps } />
                  </RequireRole>
                </React.Fragment>
              );
            })
          }
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

