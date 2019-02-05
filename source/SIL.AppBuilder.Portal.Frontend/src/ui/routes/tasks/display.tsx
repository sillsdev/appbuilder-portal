import * as React from 'react';
import { WithDataProps } from 'react-orbitjs';
import { IUserTaskListProps } from '@data/containers/resources/user-task';
import { isEmpty } from '@lib/collection';
import { i18nProps } from '@lib/i18n';

import Row from './row';

export interface IOwnProps {}

export type IProps = IOwnProps & IUserTaskListProps & WithDataProps & i18nProps;

export default class Display extends React.Component<IProps> {
  state = { data: {}, errors: {} };
  render() {
    const { userTasks, t } = this.props;

    const cellClasses = 'd-xs-none d-md-table-cell';
    const cellSecondaryClasses = 'd-xs-none d-sm-table-cell flex align-items-center';

    return (
      <div data-test-tasks className='ui container tasks'>
        <h1 className='page-heading'>{t('tasks.title')}</h1>

        <table data-test-tasks-table className='ui table unstackable'>
          <thead>
            <tr>
              <th className={cellSecondaryClasses}>{t('tasks.product')}</th>
              <th>{t('tasks.project')}</th>
              <th className={cellClasses}>{t('tasks.waitTime')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {userTasks && userTasks.map((task) => <Row key={task.id} userTask={task} />)}

            {isEmpty(userTasks) && (
              <tr>
                <td colSpan={5}>{t('tasks.noTasksDescription')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}
