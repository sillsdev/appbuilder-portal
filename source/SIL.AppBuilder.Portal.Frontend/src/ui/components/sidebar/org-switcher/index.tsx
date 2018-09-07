import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { WithDataProps } from 'react-orbitjs';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';

import { OrganizationAttributes } from '@data/models/organization';
import { withCurrentOrganization, IProvidedProps as WithCurrentOrgProps } from '@data/containers/with-current-organization';
import { debounce } from '@lib/debounce';
import { setCurrentOrganization } from '@store/data';

import { withFiltering, IProvidedProps as IFilterProps } from '@data/containers/with-filtering';

import { withData } from './with-data';
import Display from './display';
import { ResourceObject } from 'jsonapi-typescript';
import { ORGANIZATIONS_TYPE } from '@data';
import { withTranslations } from '@lib/i18n';

export interface IOwnProps {
  organizations: Array<ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>>;
  isLoading: boolean;
  searchByName: (name: string) => void;
  setCurrentOrganizationId: (id: Id) => void;
  toggle: () => void;
}

export type IProps =
  & IOwnProps
  & IFilterProps
  & WithCurrentOrgProps
  & WithDataProps
  & i18nProps;


const mapDispatchToProps = (dispatch) => ({
  setCurrentOrganizationId: (id) => dispatch(setCurrentOrganization(id))
});

class OrgSwitcher extends React.Component<IProps> {
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
    const {
      t,
      organizations,
      currentOrganizationId,
      isLoading
    } = this.props;

    const { searchTerm } = this.state;

    const allOrgsSelected = '' === currentOrganizationId;
    const orgs = organizations || [];

    const displayProps = {
      t,
      isLoading,
      allOrgsSelected,
      currentOrganizationId,
      organizations: orgs,
      searchTerm,
      didTypeInSearch: this.didTypeInSearch,
      selectOrganization: this.selectOrganization,
    };

    return (
      <Display { ...displayProps } />
    );
  }
}

export default compose(
  withTranslations,
  connect(null, mapDispatchToProps),
  withCurrentOrganization,
  withFiltering(),
  withData,
)(OrgSwitcher);
