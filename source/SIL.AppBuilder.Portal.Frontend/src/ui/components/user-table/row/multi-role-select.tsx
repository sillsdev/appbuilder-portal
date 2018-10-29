import * as React from 'react';

import {
  OrganizationResource, UserResource, RoleResource,
  attributesFor
} from '@data';
import { isEmpty } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';

import RoleSelect from './role-select';

interface IProps {
  organizations: OrganizationResource[];
  user: UserResource;
  roles: RoleResource[];
}

class MultiRoleSelect extends React.Component<IProps & i18nProps> {
  render() {
    const { roles, organizations, user, t } = this.props;

    if (isEmpty(organizations)) {
      return t('errors.orgMembershipRequired');
    }

    return organizations.map(( organization, i ) => {
      const roleProps = {
        organization,
        user,
        roles
      };

      return (
        <div key={i}>
          <label className='bold m-b-sm'>{attributesFor(organization).name}</label>
          <RoleSelect { ...roleProps } />
        </div>
      );
    });
  }
}

export default withTranslations(MultiRoleSelect);
