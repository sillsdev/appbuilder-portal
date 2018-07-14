import { Bucket } from '@orbit/core';
import Orbit, { Source } from '@orbit/data';
import Store from '@orbit/store';

import LocalStorageBucket from '@orbit/local-storage-bucket';
import IndexedDBBucket, { supportsIndexedDB } from '@orbit/indexeddb-bucket';
import Coordinator, { SyncStrategy, RequestStrategy } from '@orbit/coordinator';
import JSONAPISource, { JSONAPISerializer } from '@orbit/jsonapi';
import IndexedDBSource from '@orbit/indexeddb';


import { api as apiEnv, app as appEnv } from '@env';

import { schema, keyMap } from './schema';
import { defaultHeaders } from '@lib/fetch';

const BucketClass = (supportsIndexedDB ? IndexedDBBucket : LocalStorageBucket);

class CustomJSONAPISerializer extends JSONAPISerializer {
  deserializeAttribute(record: any, attr: string, value: any) {
    console.log(record, attr, value);
    if (attr === 'auth0Id') {
      record.keys = { auth0Id: value };
    }

    return record;
  }
}

export async function createStore() {
  console.debug('Setting up datastore');

  const bucket = new BucketClass({ namespace: 'scriptoria-bucket' });
  const inMemory = new Store({
    bucket,
    keyMap,
    schema,
    name: 'inMemory'
  });


  const baseUrl = `${apiEnv.protocol || 'http://'}${apiEnv.host || 'localhost'}/api`;
  const remote = new JSONAPISource({
    keyMap,
    schema,
    name: 'remote',
    host: baseUrl,
    SerializerClass: CustomJSONAPISerializer,
    defaultFetchHeaders: {
      Accept: 'application/vnd.api+json',
      ...defaultHeaders()
    }
  });

  // For later when we want to persist between refreshes
  // or queue offline things
  const backup = new IndexedDBSource({
    keyMap,
    bucket,
    schema,
    name: 'backup',
    namespace: 'scriptoria'
  });

  // We don't want to have to query the API everytime we want data
  this.coordinator = new Coordinator({
    sources: [
      backup,
      inMemory,
      remote
    ]
  });

  // TODO: when there is a network error:
  // https://github.com/dgeb/test-ember-orbit/blob/master/app/data-strategies/remote-push-fail.js


  // Pull query results from the server
  this.coordinator.addStrategy(new RequestStrategy({
    name: 'inMemory-remote-query-pessimistic',
    source: 'inMemory',
    on: 'beforeQuery',
    target: 'remote',
    action: 'pull',
    blocking: true
  }));

  // Push updates to the server
  this.coordinator.addStrategy(new RequestStrategy({
    name: 'inMemory-remote-update-pessimistic',
    source: 'inMemory',
    on: 'beforeUpdate',
    target: 'remote',
    action: 'push',
    blocking: true
  }));


  // sync all remote changes with the inMemory store
  this.coordinator.addStrategy(new SyncStrategy({
    source: 'remote',
    target: 'inMemory',
    blocking: true
  }));

  this.coordinator.addStrategy(new SyncStrategy({
    source: 'inMemory',
    target: 'backup',
    blocking: true
  }));


  // // If there is data already stored locally, throw it in memory
  // backup.pull(q => q.findRecords())
  //   .then(transform => {
  //     console.log(transform);
  //     return inMemory.sync(transform)
  //   })
  //   .then(() => this.coordinator.activate());

  await this.coordinator.activate();

  return inMemory;
}
