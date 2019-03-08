import { compose, withProps } from 'recompose';

import { withLoader, withError } from '@data';

import { withUserTaskList } from '@data/containers/resources/user-task';
import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';

import './tasks.scss';
import Display from './display';

export default compose(
  requireAuth(),
  withLayout,
  withUserTaskList(),
  withError('error', ({ error }) => error),
  withLoader(({ userTasks }) => !userTasks)
)(Display);
