import * as React from 'react';
import { compose, mapProps } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { ResourceObject } from 'jsonapi-typescript';

import { query, defaultOptions, ORGANIZATIONS_TYPE, withLoader, attributesFor } from '@data';
import { IProvidedProps as IFilterProps, withFiltering } from '@data/containers/with-filtering';
import { TYPE_NAME as ORGANIZATION, OrganizationAttributes } from '@data/models/organization';
import { withCurrentUser, IProvidedProps as ICurrentUserProps } from '@data/containers/with-current-user';
import { debounce } from '@lib/debounce';

import { IProvidedProps as IReduxProps } from './with-redux';
import { IGivenProps } from './types';
import { SearchResults } from 'semantic-ui-react';


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
  searchResults: Array<ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>>;
  searchByName: (name: string) => void;
  selectOrganization: (id: string) => void;
  didTypeInSearch: (e: Event) => void;
  toggle: () => void;
}

interface IState {
  searchResults?: Array<ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>>;
  searchTerm: string;
}

type IProps =
& IOwnProps
& IFilterProps
& ICurrentUserProps
& IReduxProps
& IGivenProps
& WithDataProps;

export function withData(WrappedComponent) {
  class DataWrapper extends React.Component<IProps, IState> {
    state = { searchTerm: '' };

    selectOrganization = (id) => () => {
      const { setCurrentOrganizationId, toggle } = this.props;
      setCurrentOrganizationId(id);
      toggle();
    }

    search = debounce(() => {
      const { searchTerm } = this.state;

      this.performSearch(searchTerm);
    }, 250);

    didTypeInSearch = (e) => {
      const searchTerm = e.target.value;

      this.setState({ searchTerm }, this.search);
    }

    // TODO: clean this up once
    //       https://github.com/orbitjs/orbit/pull/525
    //       is merged, where we'll be able to retrieve the query result
    //       without local filtering. (so we can skip the cache query step)
    performSearch = async (searchTerm: string) => {
      const { dataStore } = this.props;

      await dataStore.query(q =>
        q
          .findRecords(ORGANIZATION)
          .filter(
            { attribute: 'name', value: `like:${searchTerm}`},
            { attribute: 'scope-to-current-user', value: 'isnull:' }
          ),
        defaultOptions()
      );

      const records = await dataStore.cache.query(q => q.findRecords(ORGANIZATION));
      // TODO: MAY need to do a local filter on organizations that the current user owns
      const filtered = records.filter(record => {
        const { name } = attributesFor(record);
        if (!name) { return false; }

        return (name as string).toLowerCase().includes(searchTerm.toLowerCase());
      });

      this.setState({ searchResults: filtered });
    }

    render() {
      const { searchTerm, searchResults } = this.state;

      const extraDataProps = {
        searchTerm, searchResults,
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
    withOrbit(() => ({
      organizations: q => q.findRecords(ORGANIZATION)
    })),
    // if something doesn't have attributes, it hasn't been fetched from the remote
    mapProps((props: IProps) => ({
      ...props,
      organizations: props.organizations.filter(o => o.attributes)
    })),
    withLoader(({ organizations }) => !organizations),
  )(DataWrapper);
}
