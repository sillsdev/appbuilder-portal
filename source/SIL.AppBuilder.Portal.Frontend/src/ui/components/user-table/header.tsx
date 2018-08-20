import * as React from 'react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

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
  translate('translations'),
)(Header);