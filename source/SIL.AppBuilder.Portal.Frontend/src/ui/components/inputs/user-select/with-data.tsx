import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { ResourceObject } from 'jsonapi-typescript';

import {
  query, defaultSourceOptions, relationshipFor,
  USERS_TYPE, GROUP_MEMBERSHIPS_TYPE, isRelatedRecord, isRelatedTo, idFromRecordIdentity,
  recordIdentityFrom,
  OrganizationResource,
  UserResource,
  GroupMembershipResource
} from '@data';

import { TYPE_NAME as USER, UserAttributes } from '@data/models/user';
import { withCurrentUser } from '@data/containers/with-current-user';
import { retrieveRelation } from '@data/containers/with-relationship';

import { PageLoader as Loader } from '@ui/components/loaders';

export interface IProvidedProps {
  users: Array<ResourceObject<USERS_TYPE, UserAttributes>>;
  disableSelection: true;
}

interface IOwnProps {
  users: UserResource[];
  groupMemberships: GroupMembershipResource[];
  currentUsersGroupMemberships: GroupMembershipResource[];
  usersFromCache: UserResource[];
  currentUser: UserResource;
  selected: Id;
  groupId: Id;
  restrictToGroup: boolean;
  scopeToOrganization?: OrganizationResource;
}

type IProps =
  & IOwnProps
  & WithDataProps;

interface IState {
  users?: UserResource[];
}

export function withData(WrappedComponent) {
  class DataWrapper extends React.Component<IProps, IState> {
    isFilteringUsers = false;
    state: IState = {}

    determineAvailableUsers = async () => {
      const {
        dataStore,
        users,
        selected,
        groupId,
        scopeToOrganization,
        restrictToGroup,
      } = this.props;

      // remove users who _can't_ be assigned to this project
      // due to not having organization overlap
      let filtered = [];
      const promises = users.map(async user => {
        let isInOrganization = true;
        let isInGroup = true;

        if (scopeToOrganization) {
          const organizationId = scopeToOrganization.id;
          const organizations = await retrieveRelation(dataStore, [user, 'organizationMemberships', 'organization']);
          const ids = organizations.map(o => o.id);

          isInOrganization = ids.includes(organizationId);
        }

        if (restrictToGroup && groupId) {
          const groups = await retrieveRelation(dataStore, [user, 'groupMemberships', 'group']);
          const ids = groups.map(g => g.id);

          isInGroup = ids.includes(groupId)
        }

        if (isInOrganization && isInGroup) {
          filtered.push(user);
        }
      });

      await Promise.all(promises);

      // ensure the project owner is in the list
      const isOwnerInList = filtered.find(user => user.id === selected);

      if( (!isOwnerInList)) {
        const owner = users.find(user => user.id === selected);
        filtered.push(owner);
      }

      return filtered;
    }

    tryGetUsers = async () => {
      if (this.isFilteringUsers) { return; }
      if (this.state.users) { return; }

      this.isFilteringUsers = true;
      const users = await this.determineAvailableUsers();

      this.setState({ users }, () => this.isFilteringUsers = false);
    }

    componentDidMount() {
      this.tryGetUsers();
    }

    componentDidUpdate() {
      this.tryGetUsers();
    }

    get hasRequiredData() {
      const { users, groupMemberships, currentUsersGroupMemberships } = this.props;

      return (users && groupMemberships && currentUsersGroupMemberships);
    }

    render() {
      const { selected, ...otherProps } = this.props;

      if (!this.hasRequiredData) {
        return <Loader />;
      }

      const { users } = this.state;

      if (!users) { return <Loader />; }

      const props = {
        ...otherProps,
        selected,
        users,
        disableSelection: false
      };

      return <WrappedComponent { ...props } />;
    }
  }

  return compose(
    withCurrentUser(),
    query(() => {
      return {
        users: [q => q.findRecords(USER), {
                  label: 'Get Users for User Input Select',
                  sources: {
                    remote: {
                      settings: { ...defaultSourceOptions() },
                      include: ['group-memberships'],
                    }
                  }
                }
              ],
      };
    }),
    withOrbit((passedProps: IOwnProps) => {
      const { currentUser } = passedProps;;

      return {
        currentUsersGroupMemberships: q => q.findRelatedRecords(currentUser, 'groupMemberships'),
        groupMemberships: q => q.findRecords('groupMembership')
      };
    }),
  )(DataWrapper);
}
