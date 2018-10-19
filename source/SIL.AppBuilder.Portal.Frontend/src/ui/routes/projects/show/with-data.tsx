import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import {
  query, buildFindRecord, buildOptions
} from '@data';

import { TYPE_NAME as PROJECT } from '@data/models/project';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { TYPE_NAME as GROUP } from '@data/models/group';
import { PLURAL_NAME as REVIEWERS } from '@data/models/reviewer';

import { withLoader } from '@data/containers/with-loader';
import { withError } from '@data/containers/with-error';

const mapNetworkToProps = (passedProps) => {
  const { match } = passedProps;
  const { params: { id } } = match;

  return {
    cacheKey: `project-${id}`,
    project: [q => buildFindRecord(q, PROJECT, id), buildOptions({
      include: ['products', 'organization.organization-product-definitions.product-definition', GROUP, 'owner', REVIEWERS, 'type']
    })]
  };
};

const mapRecordsToProps = (passedProps) => {
  const { match } = passedProps;
  const { params: { id } } = match;

  return {
    project: q => buildFindRecord(q, PROJECT, id ),
  };
};


export function withData(WrappedComponent) {
  return compose(
    query(mapNetworkToProps, { passthroughError: true }),
    withError('error', ({ error }) => error),
    withLoader(({ project }) => !project),
    withOrbit(mapRecordsToProps)
  )(WrappedComponent);
}
