import * as React from 'react';
import { withTranslations, i18nProps } from '@lib/i18n';

export default withTranslations(
  React.memo(({ t }: i18nProps) => {
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
  })
);
