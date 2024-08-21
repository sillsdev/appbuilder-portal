import React, { useState } from 'react';
import { useTranslations } from '@lib/i18n';
import { Link } from 'react-router-dom';
import FileSize from '@ui/components/labels/file-size';

import { useRouter } from '~/lib/hooks';
import { RectLoader } from '~/ui/components/loaders';

export const pathName = '/downloads/apk/:id/published';

function isEmptyObject(obj) {
  for (var name in obj) {
    return false;
  }
  return true;
}

function downloadLinkText(attributes, lang) {
  const langOnlyNoVariant = lang.substring(0, 2);
  const strings = attributes['download-apk-strings'];
  return strings[langOnlyNoVariant] || strings['en'];
}

export default function DownloadApk() {
  const { t } = useTranslations();
  const { match } = useRouter();
  const {
    params: { id },
  } = match;
  const [state, setStateValues] = useState({
    lang: window.navigator.language,
    attributes: new Map(),
  });

  grabDetails();
  async function grabDetails() {
    if (isEmptyObject(state.attributes)) {
      const resp = await fetch(`/api/products/${id}/published`);
      const json = await resp.json();

      const languages = json.data.attributes['languages'];
      let language = state.lang;
      if (!languages.includes(language)) {
        language = json.data.attributes['default-language'];
      }
      setStateValues({ lang: language, attributes: json.data.attributes });
    }
  }

  return (
    <div className='flex flex-column h-100 align-items-center justify-content-center'>
      {isEmptyObject(state.attributes) ? (
        <RectLoader />
      ) : (
        <div className='flex flex-column h-100 align-items-center justify-content-center'>
          <img src={state.attributes['icon']} style={{ maxHeight: '128px', maxWidth: '128px' }} />

          <h3>{state.attributes.titles[state.lang]}</h3>
          <p className='text-center w-70'>{state.attributes.descriptions[state.lang]}</p>

          <FileSize size={state.attributes['size']} className='m-t-md m-b-lg' />

          <Link
            to={state.attributes['link']}
            download
            target='_blank'
            className='ui button'
            style={{ backgroundColor: state.attributes.color }}
          >
            {downloadLinkText(state.attributes, state.lang)}
          </Link>
        </div>
      )}
    </div>
  );
}
