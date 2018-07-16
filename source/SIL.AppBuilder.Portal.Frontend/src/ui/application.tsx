import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';

import { DataProvider } from '../data';
import { ReduxProvider } from '../redux-store';
import RootRoute from './routes/root';

export default class Application extends React.Component {
  // TODO: add app loader for all the async parts of initializing this
  //       - intl will need to async'ily fetch the current locale's translations
  //       - orbit needs to configure the data source coordinator (which is async
  //         because it may interact with indexeddb for offline support)
  //       - routes that require authentication in the root route (as denoted by
  //         the withCurrentUser HOC) will need to have some sort of loading while
  //         the current user is fetched
  render() {
    return (
      <IntlProvider locale={navigator.language}>
        <DataProvider>
          <ReduxProvider>
            <BrowserRouter>
              <RootRoute />
            </BrowserRouter>
          </ReduxProvider>
        </DataProvider>
      </IntlProvider>
    );
  }
}
