import { useOrbit, attributesFor } from 'react-orbitjs';
import Store from '@orbit/store';
import { OrganizationResource, UserResource, UserRoleResource } from '@data';
import { ROLE } from '@data/models/role';
import { useCurrentUser } from '@data/containers/with-current-user';

interface IHasRoleInOrganizationArgs {
  organization?: OrganizationResource;
  roleName: ROLE;
}

export function getPermissions(organization?: OrganizationResource) {
  const { currentUser } = useCurrentUser();
  const { dataStore } = useOrbit();

  return {
    isSuperAdmin: isSuperAdmin(dataStore, currentUser),
    isOrgAdmin: isOrgAdmin(dataStore, currentUser, organization),
    isAppBuilder: isAppBuilder(dataStore, currentUser, organization),
    hasRoleInOrganization(args: IHasRoleInOrganizationArgs) {
      return hasRoleInOrganization(
        dataStore,
        currentUser,
        args.organization || organization,
        args.roleName
      );
    },
  };
}

export function isSuperAdmin(dataStore: Store, user: UserResource) {
  const userRoles = getUserRoles(dataStore, user);

  return userRolesContainRoleNamed(dataStore, userRoles, ROLE.SuperAdmin);
}

export function hasRoleInOrganization(
  dataStore: Store,
  user: UserResource,
  organization: OrganizationResource,
  roleName: ROLE
) {
  if (!organization) return false;

  const userRoles = getUserRolesForOrganization(dataStore, user, organization);

  return userRolesContainRoleNamed(dataStore, userRoles, roleName);
}

export function isAppBuilder(
  dataStore: Store,
  user: UserResource,
  organization?: OrganizationResource
) {
  return hasRoleInOrganization(dataStore, user, organization, ROLE.AppBuilder);
}

export function isOrgAdmin(
  dataStore: Store,
  user: UserResource,
  organization?: OrganizationResource
) {
  return hasRoleInOrganization(dataStore, user, organization, ROLE.OrganizationAdmin);
}

export function userRolesContainRoleNamed(
  dataStore: Store,
  userRoles: UserRoleResource[],
  name: ROLE
) {
  for (let i = 0; i < userRoles.length; i++) {
    let userRole = userRoles[i];
    let role = dataStore.cache.query((q) => q.findRelatedRecord(userRole, 'role'));

    if (attributesFor(role).roleName === name) {
      return true;
    }
  }

  return false;
}

export function getUserRoles(dataStore: Store, user: UserResource) {
  const userRoles = dataStore.cache.query((q) => q.findRelatedRecords(user, 'userRoles'));

  return userRoles;
}

export function getUserRolesForOrganization(
  dataStore: Store,
  user: UserResource,
  organization: OrganizationResource
) {
  const userRoles = dataStore.cache.query((q) =>
    q
      .findRelatedRecords(user, 'userRoles')
      .filter({ relation: 'organization', record: organization })
  );

  return userRoles;
}
