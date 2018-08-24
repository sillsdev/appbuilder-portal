import * as React from 'react';
import { compose } from 'recompose';
import { query, defaultOptions } from '@data';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { TYPE_NAME as USER, UserAttributes } from '@data/models/user';

import { PageLoader as Loader } from '@ui/components/loaders';

export interface IProvidedProps {
  users: Array<JSONAPI<UserAttributes>>;
  disableSelection: true;
}

interface IOwnProps {
  users: Array<JSONAPI<UserAttributes>>;
  usersFromCache: Array<JSONAPI<{}>>;
  currentUser: JSONAPI<UserAttributes>;
  selected: Id;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withData(WrappedComponent) {
  const mapNetworkToProps = (passedProps) => {
    return {
      users: [q => q.findRecords(USER), defaultOptions()]
    };
  };

  class DataWrapper extends React.Component<IProps> {
    render() {
      const {
        users,
        currentUser,
        selected,
        ...otherProps
      } = this.props;

      if (!users) {
        return <Loader />;
      }

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
    query(mapNetworkToProps),
    // withOrbit(mapRecordsToProps),
  )(DataWrapper);
}
