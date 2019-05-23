import React, { Component } from 'react';
import { useOrbit } from 'react-orbitjs';
import { HubConnectionFactory, ConnectionState, ConnectionStatus } from '@ssv/signalr-client';

import {
  transformsToJSONAPIOperations,
  JSONAPIOperationsPayload,
} from '~/data/orbitjs-operations-support';

import { isTesting } from '~/env';

import { TransformOrOperations, Source } from '@orbit/data';
import { Subscription } from 'rxjs';
import JSONAPISource from '@orbit/jsonapi';
import Store from '@orbit/store';

import { DataClient } from './clients';

import { dataToLocalCache } from '~/data/orbitjs-operations-support/serialize-from-api';

import { useAuth } from '~/data/containers/with-auth';

export default function LiveDataManger({ children }) {
  const { dataStore, sources } = useOrbit();
  const { isLoggedIn, auth0Id } = useAuth();

  return (
    <LiveDataManagerSocketManager
      {...{
        dataStore,
        sources,
        isLoggedIn,
        auth0Id,
      }}
    >
      {children}
    </LiveDataManagerSocketManager>
  );
}

interface LiveDataProps {
  dataStore: Store;
  isLoggedIn: boolean;
  auth0Id?: string;
  sources: {
    [sourceName: string]: Source;
  };
  children: (providedArgs: {
    socket: DataClient;
    pushData: (transforms: TransformOrOperations) => Promise<JSONAPIOperationsPayload>;
    subscriptions: string[];
    isConnected: boolean;
    connectionState: ConnectionState;
  }) => React.ReactNode;
}

interface State {
  isConnected: boolean;
  connectionState: ConnectionState;
}

// using a class instead of a series of functional components and hooks
// because we want to be *very* specific about what happens when.
// hooks muddy this a bit by the nature of them re-rendering all the time.
class LiveDataManagerSocketManager extends Component<LiveDataProps, State> {
  hubFactory: HubConnectionFactory;
  dataClient: DataClient;
  connectionSubscription$: Subscription;
  connectionStateSubscription$: Subscription;

  subscriptions = [];

  shouldConnect = false;

  isBooting = false;
  isBooted = false;
  isDestroying = false;

  state = {
    isConnected: false,
    connectionState: undefined,
  };

  constructor(props: LiveDataProps) {
    super(props);

    this.hubFactory = new HubConnectionFactory();

    this.startSocket();
  }

  componentDidMount() {
    this.startSocket();
  }

  componentWillUnmount() {
    this.isDestroying = true;

    this.stopSocket();
  }

  componentDidUpdate(prevProps: Readonly<LiveDataProps>, prevState: Readonly<State>) {
    const didLogOut = !this.props.isLoggedIn && prevProps.isLoggedIn;
    const didLogIn = this.props.isLoggedIn && !prevProps.isLoggedIn;

    if (didLogOut) {
      this.stopSocket();
    }

    if (didLogIn) {
      this.startSocket();
    }
  }

  render() {
    const { children } = this.props;
    const { isConnected, connectionState } = this.state;

    return children({
      socket: this.dataClient,
      pushData: this.pushData,
      subscriptions: this.subscriptions,
      isConnected,
      connectionState,
    });
  }

  private pushData = async (
    transforms: TransformOrOperations
  ): Promise<JSONAPIOperationsPayload> => {
    const { sources, dataStore } = this.props;

    const data = transformsToJSONAPIOperations(
      sources.remote as JSONAPISource,
      dataStore.transformBuilder,
      transforms
    );

    if (!this.state.isConnected) return;

    let observer = this.dataClient.hub.invoke<string>('PerformOperations', JSON.stringify(data));

    const json = await observer.toPromise();

    return handleSocketPayload(dataStore, json);
  };

  private startSocket = () => {
    this.shouldConnect = !isTesting && this.props.isLoggedIn;

    if (!this.shouldConnect) return;
    if (this.isDestroying || this.isBooting || this.isBooted) return;

    this.isBooting = true;

    this.dataClient = new DataClient(this.hubFactory, this.props.dataStore);
    this.dataClient.start();

    this.isBooted = true;
    this.isBooting = false;

    this.connectionSubscription$ = this.dataClient.connection$$.subscribe(() => {
      this.connectionStateSubscription$ = this.dataClient.hub.connectionState$.subscribe(
        (state) => {
          if (this.isDestroying) return;

          this.setState({
            isConnected: state.status === ConnectionStatus.connected,
            connectionState: state,
          });
        }
      );
    });
  };

  private stopSocket = () => {
    if (!this.state.isConnected) return;

    this.dataClient.stop();
    this.hubFactory.disconnectAll();

    if (this.connectionSubscription$) {
      this.connectionSubscription$.unsubscribe();
    }
    if (this.connectionStateSubscription$) {
      this.connectionStateSubscription$.unsubscribe();
    }
  };
}

function handleSocketPayload(dataStore: Store, json: string) {
  const response: JSONAPIOperationsPayload = JSON.parse(json);

  dataToLocalCache(dataStore, response);

  return response;
}
