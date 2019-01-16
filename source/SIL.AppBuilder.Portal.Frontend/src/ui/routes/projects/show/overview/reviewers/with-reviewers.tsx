import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { buildFindRelatedRecords } from '@data';

import { withError } from '@data/containers/with-error';

export function withReviewers(WrappedComponent) {
  function mapRecordsToProps(passedProps) {
    const { project } = passedProps;

    return {
      reviewers: (q) => buildFindRelatedRecords(q, project, 'reviewers'),
    };
  }

  return compose(
    withError('error', ({ error }) => error),
    withOrbit(mapRecordsToProps)
  )(WrappedComponent);
}
