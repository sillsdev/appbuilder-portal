import * as React from 'react';
import { i18nProps } from '@lib/i18n';
import { IProvidedProps as IListProps } from '@data/containers/resources/user/list';
import { IProvidedProps as IFilterProps } from '@data/containers/api/with-filtering';
import { ICurrentUserProps } from '@data/containers/with-current-user';
import { IRolesProps } from '@data/containers/resources/role';
import DebouncedSearch from '@ui/components/inputs/debounced-search-field';
import { LoadingWrapper } from '@ui/components/loading-wrapper';

import InviteUser from './invitations';
import UserTable from './user-table/table';
import { IProps as IUserDataProps } from './user-table/data';

interface IOwnProps {
  allOrgsSelected: boolean;
}

type IProps = IOwnProps &
  IListProps &
  IFilterProps &
  IUserDataProps &
  ICurrentUserProps &
  IRolesProps &
  i18nProps;

export default class Users extends React.Component<IProps> {
  onSearch = (term: string) => {
    const { updateFilter, removeFilter } = this.props;

    if (!term) {
      return removeFilter({ attribute: 'name', value: '' });
    }

    updateFilter({ attribute: 'name', value: `like:${term}` });
  };

  onUserAdded = async () => {
    const { refetch } = this.props;
    await refetch();
  };

  render() {
    const { t, isLoading, roles, allOrgsSelected } = this.props;
    const addUserProps = { t, roles };

    return (
      <div className='ui container users' data-test-manageusers>
        <div className='flex justify-content-space-between'>
          <div className='page-heading flex align-items-center'>
            <h1>{t('users.title')}</h1>
            {!allOrgsSelected ? <InviteUser {...addUserProps} /> : null}
          </div>
          <div className='flex align-items-center'>
            <DebouncedSearch placeholder={t('common.search')} onSubmit={this.onSearch} />
          </div>
        </div>

        <LoadingWrapper isLoading={isLoading}>
          <UserTable {...this.props} />
        </LoadingWrapper>
      </div>
    );
  }
}
