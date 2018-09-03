import * as React from 'react';
import { compose } from 'recompose';
import { query, defaultOptions, GROUPS_TYPE, GROUP_MEMBERSHIPS_TYPE, USERS_TYPE } from '@data';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { relationshipFor } from '@data';
import { TYPE_NAME as GROUP, GroupAttributes } from '@data/models/group';
import { GroupMembershipAttributes } from '@data/models/group-membership';
import { UserAttributes } from '@data/models/user';

import { PageLoader as Loader } from '@ui/components/loaders';
import { ResourceObject } from 'jsonapi-typescript';

export interface IProvidedProps {
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
  disableSelection: true;
}

interface IOwnProps {
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
  groupMembershipsFromCache: Array<ResourceObject<GROUP_MEMBERSHIPS_TYPE, GroupMembershipAttributes>>;
  currentUserGroupMemberships: Array<ResourceObject<GROUP_MEMBERSHIPS_TYPE, GroupMembershipAttributes>>;
  scopeToCurrentUser: boolean;
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
  selected: Id;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withData(WrappedComponent) {
  const mapNetworkToProps = () => {
    return {
      groups: [q => q.findRecords(GROUP), defaultOptions()]
    };
  };

  const mapRecordsToProps = (passedProps) => {
    const { currentUser } = passedProps;
    const { type, id } = currentUser;

    return {
      groupMembershipsFromCache: q => q.findRelatedRecords({ type, id }, 'groupMemberships')
    };
  };

  class DataWrapper extends React.Component<IProps> {
    render() {
      const {
        groupMembershipsFromCache,
        groups,
        currentUserGroupMemberships,
        currentUser,
        scopeToCurrentUser,
        selected,
        ...otherProps
      } = this.props;

      if (!groups || !groupMembershipsFromCache) {
        return <Loader />;
      }

      let availableGroups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;

      const groupIds = groupMembershipsFromCache
        .filter(gm => gm)
        .map(gm => (relationshipFor(gm, GROUP).data || {}).id);

      if (scopeToCurrentUser) {
        availableGroups = groups.filter(g => g.id === selected || groupIds.includes(g.id));
      } else {
        availableGroups = groups;
      }

      const disableSelection = (
        availableGroups.length === 1 ||
          (availableGroups.length === 2 && groupIds.length === 1)
      );

      const props = {
        ...otherProps,
        selected,
        groups: availableGroups,
        disableSelection
      };

      return <WrappedComponent { ...props } />;
    }
  }

  return compose(
    query(mapNetworkToProps),
    /* withRelationship('currentUser', 'groupMemberships', 'currentUserGroupMemberships'), */
    withOrbit(mapRecordsToProps),
  )(DataWrapper);
}
