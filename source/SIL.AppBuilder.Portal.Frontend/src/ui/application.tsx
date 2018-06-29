import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { DataProvider } from '../data';
import { ReduxProvider } from '../redux-store';
import RootRoute from './routes/root';

export default class Application extends React.Component {
  render() {
    return (
      <DataProvider>
        <ReduxProvider>
          <BrowserRouter>
            <RootRoute />
          </BrowserRouter>
        </ReduxProvider>
      </DataProvider>
    );
  }
}
