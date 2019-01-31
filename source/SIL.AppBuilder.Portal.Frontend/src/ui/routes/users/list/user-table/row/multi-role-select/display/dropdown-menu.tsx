import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { attributesFor, withOrbit } from 'react-orbitjs';

import { RequireRole } from '~/ui/components/authorization';

import { ROLE, RoleResource } from '~/data/models/role';

import { UserRoleResource, UserResource, OrganizationResource } from '~/data';

import ActiveRolesDisplay from './active-roles-display';
import RoleSelect from './role-select';

interface INeededProps {
  user: UserResource;
  roles: RoleResource[];
  organizations: OrganizationResource[];
  open: boolean;
}

interface IOrbitProps {
  userRoles: UserRoleResource[];
}

export default withOrbit<INeededProps, IOrbitProps>(({ user }) => {
  return {
    userRoles: (q) => q.findRelatedRecords(user, 'userRoles'),
  };
})(({ organizations, user, roles, userRoles, open }) => {
  return (
    <Dropdown.Menu data-test-role-menu open={open}>
      {organizations.map((organization, index) => {
        const organizationName = attributesFor(organization).name;
        const roleProps = {
          organization,
          user,
          roles,
          userRoles,
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
  );
});
