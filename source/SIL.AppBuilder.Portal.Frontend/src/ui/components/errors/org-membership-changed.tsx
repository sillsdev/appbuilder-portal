import * as React from 'react';
import { compose } from 'recompose';
import { withLogout, IProvidedProps as ILogoutProps } from '@data/containers/with-logout';
import { withTranslations, i18nProps } from '@lib/i18n';
import FocusPanel from '@ui/components/focus-panel';

type IProps = ILogoutProps & i18nProps;

class OrgMembershipChanged extends React.Component<IProps> {
  render() {
    const { t, logout } = this.props;

    return (
      <FocusPanel title={t('errors.orgMembershipChanged')}>
        <div dangerouslySetInnerHTML={{ __html: t('errors.orgMembershipChangedText') }} />

        <button className='ui button m-t-lg' data-test-logout onClick={logout}>
          {t('header.signOut')}
        </button>
      </FocusPanel>
    );
  }
}

export default compose<IProps, {}>(
  withTranslations,
  withLogout
)(OrgMembershipChanged);
