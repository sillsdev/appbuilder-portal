import * as signalR from '@aspnet/signalr';
import { Actions as appActions, Store as store } from '@assets/vendor/dwkit/optimajet-app.js';

import { getToken } from '~/lib/auth0';

import { LogLevel, HttpTransportType } from '@aspnet/signalr';

let connection = null;

export const SignalRConnector = {
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
    var auth = `access_token=${getToken()}`;
    var encodedQuery = encodeQueryData(query);
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`/hubs/notifications?${auth}${encodedQuery.length > 0 ? `&${encodedQuery}` : ''}`, {
        logger: LogLevel.Warning,
        transport:
          HttpTransportType.WebSockets |
          HttpTransportType.LongPolling |
          HttpTransportType.ServerSentEvents,
        accessTokenFactory: () => {
          return getToken();
        },
      })
      .build();
    this.connection.on('StateChange', onStateChange);
    this.connection.start();
  },
};

function encodeQueryData(data) {
  let ret = [];
  var state = store.getState();

  if (state.app.impersonatedUserId) {
    ret.push('impersonatedUserId=' + encodeURIComponent(state.app.impersonatedUserId));
  }

  for (let d in data)
    if (data.hasOwnProperty(d)) ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  return ret.join('&');
}
