import * as React from 'react';
import { withTranslations, i18nProps } from '@lib/i18n';

import FocusPanel from '@ui/components/focus-panel';
import { compose } from 'redux';
import { withLogout, IProvidedProps as ILogoutProps } from '@data';

class OrgMembershipRequired extends React.Component<ILogoutProps & i18nProps> {
  render() {
    const { t, logout } = this.props;

    return (
      <FocusPanel title={t('errors.orgMembershipRequired')}>
        <div dangerouslySetInnerHTML={{ __html: t('errors.orgMembershipRequiredText') }} />

          <button className='ui button m-t-lg' data-test-logout onClick={logout}>
            {t('header.signOut')}
          </button>
      </FocusPanel>
    );
  }
}

export default compose(
  withTranslations,
  withLogout
)(OrgMembershipRequired);


