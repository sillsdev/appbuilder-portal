import { compose, mapProps } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { query, defaultOptions, ORGANIZATIONS_TYPE, withLoader } from '@data';
import { IProvidedProps as IFilterProps } from '@data/containers/with-filtering';
import { TYPE_NAME as ORGANIZATION, OrganizationAttributes } from '@data/models/organization';
import { ResourceObject } from 'jsonapi-typescript';
import { withCurrentUser, IProvidedProps as ICurrentUserProps } from '@data/containers/with-current-user';

function mapNetworkToProps(passedProps) {
  const { applyFilter } = passedProps;

  return {
    fromNetwork: [
      q => applyFilter(q.findRecords(ORGANIZATION)),
      defaultOptions()
    ]
  };
}

interface IOwnProps {
  organizations: Array<ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>>;
}

type IProps =
& IOwnProps
& IFilterProps
& ICurrentUserProps
& WithDataProps;

export function withData(WrappedComponent) {
  return compose(
    withCurrentUser(),
    query(mapNetworkToProps),
    withLoader(({ fromNetwork }) => !fromNetwork),
    withOrbit(({ applyFilter }: IProps) => ({
      organizations: q => applyFilter(q.findRecords(ORGANIZATION), true, true)
    })),
    // if something doesn't have attributes, it hasn't been fetched from the remote
    mapProps((props: IProps) => ({ 
      ...props, 
      organizations: props.organizations.filter(o => o.attributes)
    })),
    withLoader(({ organizations }) => !organizations),
  )(WrappedComponent);
}
