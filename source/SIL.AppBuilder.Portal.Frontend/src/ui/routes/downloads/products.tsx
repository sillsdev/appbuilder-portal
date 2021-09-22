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
      <h4 className='ui header p-t-lg uppercase'>{t('project.productFiles')}</h4>

      <div className='content flex'>
        <Link to={url} download target='_blank' className='flex flex-60'>
          {type.toUpperCase()}
        </Link>

        <FileSize size={size} className='flex flex-40' />
      </div>
    </div>
  );
}
