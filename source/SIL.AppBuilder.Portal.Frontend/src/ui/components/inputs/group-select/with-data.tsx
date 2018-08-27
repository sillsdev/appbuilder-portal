import * as React from 'react';
import { compose } from 'recompose';
import { query, defaultOptions } from '@data';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { isRelatedTo, relationshipsFor, relationshipFor } from '@data';
import { withRelationship } from '@data/containers/with-relationship';
import { TYPE_NAME as GROUP, GroupAttributes } from '@data/models/group';
import { TYPE_NAME as GROUP_MEMBERSHIP } from '@data/models/group-membership';
import { UserAttributes } from '@data/models/user';

import { PageLoader as Loader } from '@ui/components/loaders';

export interface IProvidedProps {
  groups: Array<JSONAPI<GroupAttributes>>;
  disableSelection: true;
}

interface IOwnProps {
  groups: Array<JSONAPI<GroupAttributes>>;
  groupMembershipsFromCache: Array<JSONAPI<{}>>;
  currentUserGroupMemberships: Array<JSONAPI<{}>>;
  scopeToCurrentUser: boolean;
  currentUser: JSONAPI<UserAttributes>;
  selected: Id;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withData(WrappedComponent) {
  const mapNetworkToProps = (passedProps) => {
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

      let availableGroups: Array<JSONAPI<{}>>;

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
