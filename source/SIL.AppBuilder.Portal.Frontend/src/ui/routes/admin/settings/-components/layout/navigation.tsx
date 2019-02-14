import * as React from 'react';
import ResponsiveNav from '@ui/components/semantic-extensions/responsive-sub-navigation';
import { useTranslations } from '@lib/i18n';
import { paths as adminPaths } from '@ui/routes/admin/paths';

const paths = adminPaths.settings;

export default function Navigation() {
  const { t } = useTranslations();

  return (
    <ResponsiveNav
      items={[
        {
          to: paths.organizations.path(),
          text: t('admin.settings.navigation.organizations'),
        },
        {
          to: paths.workflowDefinitions.path(),
          text: t('admin.settings.navigation.workflowdefinitions'),
        },
        {
          to: paths.productDefinitions.path(),
          text: t('admin.settings.navigation.productDefinitions'),
        },
        {
          to: paths.stores.path(),
          text: t('admin.settings.navigation.stores'),
        },
        {
          to: paths.storeTypes.path(),
          text: t('admin.settings.navigation.storeTypes'),
        },
      ]}
      exactRoutes={false}
    />
  );
}
