import * as React from 'react';
import { compose } from 'recompose';
import { query, defaultOptions, GROUPS_TYPE, GROUP_MEMBERSHIPS_TYPE, USERS_TYPE, ORGANIZATIONS_TYPE, relationshipFor, attributesFor } from '@data';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import * as toast from '@lib/toast';

import { defaultSourceOptions } from '@data';
import { TYPE_NAME as GROUP, GroupAttributes } from '@data/models/group';
import { GroupMembershipAttributes } from '@data/models/group-membership';

import { PageLoader as Loader } from '@ui/components/loaders';
import { ResourceObject } from 'jsonapi-typescript';
import { OrganizationAttributes } from '@data/models/organization';

export interface IProvidedProps {
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
  groupsByOrganization: Array<{
    orgName: string;
    groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
  }>;
}

interface IOwnProps {
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
  organizations: Array<ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>>;
  groupsFromCache: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
  groupMemberships: Array<ResourceObject<GROUP_MEMBERSHIPS_TYPE, GroupMembershipAttributes>>;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withData(WrappedComponent) {

  const mapNetworkToProps = () => {
    return {
      groups: [
        q => q.findRecords(GROUP), {
          sources: {
            remote: {
              settings: { ...defaultSourceOptions() },
              include: ['owner']
            }
          }
        }
      ]
    };
  };

  const mapRecordsToProps = () => {
    return {
      organizations: q => q.findRecords('organization')
    };
  };

  class DataWrapper extends React.Component<IProps> {

    addGroupToUserMembership = async (userId, groupId) => {

      const { updateStore } = this.props;

      try {

        await updateStore(t => t.addRecord({
          type: 'groupMembership',
          id: null,
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

    groupByOrganization = (groups, organizations) => {
      const groupBy = groups.reduce((memo, group) => {

        const organizationId = relationshipFor(group, 'owner').data.id;

        if (!memo[organizationId]) {
          memo[organizationId] = [];
        }

        memo[organizationId].push(group);

        return memo;

      }, {});

      return Object.keys(groupBy).reduce((memo, orgId) => {

        const org = organizations.find(o => o.id === orgId);

        memo.push({
          orgName: attributesFor(org).name,
          groups: groupBy[orgId]
        });

        return memo;
      },[]);
    }

    render() {

      const { groups, organizations, ...otherProps } = this.props;

      if (!groups || !organizations) {
        return <Loader />;
      }

      const groupsByOrganization = this.groupByOrganization(groups, organizations);

      const props = {
        ...otherProps,
        groups,
        groupsByOrganization,
        addGroupToUserMembership: this.addGroupToUserMembership,
        removeGroupFromMembership: this.removeGroupFromMembership
      };

      return <WrappedComponent {...props} />;
    }
  }

  return compose(
    query(mapNetworkToProps),
    withOrbit(mapRecordsToProps),
  )(DataWrapper);
}
