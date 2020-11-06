import React from 'react';
import { useQuery } from 'react-orbitjs';

import { buildFindRecord, buildOptions } from '@data';

import { PageLoader } from '~/ui/components/loaders';

import { PageError } from '~/ui/components/errors';

import { useRouter } from '~/lib/hooks';

export function withData(WrappedComponent) {
  return function ProjectDataFetcher(props) {
    const { match } = useRouter();
    const {
      params: { id },
    } = match;

    const {
      isLoading,
      error,
      result: { project },
    } = useQuery({
      project: [
        (q) => buildFindRecord(q, 'project', id),
        buildOptions({
          include: [
            'products.product-builds.product-artifacts',
            'products.product-builds.product-publications',
            'products.user-tasks.user',
            // 'products.user-tasks.product.product-definition.workflow',
            'products.product-definition',
            'products.store',
            // 'products.product-workflow',
            'organization.organization-product-definitions.product-definition.workflow.store-type',
            'group',
            'owner.group-memberships.group',
            'owner.organization-memberships.organization',
            'reviewers',
            'type',
          ],
        }),
      ],
    });

    if (error) return <PageError error={error} />;
    if (isLoading || !project) return <PageLoader />;

    return <WrappedComponent {...props} {...{ project }} />;
  };
}
