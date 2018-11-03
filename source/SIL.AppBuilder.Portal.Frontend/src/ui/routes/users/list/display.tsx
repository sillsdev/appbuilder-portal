import * as React from 'react';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';

import { IProvidedProps as IListProps } from '@data/containers/resources/user/list';
import { IProvidedProps as IFilterProps } from '@data/containers/api/with-filtering';
import { IProvidedProps as ICurrentUserProps } from '@data/containers/with-current-user';
import { IRolesProps } from '@data/containers/resources/role';
import DebouncedSearch from '@ui/components/inputs/debounced-search-field';

import UserTable from '@ui/components/user-table/table';
import { IProps as IUserDataProps } from '@ui/components/user-table/data';
import { LoadingWrapper } from '@ui/components/loading-wrapper';

interface IOwnProps {
}

type IProps =
& IOwnProps
& IListProps
& IFilterProps
& IUserDataProps
& ICurrentUserProps
& IRolesProps
& i18nProps;

export default class Users extends React.Component<IProps> {
  onSearch = (term: string) => {
    const { updateFilter, removeFilter } = this.props;

    if (!term) {
      return removeFilter({ attribute: 'name', value: '' });
    }

    updateFilter({ attribute: 'name', value: `like:${term}` });
  }

  render() {
    const { t, isLoading } = this.props;

    return (
      <div className='ui container users'>
        <div className='flex justify-content-space-between'>
          <h1 className='page-heading'>{t('users.title')}</h1>
          <div className='flex align-items-center'>
            <DebouncedSearch
              placeholder={t('common.search')}
              onSubmit={this.onSearch}
            />
          </div>
        </div>

        <LoadingWrapper isLoading={isLoading}>
          <UserTable { ...this.props } />
        </LoadingWrapper>
      </div>
    );
  }
}

