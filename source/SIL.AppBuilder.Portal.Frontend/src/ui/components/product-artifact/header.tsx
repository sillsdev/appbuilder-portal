import * as React from 'react';
import { titleize } from 'inflected';
import Down from '@material-ui/icons/ArrowDropDown';
import Up from '@material-ui/icons/ArrowDropUp';
import ProductIcon from '@ui/components/product-icon';
import { attributesFor } from '@data';
import { useTranslations } from '@lib/i18n';

import Actions from './actions';

function humanReadableName(productDefinition) {
  const { name } = attributesFor(productDefinition);

  return titleize(name);
}

export default function Header({ product, productDefinition, artifacts, isCollapsed, onClick }) {
  const { t } = useTranslations();

  return (
    <div
      data-test-artifact-header
      role='button'
      onClick={onClick}
      className='header flex align-items-center p-md bold justify-content-space-between'
    >
      <span className='flex align-items-center'>
        <ProductIcon product={productDefinition} selected={true} />
        <span data-test-project-files-product-name className='m-l-sm'>
          {humanReadableName(productDefinition)}
        </span>
      </span>
      <span data-test-count className='flex align-items-center'>
        {t('project.products.numArtifacts', { amount: artifacts.length })}

        {isCollapsed ? <Up /> : <Down />}
        <Actions product={product} />
      </span>
    </div>
  );
}
