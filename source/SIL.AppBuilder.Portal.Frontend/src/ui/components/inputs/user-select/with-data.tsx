import React, { useMemo } from 'react';

import { query } from '@data';

import { useOrbit } from 'react-orbitjs';

import { defaultSourceOptions, OrganizationResource, UserResource } from '@data';

import { TYPE_NAME as USER } from '@data/models/user';
import { useCurrentUser } from '@data/containers/with-current-user';
import { retrieveRelation } from '@data/containers/with-relationship';

interface IProps {
  users: UserResource[];
  currentUser: UserResource;
  selected: Id;
  groupId: Id;
  restrictToGroup: boolean;
  scopeToOrganization?: OrganizationResource;
}

export function withData(WrappedComponent) {
  function DataWrapper({
    // users,
    scopeToOrganization,
    selected,
    restrictToGroup,
    groupId,
    ...otherProps
  }) {
    // console.log('ahhh', users);
    const { dataStore } = useOrbit();
    const { currentUser } = useCurrentUser();

    const users = dataStore.cache.query((q) => q.findRecords('user'));

    // remove users who _can't_ be assigned to this project
    // due to not having organization overlap
    const filtered = (users || []).filter((user) => {
      let isInOrganization = true;
      let isInGroup = true;

      if (scopeToOrganization) {
        const organizationId = scopeToOrganization.id;
        const organizations = retrieveRelation(dataStore, [
          user,
          'organizationMemberships',
          'organization',
        ]);
        const ids = (organizations || []).map((o) => o && o.id);

        isInOrganization = ids.includes(organizationId);
      }

      if (restrictToGroup && groupId) {
        const groups = retrieveRelation(dataStore, [user, 'groupMemberships', 'group']);
        const ids = (groups || []).map((g) => g && g.id);

        isInGroup = ids.includes(groupId);
      }

      return isInOrganization && isInGroup;
    });

    // ensure the project owner is in the list
    const isOwnerInList = filtered.find((user) => user.id === selected);

    if (!isOwnerInList) {
      const owner = filtered.find((user) => user.id === selected);

      if (owner) {
        filtered.push(owner);
      }
    }

    // if the currentUser is not on the list,
    // they cannot change it
    const userIds = filtered.map((u) => u.id);
    const currentUserIsAllowed = userIds.includes(currentUser.id);
    const isDisabled = !currentUserIsAllowed;

    /*
     * Disabled if:
     * - !( the Enabled if list )
     * - User is not in the group that the project is in
     *   - consequently, user will not be in the project's organization
     *
     * Enabled if:
     * - User owns project
     * - User is org admin
     * - User is super admin
     */
    return (
      <WrappedComponent
        {...{ ...otherProps, selected, users: filtered, disableSelection: isDisabled }}
      />
    );
  }

  return query(() => {
    return {
      cacheKey: 'static',
      users: [
        (q) => q.findRecords(USER),
        {
          label: 'Get Users for User Input Select',
          sources: {
            remote: {
              settings: { ...defaultSourceOptions() },
              include: ['group-memberships.group', 'organization-memberships.organization'],
            },
          },
        },
      ],
    };
  })(DataWrapper);
}
