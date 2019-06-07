import * as React from 'react';
import { titleize } from 'inflected';

import { attributesFor } from '@data';

import { useTranslations } from '@lib/i18n';

function humanReadableName(productDefinition) {
  const { name } = attributesFor(productDefinition);

  return titleize(name);
}

export default function Header() {
  const { t } = useTranslations();

  return (
    <div
      data-test-product-publication-header
      className='header fs-12 bold light-gray-text flex align-items-center p-l-md p-t-sm p-b-none p-r-md justify-content-space-between'
    >
      <div data-test-product-publication-hdr-channel className='flex-100 align-items-center'>
        {t('project.products.publications.channel')}
      </div>
      <div data-test-product-publication-hdr-status className='flex-100 align-items-center'>
        {t('project.products.publications.status')}
      </div>
      <div data-test-product-publication-hdr-date className='flex-100 align-items-center'>
        {t('project.products.publications.date')}
      </div>
      <div data-test-product-publication-hdr-url className='flex-100 align-items-center'>
        {t('project.products.publications.url')}
      </div>
    </div>
  );
}
