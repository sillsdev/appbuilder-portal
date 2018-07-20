import * as React from 'react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';1

class Header extends React.Component<i18nProps> {

  render() {

    const { t } = this.props;

    return (
      <thead>
        <tr>
          <td>{t('users.table.columns.name')}</td>
          <td>{t('users.table.columns.role')}</td>
          <td>{t('users.table.columns.groups')}</td>
          <td>{t('users.table.columns.disabled')}</td>
        </tr>
      </thead>
    )
  }
}

export default compose(
  translate('translations'),
)(Header);