import * as React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { WithDataProps } from 'react-orbitjs';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';

import { OrganizationAttributes } from '@data/models/organization';
import { IProvidedProps as WithCurrentOrgProps } from '@data/containers/with-current-organization';

import Loader from '@ui/components/loaders/page';

import Row from './row';
import { ResourceObject } from 'jsonapi-typescript';
import { ORGANIZATIONS_TYPE } from '@data';

export interface IOwnProps {
  organizations: Array<ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>>;
  isLoading: boolean;
  searchByName: (name: string) => void;
  toggle: () => void;
  searchTerm: string;
  allOrgsSelected: boolean;
  didTypeInSearch: (e: any) => void;
  selectOrganization: (id: Id) => (e: any) => void;
}

export type IProps =
  & IOwnProps
  & WithCurrentOrgProps
  & WithDataProps
  & i18nProps;

class OrgSwitcherDisplay extends React.Component<IProps> {
  render() {
    const {
      t,
      organizations,
      currentOrganizationId,
      isLoading,
      allOrgsSelected,
      searchTerm,
      didTypeInSearch,
      selectOrganization
    } = this.props;

    const showSearch = organizations.length > 4 || !!searchTerm;

    return (
      <Menu
        data-test-org-switcher
        className='m-t-none no-borders h-100 overflows' pointing secondary vertical>
        { showSearch && (
          <Menu.Item
            data-test-org-switcher-search
            className='flex-row align-items-center border-bottom'>

            <Icon name='search' />
            <div className='ui input'>
              <input
                value={searchTerm}
                className='no-borders bg-white'
                onChange={didTypeInSearch}
                placeholder={t('search')} type='text' />
            </div>
          </Menu.Item>
        )}

        { isLoading && <Loader /> }

        { !isLoading && organizations.map(organization => (
          <Row key={organization.id}
            organization={organization}
            onClick={selectOrganization(organization.id)}
            isActive={currentOrganizationId === organization.id} />
        ))}

        <hr />

        <Menu.Item
          data-test-select-item-all-org
          className={allOrgsSelected && 'active' || ''}
          name={t('org.allOrganizations')}
          onClick={selectOrganization('')} />
      </Menu>
    );
  }
}

export default OrgSwitcherDisplay;
