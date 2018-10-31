import * as React from 'react';
import { withProps, compose } from 'recompose';

import {
  withUserRoles,
  IUserRoleProps
} from '@data/containers/resources/user';

import {
  UserRoleResource, RoleResource,
  UserResource, OrganizationResource,
  attributesFor
} from '@data';

import { compareVia } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  userRoles: UserRoleResource[];
  roles: RoleResource[];
  user: UserResource;
  organization: OrganizationResource;
}

type IProps =
& IOwnProps
& i18nProps
& IUserRoleProps;

class ActiveRolesDisplay extends React.PureComponent<IProps> {

  activeRoles(): RoleResource[] {
    const { roles, userHasRole } = this.props;
    const sorted = roles.sort(compareVia(r => attributesFor(r).roleName));

    return sorted.filter(role => userHasRole(role));
  }

  render() {
    const { t } = this.props;
    const activeRoles = this.activeRoles();

    if (activeRoles.length === 0) {
      return t('users.noRoles');
    }

    return activeRoles.map(( role, i ) => {
      return <span key={i}>{attributesFor(role).roleName}</span>;
    });
  }
}

export default compose(
  withTranslations,
  withProps((props: IOwnProps) => {
    const { user, organization } = props;

    return {
      propsforUserRoles: {
        user,
        organization
      }
    };
  }),
  withUserRoles
)(ActiveRolesDisplay);
