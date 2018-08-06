import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { TYPE_NAME as USER, UserAttributes } from '@data/models/user';
import { TYPE_NAME as GROUP, GroupAttributes } from '@data/models/group';

import { query } from '@data';
import { isEmpty } from '@lib/collection';

import { PageLoader as Loader } from '@ui/components/loaders';

function mapNetworkToProps(passedProps) {

  return {
    // TODO: combine into one query when
    //       https://github.com/json-api-dotnet/JsonApiDotNetCore/issues/39
    //       is resolved
    users: q => q.findRecords(USER),
    groups: q => q.findRecords(GROUP)
  };
}

interface IOwnProps {
  users: Array<JSONAPI<UserAttributes>>;
  groups: Array<JSONAPI<GroupAttributes>>;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<IProps> {

    isLoading = () => {
      const { users, groups } = this.props;

      return !users || !groups;
    }

    render() {
      const { users, groups, ...otherProps } = this.props;

      const dataProps = { users, groups };

      if (this.isLoading()) {
        return <Loader />;
      }

      return (
        <WrappedComponent
          { ...dataProps }
          { ...otherProps }
        />
      );
    }
  }

  return query(mapNetworkToProps)(DataWrapper);
}
