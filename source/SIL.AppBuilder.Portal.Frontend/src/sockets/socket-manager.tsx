import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';
import { HubConnectionFactory } from "@ssv/signalr-client";

import { withCurrentUser } from '@data/containers/with-current-user';

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
  // currentUser is not used, but we need
  // the tree to re-render upon validation of the
  // authentication token
  // TODO: consume the current user context when that PR is merged.
  // withCurrentUserContext(),
  withOrbit({})
)(SocketManager);
