import * as React from 'react';
import { compose } from 'recompose';

import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';
import { withData, WithDataProps } from 'react-orbitjs';
import { Container, Table, Icon, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { TaskAttributes, TYPE_NAME } from '@data/models/task';

export const pathName = '/tasks';

import './tasks.scss';
import { uuid } from '@orbit/utils';

const prettyMS = require('pretty-ms');

interface Task {
  type: string,
  id: string,
  attributes: TaskAttributes
}

export interface IOwnProps {
  tasks: Task[]
}
export type IProps =
  & IOwnProps
  & WithDataProps

class Tasks extends React.Component<IProps> {

  state = { data: {}, errors: {} };

  //TODO: Remove this method when we collect tasks from the backend
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
    }));
  }

  componentWillMount() {
    this.generateRandomTaks();
  }

  productIcon = (productName) => {

    const icons = [{id: 'android', icon:'android'},{id:'html', icon: 'file code'}];

    for (let i=0; i < icons.length; i++) {
      if (productName.toLowerCase().includes(icons[0].id)) {
        return <Icon className={icons[0].icon}/>
      }
    }

    return null;
  }

  render() {

    const { tasks } = this.props;

    return (
      <Container className='tasks'>
        <h1 className='page-heading'>My Tasks</h1>
        {
          tasks ?
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Project</Table.HeaderCell>
                  <Table.HeaderCell>Product</Table.HeaderCell>
                  <Table.HeaderCell>Assigned To</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Wait Time</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {tasks.map((task,index) => {

                  const { project, product, status, waitTime, user } = task.attributes;

                  return (
                    <Table.Row key={index}>
                      <Table.Cell>
                        <Link to={'/projects'}>{project.name}</Link>
                      </Table.Cell>
                      <Table.Cell>
                        { this.productIcon(product.name) }
                        <span>{product.name}</span>
                      </Table.Cell>
                      <Table.Cell>{user ? `${user.name}` : '[unclaimed]'}</Table.Cell>
                      <Table.Cell className='red'>{status}</Table.Cell>
                      <Table.Cell>
                        <span>{prettyMS(waitTime, { secDecimalDigits: 0 })}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <Button>REASSIGN</Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table> :
            <div className='empty-table'>
              <h3>No tasks are assigned to you.</h3>
              <p>Tasks that require your attention will appear here.</p>
            </div>
        }
      </Container>
    );
  }
}

const mapRecordsToProps = (ownProps) => {
  return {
    tasks: q => q.findRecords(TYPE_NAME)
  }
}

export default compose(
  withLayout,
  requireAuth,
  withData(mapRecordsToProps)
)(Tasks);
