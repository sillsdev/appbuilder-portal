import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { Checkbox, Form } from 'semantic-ui-react';

import {
  UserResource, RoleResource, OrganizationResource,
  UserRoleResource,
  attributesFor,
  isRelatedRecord
} from '@data';
import { ROLE } from '@data/models/role';

import {
  withUserRoles,
  IUserRoleProps
} from '@data/containers/resources/user';

import { withCurrentOrganization, ICurrentOrganizationProps } from '@data/containers/with-current-organization';
import { withCurrentUser, IProvidedProps as ICurrentUserProps } from '@data/containers/with-current-user';

interface IProps {
  roles: RoleResource[];
  user: UserResource;
  userRoles: UserRoleResource[];
  forOrganization: OrganizationResource;
}


class RoleSelect extends React.Component<IProps & IUserRoleProps> {
  toggleRole = (e, semanticUIEvent) => {
    const { checked, value: roleName } = semanticUIEvent;
    const { user, roles, toggleRole } = this.props;

    toggleRole(roleName);
  }

  render() {
    const { roles, forOrganization, userHasRole } = this.props;
    const orgAttrs = attributesFor(forOrganization);

    return (
      <>
        <em>Current Organization: { orgAttrs.name }</em>
        {roles.map(( role, i ) => {
          const attributes = attributesFor(role);

          if (attributes.roleName === ROLE.SuperAdmin) { return; }

          return (
            <Form.Field
              key={i}
              className='flex-row align-items-center m-b-sm'>

              <Checkbox data-test-role-select
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
  withCurrentOrganization,
  withCurrentUser(),
  withProps((props: ICurrentUserProps & ICurrentOrganizationProps) => {
    const { currentUser, currentOrganization } = props;

    return {
      forOrganization: currentOrganization,
      propsforUserRoles: {
        user: currentUser,
        organization: currentOrganization
      }
    };
  }),
  withUserRoles,
)( RoleSelect );
