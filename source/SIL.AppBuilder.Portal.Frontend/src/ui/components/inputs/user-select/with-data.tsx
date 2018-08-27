import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { query, defaultSourceOptions, relationshipFor } from '@data';
import { TYPE_NAME as USER, UserAttributes } from '@data/models/user';
import { TYPE_NAME as GROUP_MEMBERSHIPS } from '@data/models/group-membership';
import { withCurrentUser } from '@data/containers/with-current-user';

import { PageLoader as Loader } from '@ui/components/loaders';

export interface IProvidedProps {
  users: Array<JSONAPI<UserAttributes>>;
  disableSelection: true;
}

interface IOwnProps {
  users: Array<JSONAPI<UserAttributes>>;
  groupMemberships: Array<JSONAPI<{}>>;
  currentUsersGroupMemberships: Array<JSONAPI<{}>>;
  usersFromCache: Array<JSONAPI<{}>>;
  currentUser: JSONAPI<UserAttributes>;
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
