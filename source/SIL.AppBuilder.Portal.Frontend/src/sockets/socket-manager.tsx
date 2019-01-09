import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { compose, branch, renderComponent } from 'recompose';
import { HubConnectionFactory } from "@ssv/signalr-client";
import { isTesting } from '@env';

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
    return this.props.children;
  }
}

export default compose(
  branch(
    () => !isTesting,
    renderComponent(withOrbit({})(SocketManager))
  )
)(({ children }) => children);
