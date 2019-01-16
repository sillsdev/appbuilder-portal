import * as React from 'react';

import { attributesFor } from '@data';

import ActiveRolesDisplay from './active-roles-display';

export default ({ organizations, user, roles, userRoles }) => {
  return organizations.map((organization, index) => {
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
  });
};
