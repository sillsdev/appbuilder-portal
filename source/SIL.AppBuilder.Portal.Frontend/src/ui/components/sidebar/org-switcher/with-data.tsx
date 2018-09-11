import * as React from 'react';
import { compose, mapProps } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { ResourceObject } from 'jsonapi-typescript';

import { query, defaultOptions, ORGANIZATIONS_TYPE, withLoader } from '@data';
import { IProvidedProps as IFilterProps, withFiltering } from '@data/containers/with-filtering';
import { TYPE_NAME as ORGANIZATION, OrganizationAttributes } from '@data/models/organization';
import { withCurrentUser, IProvidedProps as ICurrentUserProps } from '@data/containers/with-current-user';
import { debounce } from '@lib/debounce';

import { IProvidedProps as IReduxProps } from './with-redux';
import { IGivenProps } from './types';


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

export interface IProvidedDataProps {
  organizations: Array<ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>>;
  searchByName: (name: string) => void;
  selectOrganization: (id: string) => void;
  didTypeInSearch: (e: Event) => void;
  toggle: () => void;
}

type IProps =
& IOwnProps
& IFilterProps
& ICurrentUserProps
& IReduxProps
& IGivenProps
& WithDataProps;

export function withData(WrappedComponent) {
  class DataWrapper extends React.Component<IProps> {
    state = { searchTerm: '' };

    selectOrganization = (id) => () => {
      const { setCurrentOrganizationId, toggle } = this.props;
      setCurrentOrganizationId(id);
      toggle();
    }

    search = debounce(() => {
      const { updateFilter } = this.props;
      const { searchTerm } = this.state;

      updateFilter({ attribute: 'name', value: `${searchTerm}*` });
    }, 250);

    didTypeInSearch = (e) => {
      const searchTerm = e.target.value;

      this.setState({ searchTerm }, this.search);
    }

    render() {
      const { searchTerm } = this.state;

      const extraDataProps = {
        searchTerm,
        didTypeInSearch: this.didTypeInSearch,
        selectOrganization: this.selectOrganization,
      };

      return <WrappedComponent { ...this.props } { ...extraDataProps } />;
    }
  }

  return compose(
    withFiltering({
      requiredFilters: [
        { attribute: 'scope-to-current-user', value: 'isnull:' }
      ]
    }),
    query(mapNetworkToProps),
    withOrbit(({ applyFilter }: IProps) => ({
      organizations: q => applyFilter(q.findRecords(ORGANIZATION), true, true)
    })),
    // if something doesn't have attributes, it hasn't been fetched from the remote
    mapProps((props: IProps) => ({
      ...props,
      organizations: props.organizations.filter(o => o.attributes)
    })),
    withLoader(({ fromNetwork, organizations }) => !organizations),
  )(DataWrapper);
}
