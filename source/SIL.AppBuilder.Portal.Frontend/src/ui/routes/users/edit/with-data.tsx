import { compose } from 'recompose';
import { match as Match } from 'react-router';
import { query, defaultOptions, buildFindRecord, withLoader } from '@data';
import { TYPE_NAME as USER } from '@data/models/user';

export interface Params {
  id: string;
}

interface PassedProps {
  match: Match<Params>;
}

export function withData(WrappedComponent) {
  const mapNetworkToProps = (passedProps: PassedProps) => {
    const { match } = passedProps;
    const {
      params: { id },
    } = match;

    return {
      cacheKey: [id],
      user: [(q) => buildFindRecord(q, USER, id), defaultOptions()],
    };
  };

  return compose(
    query(mapNetworkToProps),
    withLoader(({ user }) => !user)
  )(WrappedComponent);
}
