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
import DropdownMenu from './dropdown-menu';

export interface IOwnProps {
  editable: boolean;
  user: UserResource;
  organizations: OrganizationResource[];
  roles: RoleResource[];
}

export type IProps = IOwnProps & i18nProps;

export default class MultiRoleSelect extends React.Component<IProps, { open: boolean }> {
  state = { open: false };

  shouldComponentUpdate(nextProps, nextState) {
    console.log('mrs -- checking if needs to update', nextProps, this.props);
    return nextProps.editable != this.props.editable || this.state.open !== nextState.open;
  }

  toggle = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ open: !this.state.open });
  };

  render() {
    const { roles, organizations, user, t, editable } = this.props;
    const { open } = this.state;

    if (isEmpty(organizations)) {
      return t('errors.orgMembershipRequired');
    }

    const roleList = (
      <RoleListByOrganization roles={roles} organizations={organizations} user={user} />
    );

    if (!editable) {
      return (
        <div className='p-l-xxs' data-test-role-no-edit>
          {roleList}
        </div>
      );
    }

    return (
      <Dropdown
        simple
        data-test-role-multi-select
        multiple
        onClick={this.toggle}
        closeOnBlur={false}
        closeOnChange={false}
        trigger={roleList}
        open={open}
        className='w-100 multiDropdown'
      >
        <DropdownMenu {...{ organizations, user, roles, open }} />
      </Dropdown>
    );
  }
}
