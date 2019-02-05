import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { Checkbox, Form } from 'semantic-ui-react';

import {
  UserResource,
  RoleResource,
  OrganizationResource,
  UserRoleResource,
  attributesFor,
  isRelatedRecord,
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
  toggleRole = (e, semanticUIEvent) => {
    const { checked, value: roleName } = semanticUIEvent;
    const { user, roles, toggleRole } = this.props;

    toggleRole(roleName);
  };

  render() {
    const { roles, organization, userHasRole } = this.props;
    const orgAttrs = attributesFor(organization);

    const sorted = roles.sort(compareVia((r) => attributesFor(r).roleName));

    return (
      <>
        {sorted.map((role) => {
          const attributes = attributesFor(role);

          if (attributes.roleName === ROLE.SuperAdmin) {
            return;
          }

          return (
            <Form.Field key={role.id} className='item flex-row align-items-center m-b-sm'>
              <Checkbox
                data-test-role-select
                toggle
                value={attributes.roleName}
                checked={userHasRole(role)}
                onChange={this.toggleRole}
              />
              <span className='m-l-sm'>{attributes.roleName}</span>
            </Form.Field>
          );
        })}
      </>
    );
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
