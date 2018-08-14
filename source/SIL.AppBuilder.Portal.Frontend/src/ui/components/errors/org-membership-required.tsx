import * as React from 'react';
import { withTranslations, i18nProps } from '@lib/i18n';

import FocusPanel from '@ui/components/focus-panel';

class OrgMembershipRequired extends React.Component {
  render() {
    const { t } = this.props;

    return (
      <FocusPanel title={t('errors.orgMembershipRequired')}>
        <div dangerouslySetInnerHTML={{ __html: t('errors.orgMembershipRequiredText') }} />
      </FocusPanel>
    );
  }
}

export default withTranslations(OrgMembershipRequired);


