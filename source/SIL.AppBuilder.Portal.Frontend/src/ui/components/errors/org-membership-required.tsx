import * as React from 'react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import FocusPanel from '@ui/components/focus-panel';

class OrgMembershipRequired extends React.Component {
  render() {
    const { t } = this.props;

    return (
      <FocusPanel title={t('errors.orgMembershipRequired')}>
        {t('errors.orgMembershipRequiredText')}
      </FocusPanel>
    );
  }
}

export default translate('translations')(OrgMembershipRequired);


