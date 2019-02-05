import { compose, withProps } from 'recompose';

import { withLoader, withError } from '@data';

import { withUserTaskList } from '@data/containers/resources/user-task';
import { withTranslations } from '@lib/i18n';
import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';

import './tasks.scss';
import Display from './display';

export default compose(
  withTranslations,
  requireAuth(),
  withLayout,
  withUserTaskList(),
  withError('error', ({ error }) => error),
  withLoader(({ userTasks }) => !userTasks)
)(Display);
