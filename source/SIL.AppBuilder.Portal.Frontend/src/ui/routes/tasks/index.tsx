import * as React from 'react';
import { compose } from 'recompose';

import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';
import { withData, WithDataProps } from 'react-orbitjs';
import { Container, Table, Icon, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import { TaskAttributes, TYPE_NAME } from '@data/models/task';

export const pathName = '/tasks';

import './tasks.scss';
import { uuid } from '@orbit/utils';

const prettyMS = require('pretty-ms');

interface Task {
  type: string;
  id: string;
  attributes: TaskAttributes;
}

export interface IOwnProps {
  tasks: Task[];
}
export type IProps =
  & IOwnProps
  & WithDataProps
  & i18nProps;

class Tasks extends React.Component<IProps> {

  state = { data: {}, errors: {} };

  // TODO: Remove this method when we collect tasks from the backend
  generateRandomTaks = async () => {

    const products = ['Android APK w/Embedded Audio','HTML website'];
    const status = ['Awaiting Approval','Send / Recieve', 'App Store Preview'];

    await this.props.updateStore(t => t.addRecord({
      type: TYPE_NAME,
      id: uuid(),
      attributes: {
        project: { name: 'Example Bible' },
        product: { name: products[Math.floor(Math.random() * (2))] },
        status: status[Math.floor(Math.random() * (3))],
        waitTime: Math.floor(Math.random() * (1296001))
      }
    }), { devOnly: true });
  }

  componentWillMount() {
    this.generateRandomTaks();
  }

  productIcon = (productName) => {

    const icons = [{id: 'android', icon:'android'},{id:'html', icon: 'file code'}];

    if (icons.length > 0) {
      const productIcon = icons.find(icon => productName.toLowerCase().includes(icon.id));

      return <Icon className={productIcon.icon} />;
    }

    return null;
  }

  render() {

    const { tasks, t } = this.props;

    return (
      <Container className='tasks'>
        <h1 className='page-heading'>{t('tasks.title')}</h1>
        {
          tasks ?
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t('tasks.project')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('tasks.product')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('tasks.assignedTo')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('tasks.status')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('tasks.waitTime')}</Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {tasks.map((task,index) => {

                  const { project, product, status, waitTime, user } = task.attributes;
                  // TODO: I don't think the user will be in the attributes.
                  //       maybe will need to pull out of relationships and query orbit
                  //       to get the related user
                  //       OR, the backend gives us the person's name directly, and
                  //       we don't worry about a relationship.
                  const claimedBy = user ? `${user.firstName} ${user.lastName}` : t('tasks.unclaimed');

                  return (
                    <Table.Row key={index}>
                      <Table.Cell>
                        <Link to={'/projects'}>{project.name}</Link>
                      </Table.Cell>
                      <Table.Cell>
                        { this.productIcon(product.name) }
                        <span>{product.name}</span>
                      </Table.Cell>
                      <Table.Cell>{claimedBy}</Table.Cell>
                      <Table.Cell className='red'>{status}</Table.Cell>
                      <Table.Cell>
                        <span>{prettyMS(waitTime, { secDecimalDigits: 0 })}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <Button>{t('tasks.reassign')}</Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table> :

            <div className='empty-table'>
              <h3>{t('tasks.noTasksTitle')}</h3>
              <p>{t('tasks.noTasksDescription')}</p>
            </div>
        }
      </Container>
    );
  }
}

const mapRecordsToProps = (ownProps) => {
  return {
    tasks: q => q.findRecords(TYPE_NAME)
  };
};

export default compose(
  withLayout,
  requireAuth,
  withData(mapRecordsToProps),
  translate('translations')
)(Tasks);
