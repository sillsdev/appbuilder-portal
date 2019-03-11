import { compose } from 'recompose';

import { query, defaultOptions, withLoader } from '@data';

import Display from './display';

import './notification.scss';

export default compose(
  query({
    notifications: [
      (q) => q.findRecords('notification').sort('-dateCreated', '-dateRead'),
      { ...defaultOptions() },
    ],
  }),
  withLoader(({ notifications }) => !notifications)
)(Display);
