import * as React from 'react';
import { ProductResource, idFromRecordIdentity } from '@data';
import LaunchIcon from '@material-ui/icons/Launch';

interface IOwnProps {
  product: ProductResource;
  name: string;
}

export default function ProductLink({ product, name }) {
  const downloadLinkMap = {
    android: (productId) => (
      <a
        data-test-product-apklink
        className='m-l-sm'
        href={`/api/products/${productId}/files/published/apk`}
        target='_blank'
      >
        <LaunchIcon />
      </a>
    ),
    asset: (productId) => (
      <a
        data-test-product-apklink
        className='m-l-sm'
        href={`/api/products/${productId}/files/published/asset-package`}
        target='_blank'
      >
        <LaunchIcon />
      </a>
    ),
    html: () => <div />,
    [undefined]: () => <div />,
  };
  const lowerName = name && name.toLowerCase();
  const closestKey = Object.keys(downloadLinkMap).find(
    (key) => lowerName && lowerName.includes(key)
  );
  const productId = idFromRecordIdentity(product as any);
  return downloadLinkMap[closestKey](productId);
}
