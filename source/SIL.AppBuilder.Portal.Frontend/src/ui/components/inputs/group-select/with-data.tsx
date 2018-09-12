import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import {
  GROUPS_TYPE, GROUP_MEMBERSHIPS_TYPE, USERS_TYPE,
  buildFindRelatedRecords,
  isRelatedRecord,
  withLoader,
  idsForRelationship,
  recordsWithIdIn,
  buildFindRelatedRecord,
  PROJECTS_TYPE,
  ORGANIZATIONS_TYPE,
  isRelatedTo
} from '@data';

import { TYPE_NAME as GROUP, GroupAttributes } from '@data/models/group';
import { GroupMembershipAttributes } from '@data/models/group-membership';
import { UserAttributes } from '@data/models/user';

import { ResourceObject } from 'jsonapi-typescript';
import { ProjectAttributes } from '@data/models/project';
import { OrganizationAttributes } from '@data/models/organization';

export interface IProvidedProps {
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
  disableSelection: true;
}

interface IOwnProps {
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
  groupMembershipsForCurrentUser: Array<ResourceObject<GROUP_MEMBERSHIPS_TYPE, GroupMembershipAttributes>>;
  scopeToCurrentUser?: boolean;
  scopeToOrganization?: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
  selected: Id;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withData(WrappedComponent) {
  const mapRecordsToProps = (passedProps) => {
    const { currentUser, project } = passedProps;

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
        scopeToCurrentUser, scopeToOrganization,
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

      if (scopeToOrganization) {
        availableGroups = availableGroups.filter(group => {
          if (group.id === selected) { return true; }

          return isRelatedTo(group, 'owner', scopeToOrganization.id);
        });
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
