import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { compose, branch, renderComponent } from 'recompose';
import { HubConnectionFactory } from '@ssv/signalr-client';

import { isTesting } from '@env';

import { withCurrentUserContext, ICurrentUserProps } from '~/data/containers/with-current-user';

import { NotificationsClient } from './clients';

interface IOwnProps {}

type IProps = IOwnProps | WithDataProps;

class SocketManager extends React.Component<IProps> {
  notificationsClient: NotificationsClient;
  hubFactory: HubConnectionFactory;

  constructor(props) {
    super(props);

    const { dataStore } = props;
    this.hubFactory = new HubConnectionFactory();

    this.notificationsClient = new NotificationsClient(this.hubFactory, dataStore);
  }

  componentDidMount() {
    this.notificationsClient.start();
  }

  componentWillUnmount() {
    this.notificationsClient.stop();
    this.hubFactory.disconnectAll();
  }

  render() {
    return this.props.children;
  }
}

export default compose<{}, {}>(
  withCurrentUserContext,
  branch(
    ({ currentUser }: ICurrentUserProps) => !isTesting && !!currentUser,
    renderComponent(withOrbit({})(SocketManager))
  )
)(({ children }: any) => children);
