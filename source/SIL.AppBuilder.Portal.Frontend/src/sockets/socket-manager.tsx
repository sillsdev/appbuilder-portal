import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';
import { HubConnectionFactory, HubConnection } from "@ssv/signalr-client";

import NotificationsClient from './notifications';

interface IOwnProps {

}

type IProps = IOwnProps | WithDataProps;

class SocketManager extends React.Component<IProps>{
  hubFactory = new HubConnectionFactory();
  notificationsClient = new NotificationsClient();
  constructor(props){
    super(props);
    const { dataStore } = props;
    this.notificationsClient.init(this.hubFactory, dataStore);
  }

  render(){
    return (<div>{this.props.children}</div>);
  }
}

export default compose(
  withOrbit({})
)(SocketManager);
