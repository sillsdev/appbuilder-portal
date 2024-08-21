import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import * as toast from '@lib/toast';
import { GroupResource, UserResource, GroupMembershipResource } from '@data';
import { buildOptions, create } from '@data';
import { attributesFor, isRelatedRecord } from '@data/helpers';
import { IProvidedProps as ICurrentUserProps } from '@data/containers/with-current-user';

export interface IProvidedProps {
  userHasGroup: (group: GroupResource) => boolean;
  toggleGroup: (group: GroupResource) => void;
}

interface IOwnProps {
  groups: GroupResource[];
  groupMemberships: GroupMembershipResource[];

  propsForGroupMemberships?: {
    user: UserResource;
  };
}

type IProps = IOwnProps & ICurrentUserProps & WithDataProps;

export function withGroupMemberships<T>(WrappedComponent) {
  class UserGroupWrapper extends React.PureComponent<T & IProps> {
    get user() {
      const { currentUser, propsForGroupMemberships } = this.props;

      return (propsForGroupMemberships && propsForGroupMemberships.user) || currentUser;
    }

    get userName() {
      return attributesFor(this.user).name;
    }

    userHasGroup = (group: GroupResource) => {
      return !!this.groupMembershipForGroup(group);
    };

    groupMembershipForGroup = (group: GroupResource) => {
      const { groupMemberships } = this.props;

      return groupMemberships.find((groupMembership) => {
        return isRelatedRecord(groupMembership, group);
      });
    };

    toggleGroup = async (group: GroupResource) => {
      const userHasGroup = this.userHasGroup(group);

      try {
        if (userHasGroup) {
          await this.removeFromGroup(group);
        } else {
          await this.addToGroup(group);
        }
      } catch (e) {
        toast.error(e);
      }
    };

    addToGroup = async (group: GroupResource) => {
      const { dataStore } = this.props;

      await create(dataStore, 'groupMembership', {
        relationships: {
          user: this.user,
          group,
        },
      });

      toast.success(`${this.userName} added to group`);
    };

    removeFromGroup = async (group: GroupResource) => {
      const { dataStore } = this.props;
      const groupName = attributesFor(group);

      const groupMembership = this.groupMembershipForGroup(group);

      if (groupMembership) {
        await dataStore.update((q) => q.removeRecord(groupMembership), buildOptions());

        toast.success(`${this.userName} removed from group`);
      } else {
        toast.warning(`${this.userName} is not in ${groupName}`);
      }
    };

    render() {
      const userGroupsProps = {
        userHasGroup: this.userHasGroup,
        toggleGroup: this.toggleGroup,
      };

      return <WrappedComponent {...this.props} {...userGroupsProps} />;
    }
  }

  return compose(
    withOrbit((props: ICurrentUserProps & IOwnProps) => {
      const { currentUser, propsForGroupMemberships, groupMemberships } = props;

      if (groupMemberships) {
        return {};
      }

      const user = (propsForGroupMemberships && propsForGroupMemberships.user) || currentUser;

      return {
        groupMemberships: (q) => q.findRelatedRecords(user, 'groupMemberships'),
      };
    })
  )(UserGroupWrapper);
}
