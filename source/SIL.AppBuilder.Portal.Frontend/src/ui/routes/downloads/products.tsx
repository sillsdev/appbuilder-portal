import React, { useState } from 'react';
import { useTranslations } from '@lib/i18n';
import { Link } from 'react-router-dom';

import { useRouter } from '~/lib/hooks';

import FileSize from '@ui/components/labels/file-size';

export const pathName = '/downloads/products/:id/files/published/:type';

export default function DownloadProducts() {
  const { t } = useTranslations();
  const { match } = useRouter();
  const {
    params: { id, type },
  } = match;
  const url = `/api/products/${id}/files/published/${type}`;
  const [size, setSize] = useState(0);

  grabSize();
  async function grabSize() {
    const resp = await fetch(url, { method: 'HEAD' });
    setSize(parseInt(resp.headers.get('content-length')));
  }

  return (
    <div className='ui text container'>
      <h3 className='ui header p-t-lg'>{t('downloads.title')}</h3>

      <div className='content flex'>
        <Link to={url} download target='_blank' className='flex-50'>
          {type.toUpperCase()}
        </Link>

        <FileSize size={size} className='flex-50' />
      </div>
    </div>
  );
}
