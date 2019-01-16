import { compose, withProps } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { withLoader, recordsWithIdIn, isRelatedTo } from '@data';

import { OrganizationResource } from '@data/models/organization';
import { TYPE_NAME as GROUP, GroupResource } from '@data/models/group';
import { UserResource } from '@data/models/user';
import { withRelationships } from '@data/containers/with-relationship';

export interface IProvidedProps {
  groups: GroupResource[];
  disableSelection: true;
}

interface IComposedProps {
  groups: GroupResource[];
  currentUsersGroups: GroupResource[];
}

interface INeededProps {
  scopeToCurrentUser?: boolean;
  scopeToOrganization?: OrganizationResource;
  currentUser: UserResource;
  selected: Id;
}

type IProps = INeededProps & IComposedProps & WithDataProps;

export function withData(WrappedComponent) {
  return compose<IProps, INeededProps>(
    withOrbit({
      // all groups available to the current user should
      // have been fetched with the current-user payload
      groups: (q) => q.findRecords(GROUP),
    }),
    withRelationships((props: INeededProps) => {
      const { currentUser } = props;

      return {
        currentUsersGroups: [currentUser, 'groupMemberships', 'group'],
      };
    }),
    withLoader(({ currentUsersGroups, groups }) => !currentUsersGroups || !groups),
    withProps((props: INeededProps & IComposedProps) => {
      const {
        currentUsersGroups,
        selected,
        scopeToCurrentUser,
        scopeToOrganization,
        groups,
      } = props;

      // TODO: we shouldn't need to filter out fasley things
      //       so, we should make sure withRelationships is returning good data
      const groupIds = currentUsersGroups.filter((g) => !!g).map((g) => g.id);
      const availableGroupIds = [...(selected ? [selected] : []), ...groupIds];

      let availableGroups: GroupResource[];

      if (scopeToCurrentUser) {
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
        availableGroups.length === 1 || (availableGroups.length === 2 && groupIds.length === 1);

      return {
        groups: availableGroups,
        disableSelection: isSelelectionDisabled,
      };
    })
  )(WrappedComponent);
}
