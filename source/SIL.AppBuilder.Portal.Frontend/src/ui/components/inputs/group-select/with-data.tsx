import * as React from 'react';
import { compose, branch, withProps } from 'recompose';
import { ResourceObject } from 'jsonapi-typescript';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import {
  GROUPS_TYPE, GROUP_MEMBERSHIPS_TYPE, USERS_TYPE,
  buildFindRelatedRecords,
  withLoader,
  idsForRelationship,
  recordsWithIdIn,
  ORGANIZATIONS_TYPE,
  isRelatedTo
} from '@data';

import { GroupMembershipAttributes } from '@data/models/group-membership';
import { OrganizationAttributes } from '@data/models/organization';
import { TYPE_NAME as GROUP, GroupAttributes, GroupResource } from '@data/models/group';
import { UserAttributes } from '@data/models/user';
import { withRelationships } from '@data/containers/with-relationship';



export interface IProvidedProps {
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
  disableSelection: true;
}

interface INeededProps {
  scopeToCurrentUser?: boolean;
  scopeToOrganization?: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
  selected: Id;
}

interface IOwnProps {
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
  groupMembershipsForCurrentUser: Array<ResourceObject<GROUP_MEMBERSHIPS_TYPE, GroupMembershipAttributes>>;
}

type IProps =
  & INeededProps
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
      console.log(this.props);

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

  return compose<IProps, INeededProps>(
    withOrbit(mapRecordsToProps),
    withLoader(({ groups, groupMembershipsForCurrentUser: gmU }) => !groups || !gmU),
    branch(
      (props: INeededProps) => props.scopeToCurrentUser,
      withRelationships((props: INeededProps) => {
        const { currentUser } = props;

        return {
          availableGroups: [currentUser, 'groupMemberships', 'group']
        };
      }),
      withProps(({ groups }) => {
        return {
          availableGroups: groups
        };
      })
    ),
    branch(
      (props: INeededProps) => props.scopeToOrganization,
      withProps((props: INeededProps & { availableGroups: GroupResource[] }) => {
        const { availableGroups, selected, scopeToOrganization } = props;

        return {
          availableGroups: availableGroups && availableGroups.filter(group => {
            if (group.id === selected) { return true; }

            return isRelatedTo(group, 'owner', scopeToOrganization.id);
          })
        };
      })
    )
  )(DataWrapper);
}
