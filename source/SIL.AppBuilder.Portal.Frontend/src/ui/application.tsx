import * as React from 'react';
import { BrowserRouter, Router as GenericRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { APIProvider } from 'react-orbitjs';

import { Provider as CurrentUserProvider } from '@data/containers/with-current-user';

import { createStore as createAPIStrategy } from '@data/store';
import { ReduxProvider } from '@store';
import { SocketManager } from '@sockets';
import { ScrollToTop } from '@lib/routing';



import i18n from '../translations';

import { RouteListener } from './components/route-listener';
import DebugInfo from './components/debug-info';
import RootRoute from './routes/root';
import { Portal } from 'semantic-ui-react';

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

    const Router = history ? GenericRouter : BrowserRouter;
    const routerProps = {};

    if (history) {
      routerProps.history = history;
    }

    return (
      <I18nextProvider i18n={i18n}>
        <APIProvider storeCreator={createAPIStrategy}>
          <CurrentUserProvider>
            <SocketManager>
              <ReduxProvider initialState={initialState || {}}>
                <Router {...routerProps}>
                  <>
                    <RouteListener />
                    <ScrollToTop>
                      <RootRoute />
                    </ScrollToTop>
                    <DebugInfo />
                  </>
                </Router>
              </ReduxProvider>
            </SocketManager>
          </CurrentUserProvider>
        </APIProvider>
      </I18nextProvider>
    );
  }
}
