import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { isEmpty, areResourceListsEqual } from '@lib/collection';

import {
  attributesFor,
  OrganizationResource,
  UserResource,
  RoleResource,
  UserRoleResource,
} from '@data';

import { ROLE } from '@data/models/role';
import { i18nProps } from '@lib/i18n';
import { RequireRole } from '@ui/components/authorization';

import ActiveRolesDisplay from './active-roles-display';
import RoleListByOrganization from './role-list-by-organization';
import RoleSelect from './role-select';

export interface IOwnProps {
  editable: boolean;
  user: UserResource;
  organizations: OrganizationResource[];
  roles: RoleResource[];
  userRolesForUser: UserRoleResource[];
  roleNames: string;
}

export type IProps = IOwnProps & i18nProps;

export default class MultiRoleSelect extends React.Component<IProps, { open: boolean }> {
  state = { open: false };

  shouldComponentUpdate(nextProps, nextState) {
    console.log('mrs -- checking if needs to update', nextProps, this.props);
    return (
      nextProps.editable != this.props.editable ||
      this.state.open !== nextState.open ||
      areResourceListsEqual(this.props.userRolesForUser, nextProps.userRolesForUser)
    );
  }

  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
    const { roles, organizations, user, t, editable } = this.props;
    const { open } = this.state;

    if (isEmpty(organizations)) {
      return t('errors.orgMembershipRequired');
    }

    const roleList = (
      <RoleListByOrganization
        roles={roles}
        userRoles={[]}
        organizations={organizations}
        user={user}
      />
    );

    return (
      <>
        {!editable && (
          <div className='p-l-xxs' data-test-role-no-edit>
            {roleList}
          </div>
        )}

        {editable && (
          <Dropdown
            data-test-role-multi-select
            multiple
            trigger={roleList}
            open={open}
            onClick={this.toggle}
            closeOnChange={false}
            closeOnBlur={false}
            className='w-100 multiDropdown'
          >
            <Dropdown.Menu data-test-role-menu open={open}>
              {organizations.map((organization, index) => {
                const organizationName = attributesFor(organization).name;
                const roleProps = {
                  organization,
                  user,
                  roles,
                };

                return (
                  <React.Fragment key={index}>
                    <Dropdown.Header data-test-organization-name content={organizationName} />
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
                  </React.Fragment>
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </>
    );
  }
}
