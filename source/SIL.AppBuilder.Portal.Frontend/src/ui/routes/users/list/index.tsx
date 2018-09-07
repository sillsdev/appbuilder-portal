import * as React from 'react';
import { compose } from 'recompose';

import { InjectedTranslateProps as i18nProps } from 'react-i18next';
import UserTable from '@ui/components/user-table';
import { withTranslations } from '@lib/i18n';

export const pathName = '/users';

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
  withTranslations,
)(Users);
