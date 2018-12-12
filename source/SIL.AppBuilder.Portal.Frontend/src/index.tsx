import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'semantic-ui-css/semantic.min.css';

import './ui/styles/app.scss';

import Application from './ui/application';

ReactDOM.render(
  <Application />,
  document.getElementById('root')
);


import * as signalr from "@aspnet/signalr";

const connection = new signalr.HubConnectionBuilder()
  .withUrl("/hubs/notifications")
  .configureLogging(signalr.LogLevel.Information)
  .build();

connection.start().then(() => {
  console.log("SignalR connection established");
})
.catch((err) => {
  console.error("unable to start signal r connection.", err);
});

connection.on("TestNotification", (message: string) => {
  console.log(`TestNotification: ${message}`);
});
