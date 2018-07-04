import * as React from 'react';
import Layout from '@ui/components/layout';
import { Container, Table, Icon, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export const pathName = '/tasks';

class Tasks extends React.Component {

  state = { data: {}, errors: {} };

  render() {
    return (
      <Container>
        <h1>My Tasks</h1>
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
            <Table.Row>
              <Table.Cell>
                <Link to='task/1'>Example Bible</Link>
              </Table.Cell>
              <Table.Cell>
                <Icon name='android' />
                <span>Android APK w/ Streaming Audio</span>
              </Table.Cell>
              <Table.Cell>Me</Table.Cell>
              <Table.Cell className='red'>App Store Preview</Table.Cell>
              <Table.Cell>
                <span>15 days</span>
              </Table.Cell>
              <Table.Cell>
                <Button>reasign</Button>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <Link to='task/1'>Example Bible</Link>
              </Table.Cell>
              <Table.Cell>
                <Icon name='android' />
                <span>Android APK w/ Streaming Audio</span>
              </Table.Cell>
              <Table.Cell>Me</Table.Cell>
              <Table.Cell className='red'>App Store Preview</Table.Cell>
              <Table.Cell>
                <span>15 days</span>
              </Table.Cell>
              <Table.Cell>
                <Button>reasign</Button>
              </Table.Cell>
            </Table.Row>            
          </Table.Body>
        </Table>
      </Container>
    );
  }
}

export default Tasks;
