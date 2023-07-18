import * as React from 'react';
import { useTranslations } from '@lib/i18n';

import { useRouter } from '~/lib/hooks';

export interface Params {
  id: string;
}

export default function FilesShowDisplay() {
  const { t } = useTranslations();
  const { match } = useRouter();
  const {
    params: { id },
  } = match;

  return (
    <div className='flex flex-column h-100 align-items-center justify-content-center'>{id}</div>
  );
}
