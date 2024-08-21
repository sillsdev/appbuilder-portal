import React from 'react';
import { useQuery, useCache } from 'react-orbitjs';
import { buildFindRecord, buildOptions } from '@data';

import { useRouter } from '~/lib/hooks';
import { keyMap } from '~/data/schema';
import { PageLoader } from '~/ui/components/loaders';
import { PageError } from '~/ui/components/errors';

export function withData(WrappedComponent) {
  return function ProductDataFetcher(props) {
    const { match } = useRouter();
    const {
      params: { id },
    } = match;

    const {
      isLoading,
      error,
      result: { product },
    } = useQuery({
      product: [
        (q) => buildFindRecord(q, 'product', id),
        buildOptions({
          include: [
            'product-builds.product-artifacts',
            'product-builds.product-publications',
            'product-definition',
          ],
        }),
      ],
    });

    useCache({
      ...(product && {
        product: (q) =>
          q.findRecord({
            type: 'product',
            id: keyMap.keyToId('product', 'remoteId', id),
          }),
      }),
    });

    if (error) return <PageError error={error} />;
    if (isLoading || !product) return <PageLoader />;

    return <WrappedComponent {...props} {...{ product }} />;
  };
}
