import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

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
    const { roles, userRoles, organizations, user, t } = this.props;

    if (isEmpty(organizations)) {
      return t('errors.orgMembershipRequired');
    }

    return organizations.map(( organization, i ) => {
      const roleProps = {
        organization,
        user,
        roles,
        userRoles
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

export default compose(
  withTranslations,
  // share one set of userRoles for the entire list.
  // otherwise the RoleSelect's own withUserRoles will
  // make a call to get the userRoles as a convient default
  withOrbit((props) => {
    const { user } = props;

    return {
      userRoles: q => q.findRelatedRecords(user, 'userRoles'),
    }
  })
)(MultiRoleSelect);
