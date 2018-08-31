import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { ResourceObject } from 'jsonapi-typescript';

import { query, defaultSourceOptions, relationshipFor, USERS_TYPE, GROUP_MEMBERSHIPS_TYPE } from '@data';
import { TYPE_NAME as USER, UserAttributes } from '@data/models/user';
import { TYPE_NAME as GROUP_MEMBERSHIPS, GroupMembershipAttributes } from '@data/models/group-membership';
import { withCurrentUser } from '@data/containers/with-current-user';

import { PageLoader as Loader } from '@ui/components/loaders';

export interface IProvidedProps {
  users: ResourceObject<USERS_TYPE, UserAttributes>[];
  disableSelection: true;
}

interface IOwnProps {
  users: ResourceObject<USERS_TYPE, UserAttributes>[];
  groupMemberships: ResourceObject<GROUP_MEMBERSHIPS_TYPE, GroupMembershipAttributes>[];
  currentUsersGroupMemberships: ResourceObject<GROUP_MEMBERSHIPS_TYPE, GroupMembershipAttributes>[];
  usersFromCache: ResourceObject<USERS_TYPE, UserAttributes>[];
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
  selected: Id;
  groupId: Id;
  restrictToGroup: boolean;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withData(WrappedComponent) {
  const mapNetworkToProps = (passedProps) => {
    return {
      users: [
        q => q.findRecords(USER), {
          label: 'Get Users for User Input Select',
          sources: {
            remote: {
              settings: { ...defaultSourceOptions() },
              include: ['group-memberships'],
            }
          }
        }
      ]
    };
  };

  const mapRecordsToProps = (passedProps) => {
    const { type, id } = passedProps.currentUser;

    return {
      currentUsersGroupMemberships: q => q.findRelatedRecords({ type, id }, 'groupMemberships'),
      groupMemberships: q => q.findRecords('groupMembership')
    };
  };

  class DataWrapper extends React.Component<IProps> {
    render() {
      const {
        users,
        currentUser,
        selected,
        groupId,
        groupMemberships,
        restrictToGroup,
        currentUsersGroupMemberships,
        ...otherProps
      } = this.props;

      if (!users || !groupMemberships || !currentUsersGroupMemberships) {
        return <Loader />;
      }

      let filteredUsers = users;
      let disableSelection = false;

      if (restrictToGroup) {
        const groupMembershipsForGroup = groupMemberships.filter(gm => {
          const relation = relationshipFor(gm, 'group');
          const { id } = relation.data || {};

          return id === groupId;
        });

        const validMembershipIds = groupMembershipsForGroup
          .filter(gm => gm)
          .map(gm => gm.id);

        filteredUsers = users.filter(user => {
          if (user.id === selected) {
            return true;
          }

          const relation = relationshipFor(user, 'groupMemberships');
          const belongsToGroup = (relation.data || []).find(gm => {
            return validMembershipIds.includes(gm.id);
          });

          return belongsToGroup;
        });

        const relevantGroupMembershipsForCurrentUser = currentUsersGroupMemberships.filter(gm => {
          return gm && validMembershipIds.includes(gm.id);
        });

        disableSelection = relevantGroupMembershipsForCurrentUser.length < 1;
      }

      const props = {
        ...otherProps,
        selected,
        users: filteredUsers,
        disableSelection
      };

      return <WrappedComponent { ...props } />;
    }
  }

  return compose(
    withCurrentUser(),
    query(mapNetworkToProps),
    withOrbit(mapRecordsToProps),
  )(DataWrapper);
}
