import * as React from 'react';
import { compose } from 'recompose';
import { query, defaultOptions, GROUPS_TYPE, GROUP_MEMBERSHIPS_TYPE, USERS_TYPE } from '@data';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import * as toast from '@lib/toast';

import { relationshipFor } from '@data';
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

  class DataWrapper extends React.Component<IProps> {

    addGroupToUserMembership = async (userId, groupId) => {

      const { updateStore } = this.props;

      try {

        await updateStore(t => t.addRecord({
          type: 'groupMembership',
          attributes: {},
          relationships: {
            user: { data: { type: 'user', id: userId } },
            group: { data: { type: 'group', id: groupId } }
          }
        }
        ), defaultOptions());

        toast.success('User added to group');

      } catch(e) {
        console.error(e);
        toast.error('Error: Adding user to group');
      }
    }

    removeGroupFromMembership = async (groupMembershipId) => {

      const { updateStore } = this.props;

      try {
        await updateStore(t => t.removeRecord({
          type: 'groupMembership',
          id: groupMembershipId
        }
        ), defaultOptions());
        toast.success('User removed from group');
      } catch(e) {
        console.error(e);
        toast.error('Error: Removing group Membership');
      }

    }

    render() {

      const { groups, ...otherProps } = this.props;

      if (!groups) {
        return <Loader />;
      }

      const props = {
        ...otherProps,
        groups,
        addGroupToUserMembership: this.addGroupToUserMembership,
        removeGroupFromMembership: this.removeGroupFromMembership
      };

      return <WrappedComponent {...props} />;
    }
  }

  return compose(
    query(mapNetworkToProps),
    withOrbit({}),
  )(DataWrapper);
}
