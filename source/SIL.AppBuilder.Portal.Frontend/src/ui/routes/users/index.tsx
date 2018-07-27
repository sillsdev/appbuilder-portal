import * as React from 'react';
import { compose } from 'recompose';

import { requireAuth } from '@lib/auth';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { withLayout } from '@ui/components/layout';
import UserTable from '@ui/components/user-table';

export const pathName = '/users';

import './users.scss';

class Users extends React.Component<i18nProps> {

  render() {

    const { t } = this.props;

    return (
      <div className='ui container users'>
        <div className='flex justify-content-space-between'>
          <h1 className='page-heading'>{t('users.title')}</h1>
          <div className='flex align-items-center'>
            <div className='ui left icon input search-component'>
              <input type="text" placeholder={`${t('common.search')}...`}/>
              <i className='search icon'/>
            </div>
          </div>
        </div>
        <UserTable/>
      </div>
    );

  }

}

export default compose(
  translate('translations'),
  withLayout,
  requireAuth
)(Users);