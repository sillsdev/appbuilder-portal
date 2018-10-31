import { compose } from 'recompose';

import { withData } from 'react-orbitjs';

import { TYPE_NAME as TASKS } from '@data/models/task';
import { withTranslations } from '@lib/i18n';
import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';

import './tasks.scss';
import Display from './display';

export const pathName = '/tasks';

const mapRecordsToProps = () => {
  return {
    tasks: q => q.findRecords(TASKS)
  };
};

export default compose(
  withLayout,
  requireAuth,
  // query(mapNetworkToProps),
  withData(mapRecordsToProps),
  withTranslations
)(Display);
