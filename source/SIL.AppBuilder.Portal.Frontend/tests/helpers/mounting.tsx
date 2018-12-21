import * as React from 'react';
import { Router } from 'react-router-dom';
import { beforeEach, afterEach } from '@bigtest/mocha';
import { setupAppForTesting } from '@bigtest/react';
// import MirageServer, { Factory } from '@bigtest/mirage';
import { I18nextProvider } from 'react-i18next';

import createHistory from 'history/createMemoryHistory';

import i18n from '@translations';

import Application from '@ui/application';
import { ReduxProvider } from '@store/index';
import { DataProvider } from '@data/index';
import { Provider as CurrentUserProvider } from '@data/containers/with-current-user';
import { ScrollToTop } from '@lib/routing';


import 'semantic-ui-css/semantic.min.css';
import '@ui/styles/app.scss';

function resetBrowser() {
  localStorage.clear();
  i18n.changeLanguage('en-US');
}

export function setupApplicationTest(initialState = {}, history?: History) {
  beforeEach(async function() {
    resetBrowser();

    const historyForTesting = history || createHistory();

    this.app = await setupAppForTesting(Application, {
      props: {
        initialState,
        history: historyForTesting,
      },
    });
  });

  afterEach(() => {
    resetBrowser();
  });
}

// Mounting with context is needed because some components,
// esp those from react-router-dom (such as NavLink)
// require that they be rendered within a Route within a Router.
export const mountWithContext = async (Component, props = {}, state = {}, customHistory = undefined) => {
  return await setupAppForTesting(
    ({ initialState, history }) => {
      return (
        <I18nextProvider i18n={i18n}>
          <DataProvider>
            <CurrentUserProvider>
              <ReduxProvider initialState={initialState || {}}>
                <Router history={history}>
                  <ScrollToTop>
                    <Component { ...props } />
                  </ScrollToTop>
                </Router>
              </ReduxProvider>
            </CurrentUserProvider>
          </DataProvider>
        </I18nextProvider>
      );
    },
    {
      props: {
        initialState: state,
        history: customHistory || createHistory()
      },
    }
  );
};
