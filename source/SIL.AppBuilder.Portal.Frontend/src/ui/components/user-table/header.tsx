import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';

class Header extends React.Component<i18nProps> {

  render() {

    const { t } = this.props;

    return (
      <thead>
        <tr>
          <th>{t('users.table.columns.name')}</th>
          <th>{t('users.table.columns.role')}</th>
          <th>{t('users.table.columns.groups')}</th>
          <th>{t('users.table.columns.active')}</th>
        </tr>
      </thead>
    );
  }
}

export default compose(
  withTranslations
)(Header);