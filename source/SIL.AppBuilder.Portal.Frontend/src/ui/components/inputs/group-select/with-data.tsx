import * as React from 'react';
import { compose } from 'recompose';
import { query, defaultOptions } from '@data';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { isRelatedTo, relationshipsFor, relationshipFor } from '@data';
import { TYPE_NAME as GROUP, PLURAL_NAME as GROUPS, GroupAttributes } from '@data/models/group';
import { TYPE_NAME as GROUP_MEMBERSHIP } from '@data/models/group-membership';
import { UserAttributes } from '@data/models/user';

import { PageLoader as Loader } from '@ui/components/loaders';

export interface IProvidedProps {
  groups: Array<JSONAPI<GroupAttributes>>;
}

interface IOwnProps {
  groups: Array<JSONAPI<GroupAttributes>>;
  groupMemberships: Array<JSONAPI<{}>>;
  scopeToCurrentUser: boolean;
  currentUser: JSONAPI<UserAttributes>;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withData(WrappedComponent) {
  const mapNetworkToProps = (passedProps) => {
    return {
      groups: [q => q.findRecords(GROUP), defaultOptions()]
    };
  };

  const mapRecordsToProps = (passedProps) => ({
    groupMemberships: q => {
      console.log(passedProps);
     return q.findRecords(GROUP_MEMBERSHIP)
    }
  });

  class DataWrapper extends React.Component<IProps> {
    render() {
      const { groups, groupMemberships, currentUser, scopeToCurrentUser, ...otherProps } = this.props;

      if (!groups || !groupMemberships) {
        return <Loader />;
      }

      let availableGroups;

      if (scopeToCurrentUser) {
        const memberships = relationshipFor(currentUser, 'groupMemberships');
        const membershipIds = (memberships.data || []).map(m => m.id);
        const applicableMemberships = groupMemberships.filter(gm => (
          membershipIds.include(gm.id)
        ));

        const groupIds = applicableMemberships.map(gm => relationshipFor(gm, GROUPS).data.id);

        availableGroups = groups.filter(g => groupIds.include(g.id));
      } else {
        availableGroups = groups;
      }
      const availableGroups = scopeToCurrentUser
        ? groups.filter(group => (
            isRelatedTo(currentUser, 'groups', group.id)
          ))
        : groups;

      const props = {
        ...otherProps,
        groups,
      };

      return <WrappedComponent { ...props } />;
    }
  }

  return compose(
    query(mapNetworkToProps),
    withOrbit(mapRecordsToProps),
  )(DataWrapper);
}
