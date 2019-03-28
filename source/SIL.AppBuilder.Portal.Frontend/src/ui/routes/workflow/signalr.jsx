import * as signalR from '@aspnet/signalr';
// import appActions from './actions.jsx'
// import { encodeQueryData} from './utils.jsx'

let connection = null;

const SignalRConnector = {
  connection: null,
  Connect(store) {
    const onStateChange = (data) => {
      if (data === null || data === undefined) return;
      if (data.path === null || data.path === undefined || typeof data.path !== 'string') return;
      const pathes = data.path.split('.');
      let stateDelta = {};
      let prev = stateDelta;
      for (let i = 0; i < pathes.length; i++) {
        if (i === pathes.length - 1) {
          prev[pathes[i]] = data.change;
        } else {
          prev[pathes[i]] = {};
          prev = prev[pathes[i]];
        }
      }
      store.dispatch(appActions.updatestate(stateDelta));
    };

    if (this.connection !== null) {
      this.connection.off('StateChange');
      this.connection.stop();
    }

    var query = {};
    var encodedQuery = encodeQueryData(query);
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(
        encodedQuery.length > 0 ? '/hubs/notifications?' + encodedQuery : '/hubs/notifications'
      )
      .build();
    this.connection.on('StateChange', onStateChange);
    this.connection.start();
  },
};

export default SignalRConnector;
