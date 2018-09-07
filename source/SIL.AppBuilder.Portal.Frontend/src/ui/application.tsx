import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

import { DataProvider } from '../data';
import { ReduxProvider } from '../redux-store';
import RootRoute from './routes/root';

import i18n from '../translations';

interface IProps {
  initialState: any;
  history: any;
}

export default class Application extends React.Component<IProps> {
  // TODO: add app loader for all the async parts of initializing this
  //       - intl will need to async'ily fetch the current locale's translations
  //       - orbit needs to configure the data source coordinator (which is async
  //         because it may interact with indexeddb for offline support)
  //       - routes that require authentication in the root route (as denoted by
  //         the withCurrentUser HOC) will need to have some sort of loading while
  //         the current user is fetched
  render() {
    const { initialState, history } = this.props;

    return (
      <I18nextProvider i18n={i18n}>
        <DataProvider>
          <ReduxProvider initialState={initialState || {}}>
            <BrowserRouter>
              <RootRoute />
            </BrowserRouter>
          </ReduxProvider>
        </DataProvider>
      </I18nextProvider>
    );
  }
}
