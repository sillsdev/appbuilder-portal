import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { query, defaultSourceOptions, defaultOptions } from '@data';
import { IProvidedProps as IFilterProps } from '@data/containers/with-filtering';
import { TYPE_NAME as ORGANIZATION, OrganizationAttributes } from '@data/models/organization';
import { isEmpty } from '@lib/collection';

function mapRecordsToProps(passedProps) {
  const { filterOptions, applyFilter } = passedProps;

  return {
    fromCache: q =>
      applyFilter(q.findRecords(ORGANIZATION))
  };
}

function mapNetworkToProps(passedProps) {
  const { applyFilter } = passedProps;

  return {
    organizations: [
      q => applyFilter(q.findRecords(ORGANIZATION)),
      defaultOptions()
    ]
  };
}

interface IOwnProps {
  organizations: Array<JSONAPI<OrganizationAttributes>>;
  fromCache: Array<JSONAPI<OrganizationAttributes>>;
}

type IProps =
& IOwnProps
& IFilterProps
& WithDataProps;

export function withData<T>(WrappedComponent) {
  class DataWrapper extends React.Component<IProps & T> {
    render() {
      const { organizations, fromCache, ...otherProps } = this.props;

      const dataProps = {
        organizations: fromCache || organizations
      };

      return <WrappedComponent { ...otherProps } { ...dataProps }/>;
    }
  }

  return compose(
    query(mapNetworkToProps),
    withOrbit(mapRecordsToProps)
  )(DataWrapper);
}
