import { compose } from 'recompose';
import { withLoader, withError } from '@data';
import { withUserTaskList } from '@data/containers/resources/user-task';

import './tasks.scss';
import Display from './display';

export default compose(
  withUserTaskList(),
  withError('error', ({ error }) => error),
  withLoader(({ userTasks }) => !userTasks)
)(Display);
