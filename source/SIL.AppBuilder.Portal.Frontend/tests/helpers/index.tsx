import * as React from 'react';
import { Router } from 'react-router-dom';
import createHistory from 'history/createMemoryHistory';

import { beforeEach, afterEach } from '@bigtest/mocha';
import { setupAppForTesting, mount } from '@bigtest/react';
import MirageServer, { Factory } from '@bigtest/mirage';

import { ReduxProvider } from '@store/index';
import { DataProvider } from '@data/index';

import rootApplication from '@ui/routes/root';

export { useFakeAuthentication } from './auth';

// for documentation: http://www.ember-cli-mirage.com
// even though this isn't ember, @bigtest/mirage has the same apis.
export function setupRequestInterceptor(config = {}) {
  // beforeEach( () => {
  //   // see: https://github.com/bigtestjs/mirage/blob/master/tests/integration/http-verbs-test.js
  //   // for config examples
  //   this.server = new MirageServer({
  //     environment: 'development',
  //     models: {},
  //     ...config
  //   });

  //   /////////////////
  //   // Default stubs
  //   this.server.get('https://cdn.auth0.com/client/fakeE2O17FBrlQ667x5mydhpqelCfake.js?:time', () => ({}));
  //   this.server.pretender.get('https://cdn.auth0.com', () => ({}));

  //   this.server.timing = 0;
  //   this.server.logging = false;
  // })

  // afterEach( () => {
  //   this.server.shutdown();
  // });
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
export const mountWithContext = (component, props = {}, state = {}, history = undefined) => {
  return mount(() => (
    <TestWrapper
      component={component}
      componentProps={props}
      initialState={state}
      history={history || createHistory()}
    />
  ), {
    mountId: 'integration-testing-root'
  });
};
