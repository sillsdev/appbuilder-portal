import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { Container, Icon, Button } from 'semantic-ui-react';

import { uuid } from '@orbit/utils';
import { withData, WithDataProps } from 'react-orbitjs';

import { query, TASKS_TYPE } from '@data';
import { withStubbedDevData } from '@data/with-stubbed-dev-data';
import { TaskAttributes, TYPE_NAME as TASKS } from '@data/models/task';
import { withTranslations, i18nProps } from '@lib/i18n';
import { requireAuth } from '@lib/auth';
import { isEmpty } from '@lib/collection';
import { withLayout } from '@ui/components/layout';

import './tasks.scss';
import Row from './row';
import { ResourceObject } from 'jsonapi-typescript';

export const pathName = '/tasks';

export interface IOwnProps {
  tasks: ResourceObject<TASKS_TYPE, TaskAttributes>[];
}

export type IProps =
  & IOwnProps
  & WithDataProps
  & i18nProps;

// TODO: backend endpoint not implement
//       use query / mapNetwork when backend endpoint is implemented
const mapNetworkToProps = {
  tasks: q => q.findRecords(TASKS)
};

const mapRecordsToProps = (ownProps) => {
  return {
    tasks: q => q.findRecords(TASKS)
  };
};

class Tasks extends React.Component<IProps> {
  render() {
    const { tasks, t } = this.props;

    const cellClasses = 'd-xs-none d-md-table-cell';
    const cellSecondaryClasses = 'd-xs-none d-sm-table-cell';

    return (
      <Container className='tasks'>
        <h1 className='page-heading'>{t('tasks.title')}</h1>

        <table className='ui table unstackable'>
          <thead>
            <tr>
              <th>{t('tasks.project')}</th>
              <th className={cellSecondaryClasses}>{t('tasks.product')}</th>
              <th className={cellClasses}>{t('tasks.assignedTo')}</th>
              <th className={cellClasses}>{t('tasks.status')}</th>
              <th className={cellClasses}>{t('tasks.waitTime')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            { tasks && tasks.map(( task, i ) => (
              <Row key={i}
                cellClasses={cellClasses}
                cellSecondaryClasses={cellSecondaryClasses}
                task={task} />
            )) }

            { isEmpty(tasks) && (
              <tr>
                <td colSpan={6}>
                  <p>{t('tasks.noTasksDescription')}</p>
                </td>
              </tr>
            ) }
          </tbody>
        </table>
      </Container>
    );
  }
}


export default compose(
  withLayout,
  requireAuth,
  withStubbedDevData('user', 10, {
    givenName: 'Devin',
    familyName: 'Devmily',
  }),
  withStubbedDevData('task', 1, {
    status: 'pending',
    waitTime: 80000
   }, {
   project: {
     data: { id: 15, type: 'project' }
   },
   product: {
     data: { id: 10, type: 'product' }
   },
   assigned: {
     data: { id: 10, type: 'user' }
   }
  }),
  withStubbedDevData('project', 15, {
      name: 'dev project name',
      dateCreated: new Date(),
      language: 'en-US',
      type: 'Scripture App Builder',
      description: "NIV Bible",
    }, {
    tasks: {
      data: [{ id: 1, type: 'task' }]
    },
    products: {
      data: [{ id: 10, type: 'product' }]
    },
  }),
  withStubbedDevData('product', 10, {
      name: 'dev product name (android)'
    }, {
    tasks: {
      data: [{ id: 1, type: 'task' }]
    },
    project: {
      data: { id: 15, type: 'project' }
    },
  }),
  // query(mapNetworkToProps),
  withData(mapRecordsToProps),
  withTranslations
)(Tasks);
