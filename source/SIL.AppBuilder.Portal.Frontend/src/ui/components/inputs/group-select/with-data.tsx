import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import {
  query, defaultOptions,
  GROUPS_TYPE, GROUP_MEMBERSHIPS_TYPE, USERS_TYPE,
  buildFindRelatedRecords,
  relationshipFor,
  idFromRecordIdentity,
  isRelatedTo,
  isRelatedRecord,
  withLoader,
  buildFindRecord,
  localIdFromRecordIdentity,
  idsForRelationship,
  recordsWithIdIn
} from '@data';

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
  groupMembershipsForCurrentUser: Array<ResourceObject<GROUP_MEMBERSHIPS_TYPE, GroupMembershipAttributes>>;
  scopeToCurrentUser: boolean;
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
  selected: Id;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withData(WrappedComponent) {
  const mapRecordsToProps = (passedProps) => {
    const { currentUser } = passedProps;

    return {
      // all groups available to the current user should have been fetch with the
      // current-user payload
      groups: q => q.findRecords(GROUP),
      groupMembershipsForCurrentUser: q => buildFindRelatedRecords(q, currentUser, 'groupMemberships')
    };
  };

  class DataWrapper extends React.Component<IProps> {
    render() {
      const {
        groupMembershipsForCurrentUser,
        groups,
        currentUser,
        scopeToCurrentUser,
        selected,
        ...otherProps
      } = this.props;

      let availableGroups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;

      const groupIds = idsForRelationship(groupMembershipsForCurrentUser, 'group');

      if (scopeToCurrentUser) {
        availableGroups = recordsWithIdIn(groups, [selected, ...groupIds]);
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
    withOrbit(mapRecordsToProps),
    withLoader(({ groups, groupMembershipsForCurrentUser: gmU }) => !groups || !gmU)
  )(DataWrapper);
}
