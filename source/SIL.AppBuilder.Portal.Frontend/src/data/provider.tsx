import * as React from 'react';
import { DataProvider } from 'react-orbitjs';

import { Source } from '@orbit/data';
import Store from '@orbit/store';

import Coordinator, { SyncStrategy } from '@orbit/coordinator';
import JSONAPISource from '@orbit/jsonapi';

import { api as apiEnv, app as appEnv } from '@env';
import { getToken } from '@lib/auth0';

import { schema } from './schema';

export default class APIProvider extends React.Component {
  dataStore: Store;
  coordinator: Coordinator;

  constructor(props) {
    super(props);

    this.dataStore = this.initDataStore();
  }

  initDataStore() {
    const inMemory = new Store({ schema, name: 'inMemory' });

    // if (!appEnv.hasApi) {
    //   // disable remote api use until we have an API to interface with
    //   return inMemory;
    // }

    const remote = new JSONAPISource({
      schema,
      name: 'remote',
      host: `${apiEnv.protocol}${apiEnv.host}/api`,
      defaultFetchHeaders: {
        Accept: 'application/vnd.api+json',
        Authorization: getToken()
      }
    });

    // We don't want to have to query the API everytime we want data
    this.coordinator = new Coordinator({
      sources: [inMemory, remote]
    });

    const backupRemoteSync = new SyncStrategy({
      source: 'remote',
      target: 'inMemory',
      blocking: true
    });

    this.coordinator.addStrategy(backupRemoteSync);
    this.coordinator.activate();


    // returning from the transform functions causes
    // the update call to wait on the request.
    // this will propagate errors up to the update invocation.
    inMemory.on('beforeUpdate', transform => remote.push(transform));

    return inMemory;
  }

  render() {
    return (
      <DataProvider dataStore={this.dataStore}>
        {this.props.children}
      </DataProvider>
    );
  }
}
