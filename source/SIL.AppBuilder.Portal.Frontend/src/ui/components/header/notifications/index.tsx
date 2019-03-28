import { compose } from 'recompose';

import { query, withLoader, buildOptions } from '@data';

import Display from './display';

import './notification.scss';

export default compose(
  // initial loading of the notifications
  query(() => {
    return {
      notifications: [
        (q) => q.findRecords('notification').sort('-dateCreated', '-dateRead'),
        buildOptions(),
      ],
    };
  }),
  withLoader(({ notifications }) => !notifications)
)(Display);
