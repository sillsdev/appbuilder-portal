import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { query, buildFindRecord, buildOptions } from '@data';

import { TYPE_NAME as PROJECT } from '@data/models/project';
import { withLoader } from '@data/containers/with-loader';
import { withError } from '@data/containers/with-error';

const mapNetworkToProps = (passedProps) => {
  const { match } = passedProps;
  const {
    params: { id },
  } = match;

  return {
    cacheKey: `project-${id}`,
    project: [
      (q) => buildFindRecord(q, PROJECT, id),
      buildOptions({
        include: [
          'products.product-builds.product-artifacts',
          'products.user-tasks.user',
          // 'products.user-tasks.product.product-definition.workflow',
          'products.product-definition',
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
  };
};

const mapRecordsToProps = (passedProps) => {
  const { match } = passedProps;
  const {
    params: { id },
  } = match;

  return {
    project: (q) => buildFindRecord(q, PROJECT, id),
  };
};

export function withData(WrappedComponent) {
  return compose(
    query(mapNetworkToProps, { passthroughError: true }),
    withError('error', (props) => {
      return props.error;
    }),
    withLoader(({ project }) => !project),
    withOrbit(mapRecordsToProps)
  )(WrappedComponent);
}
