import * as React from 'react';
import { compose } from 'recompose';
import { match as Match, Redirect } from 'react-router';

import { query, defaultOptions } from '@data';
import { TYPE_NAME as USER, UserAttributes } from '@data/models/user';

import { PageLoader as Loader } from '@ui/components/loaders';

export interface Params {
  id: string;
}

interface PassedProps {
  match: Match<Params>;
}

interface IOwnProps {
  user: JSONAPIDocument<UserAttributes>;
}

type IProps =
  & IOwnProps
  & PassedProps;

export function withData(WrappedComponent) {
  const mapNetworkToProps = (passedProps) => {
    const { match } = passedProps;
    const { params: { id } } = match;

    return {
      user: [q => q.findRecord({ id, type: USER }), defaultOptions()]
    };
  };

  class DataWrapper extends React.Component<IProps> {
    render() {
      const { user } = this.props;

      if (!user) {
        return <Loader />;
      }

      return <WrappedComponent { ...this.props } />;
    }
  }

  return compose(
    query(mapNetworkToProps)
  )(DataWrapper);
}
