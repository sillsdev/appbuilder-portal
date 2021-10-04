import React, { useState } from 'react';
import { useTranslations } from '@lib/i18n';
import { Link } from 'react-router-dom';

import { useRouter } from '~/lib/hooks';

import FileSize from '@ui/components/labels/file-size';

import { RectLoader } from '~/ui/components/loaders';

export const pathName = '/downloads/apk/:id/published';

function isEmptyObject(obj) {
  for (var name in obj) {
    return false;
  }
  return true;
}

export default function DownloadApk() {
  const { t } = useTranslations();
  const { match } = useRouter();
  const {
    params: { id },
  } = match;
  const [attributes, setAttributes] = useState(new Map());
  const [lang, setLang] = useState('');

  grabDetails();
  async function grabDetails() {
    const resp = await fetch(`/api/products/${id}/published`);
    const json = await resp.json();
    setLang(json.data.attributes['default-language']);
    setAttributes(json.data.attributes);
  }

  return (
    <div className='flex flex-column h-100 align-items-center justify-content-center'>
      {isEmptyObject(attributes) ? (
        <RectLoader />
      ) : (
        <div className='flex flex-column h-100 align-items-center justify-content-center'>
          <img src={attributes['icon']} style={{ maxHeight: '128px', maxWidth: '128px' }} />

          <h3>{attributes.titles[lang]}</h3>
          <p className='text-center w-70'>{attributes.descriptions[lang]}</p>

          <FileSize size={attributes['size']} className='m-t-md m-b-lg' />

          <Link
            to={attributes['link']}
            download
            target='_blank'
            className='ui button'
            style={{ backgroundColor: attributes.color }}
          >
            APK
          </Link>
        </div>
      )}
    </div>
  );
}
