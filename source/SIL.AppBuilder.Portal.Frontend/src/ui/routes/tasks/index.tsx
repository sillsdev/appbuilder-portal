import { compose, withProps } from 'recompose';

import { withData } from 'react-orbitjs';

import { withLoader } from '@data';
import { withUserTaskList } from '@data/containers/resources/user-task';
import { withTranslations } from '@lib/i18n';
import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';

import './tasks.scss';
import Display from './display';

export const pathName = '/tasks';

export default compose(
  withTranslations,
  withLayout,
  requireAuth,
  withUserTaskList(),
  withLoader(({ userTasks }) => !userTasks),
  withProps(({ userTasks }) => ({
    userTasks: userTasks.filter(ut => ut),
  })),
)(Display);
