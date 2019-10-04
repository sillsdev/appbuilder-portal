import { useOrbit, useQuery } from 'react-orbitjs';

import { recordsWithIdIn, isRelatedTo, buildOptions } from '@data';

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
  const {
    result: { groups },
  } = useQuery({ groups: [(q) => q.findRecords('group'), buildOptions({ include: ['owner'] })] });

  const currentUsersGroups = retrieveRelation(dataStore, [
    currentUser,
    'groupMemberships',
    'group',
  ]);

  if (typeof groups === 'undefined') {
    return {
      groups: groups,
      disableSelection: true,
    };
  }
  // TODO: we shouldn't need to filter out fasley things
  //       so, we should make sure withRelationships is returning good data
  const groupIds = currentUsersGroups.filter((g) => !!g).map((g) => g.id);
  const availableGroupIds = [...(selected ? [selected] : []), ...groupIds];

  let availableGroups: GroupResource[];

  if (scopeToCurrentUser && !isSuperAdmin) {
    availableGroups = recordsWithIdIn(groups || [], availableGroupIds);
  } else {
    availableGroups = groups;
  }

  if (scopeToOrganization) {
    availableGroups = availableGroups.filter((group) => {
      if (group.id === selected) {
        return true;
      }

      const retVal = isRelatedTo(group, 'owner', scopeToOrganization.id);
      return retVal;
    });
  }

  const isSelelectionDisabled =
    !isSuperAdmin &&
    (availableGroups.length === 1 || (availableGroups.length === 2 && groupIds.length === 1));

  return {
    groups: availableGroups,
    disableSelection: isSelelectionDisabled,
  };
}
