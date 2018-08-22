import * as React from 'react';
import { compose } from 'recompose';
import { query, defaultOptions } from '@data';
import { WithDataProps } from 'react-orbitjs';

import { isRelatedTo } from '@data';
import { TYPE_NAME as GROUP, GroupAttributes } from '@data/models/group';
import { UserAttributes } from '@data/models/user';

import { PageLoader as Loader } from '@ui/components/loaders';

export interface IProvidedProps {
  groups: Array<JSONAPI<GroupAttributes>>;
}

interface IOwnProps {
  groups: Array<JSONAPI<GroupAttributes>>;
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
  }

  class DataWrapper extends React.Component<IProps> {
    render() {
      const { groups, currentUser, scopeToCurrentUser, ...otherProps } = this.props;

      if (!groups) {
        return <Loader />;
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
    query(mapNetworkToProps)
  )(DataWrapper);
}
