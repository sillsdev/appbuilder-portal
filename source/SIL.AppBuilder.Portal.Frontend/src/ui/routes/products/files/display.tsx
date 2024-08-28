import * as React from 'react';
import { useTranslations } from '@lib/i18n';
import ProductArtifact from '@ui/components/product-artifact';
import { ProductResource } from '@data';

import { useRouter } from '~/lib/hooks';

import './styles.scss';

export interface Params {
  id: string;
}

interface QueriedProps {
  project: ProductResource;
}

type IProps = QueriedProps;

export default function FilesDisplay({ product }: IProps) {
  const { t } = useTranslations();
  const { match } = useRouter();
  const {
    params: { id },
  } = match;

  return (
    <div data-test-product-files className='ui container files'>
      <h1 className='page-heading'>{t('products.files.title')}</h1>

      <div className='flex flex-column'>
        <ProductArtifact key={id} product={product} />
      </div>
    </div>
  );
}
