import * as React from 'react';
import { Router } from 'react-router-dom';
import createHistory from 'history/createMemoryHistory';

import { beforeEach, afterEach } from '@bigtest/mocha';
import { setupAppForTesting, mount } from '@bigtest/react';
import MirageServer, { Factory } from '@bigtest/mirage';
import { Polly } from '@pollyjs/core';


import { ReduxProvider } from '@store/index';
import { DataProvider } from '@data/index';

import rootApplication from '@ui/routes/root';

export { useFakeAuthentication } from './auth';

export function setupRequestInterceptor(config: any = {}) {

  beforeEach(function() {
    this.polly = new Polly('name of interceptor');
    // expose server directly to test environment
    // for easier request stubbing
    this.server = this.polly.server;

    this.polly.server.get('https://cdn.auth0.com/*path').intercept((req, res) => {
      res.status(200);
      res.json({});
    });
  });

  afterEach(function() {
    this.server = undefined;
    this.polly.stop();
  });
}

// the same as @ui/application, but allows
// setting the initial state
class TestWrapper extends React.Component<any, any> {
  render() {
    const { initialState, history } = this.props;
    // mount the whole app by default, but allow testing individual
    // components.
    const ComponentToTest = this.props.component || rootApplication;
    const componentProps = this.props.componentProps || {};

    // TODO: find a way to seed the data provider with data
    return (
      <div data-test-app-container>
        <DataProvider>
          <ReduxProvider initialState={initialState || {}}>
            <Router history={history}>
              <ComponentToTest {...componentProps } />
            </Router>
          </ReduxProvider>
        </DataProvider>
      </div>
    );
  }
}

export function setupApplicationTest(initialState = {}, history?: History) {
  beforeEach(async function() {
    const historyForTesting = history || createHistory();

    this.app = await setupAppForTesting(TestWrapper, {
      props: {
        initialState,
        history: historyForTesting
      },
    });
  });
}

// Mounting with context is needed because some components,
// esp those from react-router-dom (such as NavLink)
// require that they be rendered within a Route within a Router.
export const mountWithContext = async (component, props = {}, state = {}, history = undefined) => {
  this.app = await setupAppForTesting(TestWrapper, {
    props: {
      component,
      componentProps: props,
      initialState: state,
      history: history || createHistory()
    },
    mountId: 'integration-testing-root'
  });

  return this.app;
};
