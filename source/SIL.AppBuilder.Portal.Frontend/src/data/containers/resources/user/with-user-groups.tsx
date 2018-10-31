import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import * as toast from '@lib/toast';
import { GroupResource, UserResource, GroupMembershipResource } from '@data';
import { defaultOptions, } from '@data';
import { attributesFor , isRelatedRecord } from '@data/helpers';

export interface IProvidedProps {
  userHasGroup: (group: GroupResource) => boolean;
  toggleGroup: (group: GroupResource) => void;
}

interface IOwnProps {
  user: UserResource;
  groups: GroupResource[];
  userGroups: GroupResource[];
  groupMemberships: GroupMembershipResource[];
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withUserGroups<T>(WrappedComponent) {

  class UserRoleWrapper extends React.PureComponent<T & IProps> {

    userHasGroup = (group: GroupResource) => {
      const { userGroups } = this.props;
      return userGroups.map(uGroup => uGroup.id).includes(group.id);
    }

    groupMembershipForGroup = (group: GroupResource) => {
      const { groupMemberships } = this.props;
      return groupMemberships.find(groupMembership =>
        isRelatedRecord(groupMembership, group)
      )
    }

    toggleGroup = async (group: GroupResource) => {

      const { user } = this.props;
      const { name } = attributesFor(user);

      const userHasGroup = this.userHasGroup(group);

      try {
        if (userHasGroup) {
          await this.removeFromGroup(group);
          toast.success(`${name} removed from group`);
        } else {
          await this.addToGroup(group);
          toast.success(`${name} added to group`);
        }
      } catch (e) {
        toast.error(e);
      }
    }

    addToGroup = (group: GroupResource) => {

      const { dataStore, user } = this.props;
      const { name } = attributesFor(user);

      return dataStore.update(q => q.addRecord({
        type: 'groupMembership',
        attributes: {},
        relationships: {
          user: { data: user },
          group: { data: group }
        }
      }), defaultOptions());


    }

    removeFromGroup = (group: GroupResource) => {

      const { dataStore, user } = this.props;
      const { name } = attributesFor(user);

      const groupMembership = this.groupMembershipForGroup(group);
      return dataStore.update(q =>
        q.removeRecord(groupMembership), defaultOptions()
      );
    }

    render() {

      const userGroupsProps = {
        userHasGroup: this.userHasGroup,
        toggleGroup: this.toggleGroup
      };

      return (
        <WrappedComponent
          {...this.props}
          {...userGroupsProps}
        />
      );
    }

  }

  return compose(
    withOrbit(({user}) => {
      return {
        groupMemberships: q => q.findRelatedRecords(user,'groupMemberships')
      }
    })
  )(UserRoleWrapper);
}