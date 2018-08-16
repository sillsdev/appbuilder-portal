import * as React from 'react';
import { Router, withRouter } from 'react-router-dom';
import { beforeEach, afterEach } from '@bigtest/mocha';
import { setupAppForTesting, mount } from '@bigtest/react';
import MirageServer, { Factory } from '@bigtest/mirage';
import { I18nextProvider } from 'react-i18next';

import createHistory from 'history/createMemoryHistory';

import rootApplication from '@ui/routes/root';
import { ReduxProvider } from '@store/index';
import { DataProvider } from '@data/index';


import i18n from '../../src/translations';

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

    const RouteListener = (InnerComponent) => withRouter((props) => {
      props.history.listen(l => console.debug('Current History Entry: ', l, props));

      return <InnerComponent { ...componentProps } />;
    });

    const WithRouteDebugging = RouteListener(ComponentToTest);

    return (
      <div data-test-app-container>
        <I18nextProvider i18n={i18n} initialLanguage='en-US'>
          <DataProvider>
            <ReduxProvider initialState={initialState || {}}>
              <Router history={history}>
                <WithRouteDebugging />
              </Router>
            </ReduxProvider>
          </DataProvider>
        </I18nextProvider>
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
