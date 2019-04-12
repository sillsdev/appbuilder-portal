import { useOrbit } from 'react-orbitjs';

import { recordsWithIdIn, isRelatedTo } from '@data';

import { OrganizationResource } from '@data/models/organization';
import { GroupResource } from '@data/models/group';
import { retrieveRelation } from '@data/containers/with-relationship';

import { useCurrentUser } from '~/data/containers/with-current-user';

export interface IProvidedProps {
  groups: GroupResource[];
  disableSelection: boolean;
}

interface INeededProps {
  scopeToCurrentUser?: boolean;
  scopeToOrganization?: OrganizationResource;
  selected: Id;
}

export function useScopeGroupData({
  selected,
  scopeToCurrentUser,
  scopeToOrganization,
}: INeededProps): IProvidedProps {
  const { dataStore } = useOrbit();
  const { currentUser, isSuperAdmin } = useCurrentUser();

  const groups = dataStore.cache.query((q) => q.findRecords('group'));
  const currentUsersGroups = retrieveRelation(dataStore, [
    currentUser,
    'groupMemberships',
    'group',
  ]);

  // TODO: we shouldn't need to filter out fasley things
  //       so, we should make sure withRelationships is returning good data
  const groupIds = currentUsersGroups.filter((g) => !!g).map((g) => g.id);
  const availableGroupIds = [...(selected ? [selected] : []), ...groupIds];

  let availableGroups: GroupResource[];

  if (scopeToCurrentUser && !isSuperAdmin) {
    availableGroups = recordsWithIdIn(groups, availableGroupIds);
  } else {
    availableGroups = groups;
  }

  if (scopeToOrganization) {
    availableGroups = availableGroups.filter((group) => {
      if (group.id === selected) {
        return true;
      }

      return isRelatedTo(group, 'owner', scopeToOrganization.id);
    });
  }

  const isSelelectionDisabled =
    !isSuperAdmin &&
    (availableGroups.length === 1 || (availableGroups.length === 2 && groupIds.length === 1));
  console.log(isSuperAdmin, availableGroups, groupIds);
  return {
    groups: availableGroups,
    disableSelection: isSelelectionDisabled,
  };
}
