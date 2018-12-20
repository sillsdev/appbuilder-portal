import * as React from 'react';
import { compose } from 'recompose';

import ResponsiveNav from '@ui/components/semantic-extensions/responsive-sub-navigation';
import { withTranslations, i18nProps } from '@lib/i18n';

type IProps =
  & i18nProps;

class Navigation extends React.Component<IProps> {

  render() {

    const { t } = this.props;

    return (
      <ResponsiveNav
        items={[
          { to: '/admin/settings/organizations',
            text: t('admin.settings.navigation.organizations')
          },
          {
            to: '/admin/settings/workflow-definitions',
            text: t('admin.settings.navigation.workflowdefinitions')
          },
          {
            to: '/admin/settings/product-definitions',
            text: t('admin.settings.navigation.productDefinitions')
          },
          {
            to: '/admin/settings/store-types',
            text: t('admin.settings.navigation.storeTypes')
          }
        ]}
        exactRoutes={false}
      />
    );
  }

}

export default compose(
  withTranslations
)(Navigation);
