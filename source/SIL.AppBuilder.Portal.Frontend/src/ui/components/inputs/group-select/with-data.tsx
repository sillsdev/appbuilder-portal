import * as React from 'react';
import { compose } from 'recompose';
import { query, defaultOptions } from '@data';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { relationshipFor } from '@data';
import { TYPE_NAME as GROUP, GroupAttributes } from '@data/models/group';
import { GroupMembershipAttributes } from '@data/models/group-membership';
import { UserAttributes } from '@data/models/user';

import { PageLoader as Loader } from '@ui/components/loaders';
import { ResourceObject } from 'jsonapi-typescript';

export interface IProvidedProps {
  groups: ResourceObject<'groups', GroupAttributes>[];
  disableSelection: true;
}

interface IOwnProps {
  groups: ResourceObject<'groups', GroupAttributes>[];
  groupMembershipsFromCache: ResourceObject<'group-memberships', GroupMembershipAttributes>[];
  currentUserGroupMemberships: ResourceObject<'group-memberships', GroupMembershipAttributes>[];
  scopeToCurrentUser: boolean;
  currentUser: ResourceObject<'users', UserAttributes>;
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

      let availableGroups: ResourceObject<'groups', GroupAttributes>[];

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
