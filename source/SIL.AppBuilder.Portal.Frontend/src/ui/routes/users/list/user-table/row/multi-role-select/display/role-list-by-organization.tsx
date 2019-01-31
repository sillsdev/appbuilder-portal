import * as React from 'react';
import { withOrbit, attributesFor } from 'react-orbitjs';

import { UserResource, RoleResource, OrganizationResource, UserRoleResource } from '@data';

import ActiveRolesDisplay from './active-roles-display';

interface INeededProps {
  user: UserResource;
  roles: RoleResource[];
  organizations: OrganizationResource[];
}

interface IOrbitProps {
  userRoles: UserRoleResource[];
}

export default withOrbit<INeededProps, IOrbitProps>(({ user }) => {
  return {
    userRoles: (q) => q.findRelatedRecords(user, 'userRoles'),
  };
})(({ organizations, user, roles, userRoles }) => {
  return (
    <>
      {organizations.map((organization, index) => {
        const organizationName = attributesFor(organization).name;
        const roleProps = {
          organization,
          user,
          roles,
          userRoles,
        };

        return (
          <div key={index}>
            <span className='bold fs-11'>{organizationName}</span>
            <br />
            <ActiveRolesDisplay {...roleProps} />
          </div>
        );
      })}
    </>
  );
});
