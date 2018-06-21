import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ReduxProvider } from '../redux-store';
import RootRoute from './routes/root';

export default class Application extends React.Component {
  render() {
    return (
      <ReduxProvider>
        <BrowserRouter>
          <RootRoute />
        </BrowserRouter>
      </ReduxProvider>
    );
  }
}
