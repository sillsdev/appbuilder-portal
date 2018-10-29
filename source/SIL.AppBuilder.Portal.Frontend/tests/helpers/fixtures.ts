import { ROLE, RoleResource } from '@data/models/role';

export const roles = {
  superAdmin: {
    id: '1', type: 'roles',
    attributes: { roleName: ROLE.SuperAdmin }
  },
  orgAdmin: {
    id: '2', type: 'roles',
    attributes: { roleName: ROLE.OrganizationAdmin }
  },
  appBuilder: {
    id: '3', type: 'roles',
    attributes: { roleName: ROLE.AppBuilder }
  }
};

interface IUserRoleFactory {
  id: number;
  userId: number;
  orgId?: number;
}

export function userRoleFrom(role: RoleResource, options: IUserRoleFactory) {
  const { id, userId, orgId } = options;

  return {
    id, type: 'user-roles',
    attributes: { roleName: role.attributes.roleName },
    relationships: {
      user: { data: { id: userId, type: 'users' } },
      role: { data: { id: role.id, type: 'roles' } },
      organization: {
        data: { ...(
          orgId
            ? { id: orgId, type: 'organizations' }
            : {}
        ) }
      }
    }
  };
}
