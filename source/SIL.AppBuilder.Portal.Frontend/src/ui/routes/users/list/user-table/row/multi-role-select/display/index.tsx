import * as React from 'react';
import { memo } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { isEmpty } from '@lib/collection';

import { OrganizationResource, UserResource, RoleResource } from '@data';

import { i18nProps } from '@lib/i18n';
import { useToggle } from '@lib/hooks';

import RoleListByOrganization from './role-list-by-organization';
import DropdownMenu from './dropdown-menu';

export interface IOwnProps {
  editable: boolean;
  user: UserResource;
  organizations: OrganizationResource[];
  roles: RoleResource[];
}

export type IProps = IOwnProps & i18nProps;

export function MultiRoleSelect(props: IProps) {
  const [open, toggle] = useToggle();

  const { roles, organizations, user, t, editable } = props;

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
      onLabelClick={toggle}
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

export default memo<IProps>(MultiRoleSelect, (prev, next) => prev.editable !== next.editable);
