import * as React from 'react';
import { useTranslations } from '@lib/i18n';
import { withLayout } from '@ui/components/layout';

import Navigation from './navigation';

function AdminLayout({ children }) {
  const { t } = useTranslations();

  return (
    <div className='ui container'>
      <h2 className='page-heading page-heading-border-sm'>{t('admin.settings.title')}</h2>
      <div className='flex-column-xs flex-row-sm align-items-start-sm'>
        <Navigation />

        <div className='m-l-lg flex-grow'>{children}</div>
      </div>
    </div>
  );
}

const ComposeAdminLayout = withLayout(AdminLayout);

export const withAdminLayout = (Component) => (props) => (
  <ComposeAdminLayout>
    <Component {...props} />
  </ComposeAdminLayout>
);
