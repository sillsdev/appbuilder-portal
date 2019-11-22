import * as React from 'react';
import { memo } from 'react';
import { isEmpty } from '@lib/collection';

import { OrganizationResource, UserResource, RoleResource } from '@data';

import { i18nProps } from '@lib/i18n';

import RoleListByOrganization from './role-list-by-organization';

export interface IOwnProps {
  editable: boolean;
  user: UserResource;
  organizations: OrganizationResource[];
  roles: RoleResource[];
}

export type IProps = IOwnProps & i18nProps;

export function MultiRoleList(props: IProps) {
  const { roles, organizations, user, t } = props;

  if (isEmpty(organizations)) {
    return t('errors.orgMembershipRequired');
  }

  const roleList = (
    <RoleListByOrganization roles={roles} organizations={organizations} user={user} />
  );

  return (
    <div className='p-l-xxs' data-test-role-no-edit>
      {roleList}
    </div>
  );
}

export default memo<IProps>(MultiRoleList, (prev, next) => prev.editable !== next.editable);
