import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { buildFindRelatedRecords } from '@data';

import { withError } from '@data/containers/with-error';

export function withAuthors(WrappedComponent) {
  function mapRecordsToProps(passedProps) {
    const { project } = passedProps;

    return {
      authors: (q) => buildFindRelatedRecords(q, project, 'authors'),
    };
  }

  return compose(
    withError('error', ({ error }) => error),
    withOrbit(mapRecordsToProps)
  )(WrappedComponent);
}
