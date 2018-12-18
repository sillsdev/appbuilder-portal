import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';
import { HubConnectionFactory } from "@ssv/signalr-client";

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
  componentDidMount(){
    this.notificationsClient.start();
  }

  componentWillUnmount(){
    this.notificationsClient.stop();
  }

  render(){
    return (<React.Fragment>{this.props.children}</React.Fragment>);
  }
}

export default compose(
  withOrbit({})
)(SocketManager);
