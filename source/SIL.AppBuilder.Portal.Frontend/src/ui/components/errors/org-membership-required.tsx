import * as React from 'react';
import { withTranslations, i18nProps } from '@lib/i18n';

import FocusPanel from '@ui/components/focus-panel';
import { Button } from 'semantic-ui-react';
import { compose } from 'redux';
import { withLogout } from '@data/containers/with-logout';

class OrgMembershipRequired extends React.Component {
  render() {
    const { t, logout } = this.props;

    return (
      <FocusPanel title={t('errors.orgMembershipRequired')}>
        <div dangerouslySetInnerHTML={{ __html: t('errors.orgMembershipRequiredText') }} />

          <Button className='m-t-lg' data-test-logout onClick={logout}>
            {t('header.signOut')}
          </Button>
      </FocusPanel>
    );
  }
}

export default compose(
  withTranslations,
  withLogout
)(OrgMembershipRequired);


