import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { compose, branch, renderComponent } from 'recompose';
import { HubConnectionFactory } from '@ssv/signalr-client';

import { isTesting } from '@env';

import { withCurrentUserContext, ICurrentUserProps } from '~/data/containers/with-current-user';

import { NotificationsClient, DataClient } from './clients';


interface IOwnProps {}

type IProps = IOwnProps | WithDataProps;

class SocketManager extends React.Component<IProps> {
  notificationsClient: NotificationsClient;
  dataClient: DataClient;
  hubFactory: HubConnectionFactory;

  constructor(props) {
    super(props);

    const { dataStore } = props;
    this.hubFactory = new HubConnectionFactory();

    this.dataClient = new DataClient(this.hubFactory, dataStore);
  }

  componentDidMount() {
    this.dataClient.start();
  }

  componentWillUnmount() {
    this.dataClient.stop();
    this.hubFactory.disconnectAll();
  }

  pushOperations = (data: any) => {
    console.log('data pushing... ', data);
  }

  render() {
    return this.props.children({
      pushOperations: this.pushOperations
    });
  }
}

export default compose<{}, {}>(
  withCurrentUserContext,
  branch(
    ({ currentUser }: ICurrentUserProps) => !isTesting && !!currentUser, 
    renderComponent(withOrbit({})(SocketManager)))
)(
  ({ children }: any) => children
);
