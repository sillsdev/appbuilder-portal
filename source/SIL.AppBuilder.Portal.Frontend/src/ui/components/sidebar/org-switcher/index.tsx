import * as React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { WithDataProps } from 'react-orbitjs';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import { OrganizationAttributes } from '@data/models/organization';
import { withCurrentOrganization } from '@data/containers/with-current-organization';
import { debounce } from '@lib/debounce';
import { setCurrentOrganization } from '@store/data';

import Loader from '@ui/components/loaders/page';

import { withData } from './with-data';

export interface IOwnProps {
  organizations: Array<JSONAPI<OrganizationAttributes>>;
  isLoading: boolean;
  searchByName: (name: string) => void;
}

export type IProps =
  & IOwnProps
  & WithDataProps
  & i18nProps;


const mapDispatchToProps = (dispatch) => ({
  setCurrentOrganizationId: (id) => dispatch(setCurrentOrganization(id))
});

class OrgSwitcher extends React.Component<IProps> {
  state = { search: '' };

  selectOrganization = (id) => (e) => {
    const { setCurrentOrganizationId } = this.props;

    setCurrentOrganizationId(id);
  }

  search = debounce(() => {
    const { searchByName } = this.props;
    const { search } = this.state;

    searchByName(search);
  }, 250);

  didTypeInSearch = (e) => {
    const search = e.target.value;

    this.setState({ search }, this.search);
  }

  render() {
    const {
      t,
      organizations,
      currentOrganizationId,
      isLoading
    } = this.props;

    const { search } = this.state;

    const allOrgsSelected = '' === currentOrganizationId;
    const orgs = organizations || [];
    const showSearch = orgs.length > 4;

    return (
      <Menu className='m-t-none no-borders' pointing secondary vertical>
        { showSearch && (
          <Menu.Item className='flex-row align-items-center border-bottom'>
            <Icon name='search' />
            <div className='ui input'>
              <input
                value={search}
                className='no-borders bg-white'
                onChange={this.didTypeInSearch}
                placeholder={t('search')} type='text' />
            </div>
          </Menu.Item>
        )}

        { isLoading && <Loader /> }

        { !isLoading && orgs.map(({ attributes, id }, index) => (

          <Menu.Item
            key={index}
            className={`
              flex-row align-items-center
              ${id === currentOrganizationId ? 'active' : ''}`}
            name={attributes.name}
            onClick={this.selectOrganization(id)}>

            <span className='list-thumbnail m-r-md'>
              &nbsp;
            </span>

            <span>{attributes.name}</span>
          </Menu.Item>
        )) }

        <hr />

        <Menu.Item
          className={allOrgsSelected && 'active' || ''}
          name={t('org.allOrganizations')}
          onClick={this.selectOrganization('')} />
      </Menu>
    );
  }
}

export default compose(
  translate('translations'),
  connect(null, mapDispatchToProps),
  withCurrentOrganization,
  withData,
)(OrgSwitcher);
