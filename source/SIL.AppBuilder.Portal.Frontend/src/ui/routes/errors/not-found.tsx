import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { withTranslations, i18nProps, useTranslations } from '@lib/i18n';

export const pathName = '/not-found';

export default function NotFoundRoute() {
  const { t } = useTranslations();

  return (
    <div className='ui text container'>
      <h1 className='ui header p-t-lg'>{t('errors.notFoundTitle')}</h1>
      <div className='content'>{t('errors.notFoundDescription')}</div>

      <hr className='m-t-md m-b-md' />

      <Link className='ui button' to={'/'}>
        Home
      </Link>
    </div>
  );
}
