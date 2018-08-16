import * as React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { WithDataProps } from 'react-orbitjs';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';

import { OrganizationAttributes } from '@data/models/organization';
import { IProvidedProps as WithCurrentOrgProps } from '@data/containers/with-current-organization';

import Loader from '@ui/components/loaders/page';

import Row from './row';

export interface IOwnProps {
  organizations: Array<JSONAPI<OrganizationAttributes>>;
  isLoading: boolean;
  searchByName: (name: string) => void;
  toggle: () => void;
  searchTerm: string;
  allOrgsSelected: boolean;
  didTypeInSearch: (e: any) => void;
  selectOrganization: (id: number | string) => (e: any) => void;
}

export type IProps =
  & IOwnProps
  & WithCurrentOrgProps
  & WithDataProps
  & i18nProps;

interface IState {
  showSearch: boolean;
}

class OrgSwitcherDisplay extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    const showSearch = props.organizations.length > 4;

    this.state = { showSearch };
  }

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

    const { showSearch } = this.state;

    return (
      <Menu
        data-test-org-switcher
        className='m-t-none no-borders h-100 overflows' pointing secondary vertical>
        { showSearch && (
          <Menu.Item className='flex-row align-items-center border-bottom'>
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
          className={allOrgsSelected && 'active' || ''}
          name={t('org.allOrganizations')}
          onClick={selectOrganization('')} />
      </Menu>
    );
  }
}

export default OrgSwitcherDisplay;
