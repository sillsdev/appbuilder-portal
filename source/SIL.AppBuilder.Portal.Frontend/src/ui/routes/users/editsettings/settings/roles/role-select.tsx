import * as React from 'react';
import { compose, withProps } from 'recompose';
import { Checkbox } from 'semantic-ui-react';
import {
  UserResource,
  RoleResource,
  OrganizationResource,
  UserRoleResource,
  attributesFor,
} from '@data';
import { ROLE } from '@data/models/role';
import { withUserRoles, IUserRoleProps } from '@data/containers/resources/user';
import { compareVia } from '@lib/collection';

interface IOwnProps {
  roles: RoleResource[];
  user: UserResource;
  userRoles: UserRoleResource[];
  organization: OrganizationResource;
}

type IProps = IOwnProps & IUserRoleProps;

class RoleSelect extends React.Component<IProps> {
  toggleRole = (role: RoleResource) => (e) => {
    const roleName = attributesFor(role).roleName;
    e.preventDefault();
    this.props.toggleRole(roleName);
  };

  render() {
    const { roles, userHasRole } = this.props;

    roles.sort(compareVia((r) => attributesFor(r).roleName));

    return roles.map((role) => {
      const attributes = attributesFor(role);
      if (attributes.roleName === ROLE.SuperAdmin) {
        return;
      }
      const isSelected = userHasRole(role);
      return (
        <div data-test-role-entry key={role.id} className={`item flex-row align-items-center p-sm`}>
          <div data-test-role-check className='item' onClick={this.toggleRole(role)}>
            <Checkbox
              data-test-role-select
              toggle
              value={role.id}
              label={attributes.roleName}
              checked={isSelected}
            />
          </div>
        </div>
      );
    });
  }
}

export default compose(
  withProps((props: IOwnProps) => {
    const { user, organization } = props;

    return {
      propsforUserRoles: {
        user,
        organization,
      },
    };
  }),
  withUserRoles
)(RoleSelect);
