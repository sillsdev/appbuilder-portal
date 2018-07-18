import * as React from 'react';
import { compose } from 'recompose';

import { requireAuth } from '@lib/auth';
import { withData, WithDataProps } from 'react-orbitjs';
import { Container, Table, Icon, Button } from 'semantic-ui-react';
import { withStubbedDevData } from '@data/with-stubbed-dev-data';
import { TYPE_NAME as TYPE_USER, UserAttributes } from '@data/models/user';
import { TYPE_NAME as TYPE_GROUP, GroupAttributes } from '@data/models/group';
import { TYPE_NAME as TYPE_ROLE, RoleAttributes } from '@data/models/role';

import { Link } from 'react-router-dom';

export const pathName = '/users';

export interface IProps {
  users: JSONAPI<UserAttributes>[];
  groups: JSONAPI<GroupAttributes>[];
  role: JSONAPI<RoleAttributes>;
}

class UserDashboard extends React.Component<IProps & WithDataProps> {

  generateRandomGroups = async () => {

    const { groups, updateStore } = this.props;

    if (groups && groups.length === 0) {
      await updateStore(t => [
        t.addRecord({
          type: TYPE_GROUP,
          id: 'group-1',
          attributes: { name: 'North America'}
        }),
        t.addRecord({
          type: TYPE_GROUP,
          id: 'group-2',
          attributes: { name: 'Central Asia'}
        }),
        t.addRecord({
          type: TYPE_GROUP,
          id: 'group-3',
          attributes: { name: 'East Asia'}
        }),
        t.addRecord({
          type: TYPE_GROUP,
          id: 'group-4',
          attributes: { name: 'South America'}
        })
      ], { devOnly: true })
    }
  }

  generateRandomRole = async () => {

    const { role, updateStore } = this.props;

    if (!role) {
      updateStore(t => t.addRecord({
        type: TYPE_ROLE,
        id: 'role-1',
        attributes: { name: 'Builder' }
      }), { devOnly: true })
    }
  }

  generateRandomUsers = async () => {

    const { groups, updateStore } = this.props;

    const user = await updateStore(t =>
      t.addRecord({
        type: TYPE_USER,
        id: 'user-1',
        attributes: {
          firstName: 'Fake',
          lastName: 'Name',
          email: 'fake@dt.com'
        }
      })
      , { devOnly: true}
    );

    await updateStore(t => t.replaceRelatedRecords(
      { type: TYPE_USER, id: user.id },
      'groups',
      [{ type: TYPE_GROUP, id: 'group-1' }, { type: TYPE_GROUP, id: 'group-2' }]
    ), { devOnly: true });

    await updateStore(t => t.replaceRelatedRecord(
      { type: TYPE_USER, id: user.id },
      'role',
      { type: TYPE_ROLE, id: 'role-1' }
    ), { devOnly: true });

  }

  componentWillMount() {
    this.generateRandomGroups();
    this.generateRandomRole();
    this.generateRandomUsers();
  }


  render() {

    const { users, groups } = this.props;

    console.log(users);

    return (
      <div className='ui container'>
        <div className='flex justify-content-space-between'>
          <h1 className='page-heading'>Manage Users</h1>
          <div className='flex align-items-center'>
            <div className='ui left icon input'>
              <input type="text" placeholder="Search..."/>
                <i className='search icon'/>
            </div>
          </div>
        </div>
        {
          users ?
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Role</Table.HeaderCell>
                <Table.HeaderCell>Groups</Table.HeaderCell>
                <Table.HeaderCell>Disabled</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
            {
              users.map((user, index) => {
                const { firstName, lastName } = user.attributes;
                const role = user.relationships['role'].data || {};

                return (
                  <Table.Row key={index}>
                    <Table.Cell>
                      <Link to={'/projects'}>{`${firstName} ${lastName}`}</Link>
                    </Table.Cell>
                    <Table.Cell>
                      {`${role.name}`}
                    </Table.Cell>
                    <Table.Cell>
                      {`${role.name}`}
                    </Table.Cell>
                    <Table.Cell>
                      Dropdown
                    </Table.Cell>
                    <Table.Cell>
                      Disabled
                    </Table.Cell>
                  </Table.Row>
                )
              })
            }
            </Table.Body>
          </Table> :
          <div className='flex justify-content-center'>
            <h3>No user found.</h3>
          </div>
        }
      </div>
    );

  }

}

const mapRecordsToProps = (ownProps) => {
  return {
    users: q => q.findRecords(TYPE_USER),
    groups: q => q.findRecords(TYPE_GROUP)
  };
};

export default compose(
  requireAuth,
  withData(mapRecordsToProps)
)(UserDashboard);