import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { ResourceObject } from 'jsonapi-typescript';

import { GroupMembershipAttributes } from '@data/models/group-membership';
import { PageLoader as Loader } from '@ui/components/loaders';
import { query, defaultSourceOptions, relationshipFor, USERS_TYPE, GROUP_MEMBERSHIPS_TYPE, isRelatedRecord, isRelatedTo, idFromRecordIdentity, recordIdentityFrom } from '@data';
import { TYPE_NAME as USER, UserAttributes } from '@data/models/user';
import { withCurrentUser } from '@data/containers/with-current-user';


export interface IProvidedProps {
  users: Array<ResourceObject<USERS_TYPE, UserAttributes>>;
  disableSelection: true;
}

interface IOwnProps {
  users: Array<ResourceObject<USERS_TYPE, UserAttributes>>;
  groupMemberships: Array<ResourceObject<GROUP_MEMBERSHIPS_TYPE, GroupMembershipAttributes>>;
  currentUsersGroupMemberships: Array<ResourceObject<GROUP_MEMBERSHIPS_TYPE, GroupMembershipAttributes>>;
  usersFromCache: Array<ResourceObject<USERS_TYPE, UserAttributes>>;
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
          const isRelated = isRelatedTo(gm, 'group', `${groupId}`);

          return isRelated;
        });

        const validMembershipIds = groupMembershipsForGroup
          .filter(gm => gm)
          .map(gm => gm.id);

        filteredUsers = users.filter(user => {
          if (idFromRecordIdentity(user as any) === selected) {
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
