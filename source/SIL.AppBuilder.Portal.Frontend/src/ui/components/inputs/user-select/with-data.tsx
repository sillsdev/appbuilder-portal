import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import {
  query, defaultSourceOptions, OrganizationResource,
  UserResource,
  GroupMembershipResource
} from '@data';

import { TYPE_NAME as USER } from '@data/models/user';
import { withCurrentUser } from '@data/containers/with-current-user';
import { retrieveRelation } from '@data/containers/with-relationship';
// import { roleInOrganization } from '@data/containers/with-role';

import { PageLoader as Loader } from '@ui/components/loaders';

export interface IProvidedProps {
  users: UserResource[];
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
    state: IState = {};

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
      const filtered = [];
      const promises = (users || []).map(async user => {
        let isInOrganization = true;
        let isInGroup = true;

        if (scopeToOrganization) {
          const organizationId = scopeToOrganization.id;
          const organizations = await retrieveRelation(dataStore, [user, 'organizationMemberships', 'organization']);
          const ids = (organizations || []).map(o => o && o.id);

          isInOrganization = ids.includes(organizationId);
        }

        if (restrictToGroup && groupId) {
          const groups = await retrieveRelation(dataStore, [user, 'groupMemberships', 'group']);
          const ids = (groups || []).map(g => g && g.id);

          isInGroup = ids.includes(groupId);
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
      if (!this.hasRequiredData) { return; }

      this.tryGetUsers();
    }

    componentDidUpdate() {
      if (!this.hasRequiredData) { return; }

      this.tryGetUsers();
    }

    get hasRequiredData() {
      const { users, groupMemberships, currentUsersGroupMemberships } = this.props;

      return (users && groupMemberships && currentUsersGroupMemberships);
    }

    /*
     * Disabled if:
     * - !( the Enabled if list )
     * - User is not in the group that the project is in
     *   - consequently, user will not be in the project's organization
     *
     * Enabled if:
     * - User owns project
     * - User is org admin
     * - User is super admin
     */
    get isDisabled() {
      // roleInOrganization(...)
      const { currentUser } = this.props;
      const { users } = this.state;

      const userIds = users.map(u => u.id);

      // if the currentUser is not on the list,
      // they cannot change it
      const currentUserIsAllowed = userIds.includes(currentUser.id);

      return !currentUserIsAllowed;
    }

    render() {
      const { selected, ...otherProps } = this.props;

      if (!this.hasRequiredData) {
        return <Loader />;
      }

      const { users } = this.state;

      if (users === undefined) { return <Loader />; }

      const props = {
        ...otherProps,
        selected,
        users,
        disableSelection: this.isDisabled
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
                      include: [
                        'group-memberships.group',
                        'organization-memberships.organization'
                      ],
                    }
                  }
                }
              ],
      };
    }),
    withOrbit((passedProps: IOwnProps) => {
      const { currentUser } = passedProps;

      return {
        currentUsersGroupMemberships: q => q.findRelatedRecords(currentUser, 'groupMemberships'),
        groupMemberships: q => q.findRecords('groupMembership')
      };
    }),
  )(DataWrapper);
}
