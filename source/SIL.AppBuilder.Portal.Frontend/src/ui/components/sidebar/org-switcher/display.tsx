import * as React from 'react';
import { Menu } from 'semantic-ui-react';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';
import SearchIcon from '@material-ui/icons/Search';
import { WithDataProps } from 'react-orbitjs';
import { uniqBy } from 'lodash';

import { idFromRecordIdentity } from '@data';

import { IProvidedProps as WithCurrentOrgProps } from '@data/containers/with-current-organization';

import { IGivenProps } from './types';
import { IProvidedDataProps } from './with-data';
import { IProvidedProps as IReduxProps } from './with-redux';
import Row from './row';
import { useTranslations } from '~/lib/i18n';

export interface IOwnProps {
  toggle: () => void;
  searchTerm: string;
  allOrgsSelected: boolean;
  didTypeInSearch: (e: any) => void;
  selectOrganization: (id: Id) => (e: any) => void;
}

export type IProps = IGivenProps &
  IReduxProps &
  IOwnProps &
  WithCurrentOrgProps &
  WithDataProps &
  IProvidedDataProps &
  i18nProps;

export default function OrgSwitcherDisplay(props: IProps) {
  const {
    currentOrganizationId,
    allOrgsSelected,
    searchTerm,
    didTypeInSearch,
    selectOrganization,
    searchResults,
  } = props;

  const { t } = useTranslations();

  const showSearch = searchResults.length > 4;
  const results = uniqBy(searchResults, (org) => org.id);
  const noResults = !results || results.length === 0;

  return (
    <Menu
      data-test-org-switcher
      className='m-t-none no-borders h-100 overflows'
      pointing
      secondary
      vertical
    >
      {showSearch && (
        <Menu.Item
          data-test-org-switcher-search
          className='flex-row align-items-center border-bottom'
        >
          <SearchIcon />
          <div className='ui input'>
            <input
              value={searchTerm}
              className='no-borders bg-white'
              onChange={didTypeInSearch}
              placeholder={t('search')}
              type='text'
            />
          </div>
        </Menu.Item>
      )}

      {results.map((organization) => {
        const id = idFromRecordIdentity(organization as any);

        return (
          <Row
            key={organization.id}
            organization={organization}
            onClick={selectOrganization(id)}
            isActive={currentOrganizationId === id}
          />
        );
      })}

      {noResults && <Menu.Item>{t('common.noResults')}</Menu.Item>}

      <hr />

      <Menu.Item
        data-test-select-item-all-org
        className={(allOrgsSelected && 'active') || ''}
        name={t('org.allOrganizations')}
        onClick={selectOrganization('')}
      />
    </Menu>
  );
}
