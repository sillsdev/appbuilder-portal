import React = require("react");
import { WithDataProps } from "react-orbitjs";

import { TaskResource } from "@data";
import { isEmpty } from "@lib/collection";
import { i18nProps } from '@lib/i18n';

import Row from "./row";

export interface IOwnProps {
  tasks: TaskResource[];
}

export type IProps =
  & IOwnProps
  & WithDataProps
  & i18nProps;

export default class Display extends React.Component<IProps> {
  state = { data: {}, errors: {} };
  render() {
    const { tasks, t } = this.props;

    const cellClasses = 'd-xs-none d-md-table-cell';
    const cellSecondaryClasses = 'd-xs-none d-sm-table-cell flex align-items-center';

    return (
      <div className='ui container tasks'>
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
      </div>
    );
  }
}
