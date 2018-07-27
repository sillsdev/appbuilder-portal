import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { TYPE_NAME as USER } from '@data/models/project';
import { TYPE_NAME as GROUP } from '@data/models/group';

import { compose } from 'recompose';

function isEmpty(data) {
  return (!data || (Array.isArray(data) && data.length === 0));
}

function mapRecordsToProps() {
  return {
    fromCache: q => q.findRecords(USER)
  };
}

export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<WithDataProps> {

    state = {
      usersFromNetwork: null,
      groupsFromNetwork: null
    };

    fetchUserData = async () => {

      // TODO: remove this when we get real data....
      const fakes = [{
        id: 1,
        type: USER,
        attributes: {
          firstName: 'Fake',
          lastName: 'Name',
          email: 'fake@dt.com',
          role: { id: 'role-1', name: 'Builder' }, // this isn't how JSONAPI works, but we need a working API :)
          groups: [{ id: 'group-1', name: 'North America' }, { id: 'group-2', name: 'Central Asia' }, { id: 'group-3', name: 'East Asia'}] // need a working API
        }
      }, {
        id: 2,
        type: USER,
        attributes: {
          firstName: 'Fake 2',
          lastName: 'Name 2',
          email: 'fake2@dt.com',
          role: { id:'role-2', name: 'Organization Administrator' }, // need a working API
          groups: [{ id: 'group-1', name: 'North America' }], // need a working API
        }
      }];

      return this.setState({ usersFromNetwork: fakes });

    }

    fetchGroupData = async () => {

      const fakes = [{
        type: GROUP,
        id: 'group-1',
        attributes: { name: 'North America' }
      },{
        type: GROUP,
        id: 'group-2',
        attributes: { name: 'Central Asia' }
      },{
        type: GROUP,
        id: 'group-3',
        attributes: { name: 'East Asia' }
      }];

      return this.setState({ groupsFromNetwork: fakes });

    }

    componentWillMount() {

      const { usersFromNetwork, groupsFromNetwork } = this.state;

      if (isEmpty(usersFromNetwork)) {
        this.fetchUserData();
      }

      if (isEmpty(groupsFromNetwork)) {
        this.fetchGroupData();
      }
    }

    render() {

      const { usersFromNetwork, groupsFromNetwork } = this.state;

      const dataProps = {
        users: usersFromNetwork,
        groups: groupsFromNetwork,
        isUsersLoading: isEmpty(usersFromNetwork),
        isGroupsLoading: isEmpty(groupsFromNetwork)
      };

      return (
        <WrappedComponent
          {...dataProps}
          {...this.props}
        />
      );
    }
  }

  return compose(
    withOrbit(mapRecordsToProps)
  )(DataWrapper);
}
