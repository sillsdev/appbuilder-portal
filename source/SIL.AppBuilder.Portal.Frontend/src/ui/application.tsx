import React, {  } from 'react';
import { BrowserRouter, Router as GenericRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { APIProvider, strategies } from 'react-orbitjs';
import { Provider as CurrentUserProvider } from '@data/containers/with-current-user';
import { baseUrl } from '@data/store';

import { ReduxProvider } from '@store';

import { Sockets } from '~/sockets';

import { AuthProvider } from '~/data/containers/with-auth';

import { ScrollToTop } from '~/lib/routing';

import i18n from '~/translations';

import { L10nLoader } from '~/translations/fetch-l10n';

import { RouteListener } from './components/routing/route-listener';
import DebugInfo from './components/debug-info';
import { CacheHydrater } from './components/cache-hydrater';
import RootRoute from './routes/root';

import { schema, keyMap } from '~/data/schema';

interface IProps {
  initialState: any;
  entryComponent?: React.ComponentType;
  history: any;
  initialRecords: any;
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
    const { initialState, history, entryComponent } = this.props;

    const Router = history ? GenericRouter : BrowserRouter;
    const Component = entryComponent ? entryComponent : RootRoute;
    const routerProps = {};

    if (history) {
      routerProps.history = history;
    }

    return (
      <I18nextProvider i18n={i18n}>
        <L10nLoader>
          <APIProvider
            storeCreator={() =>
              strategies.pessimisticWithRemoteIds.createStore(baseUrl, schema, keyMap)
            }
          >
            <AuthProvider>
              <CurrentUserProvider>
                <Sockets>
                  <ReduxProvider initialState={initialState || {}}>
                    <Router {...routerProps}>
                      <CacheHydrater>
                        <RouteListener />
                        <ScrollToTop>
                          <Component />
                        </ScrollToTop>
                        <DebugInfo />
                      </CacheHydrater>
                    </Router>
                  </ReduxProvider>
                </Sockets>
              </CurrentUserProvider>
            </AuthProvider>
          </APIProvider>
        </L10nLoader>
      </I18nextProvider>
    );
  }
}
