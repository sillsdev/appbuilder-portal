import { beforeEach, afterEach } from '@bigtest/mocha';
import { setupAppForTesting } from '@bigtest/react';
import * as History from 'history';

import Application from '@ui/application';

import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '@ui/styles/app.scss';

export function setupApplicationTest(initialState = {}, history?: History) {
  beforeEach(async function() {
    const historyForTesting = history || History.createMemoryHistory();

    this.app = await setupAppForTesting(Application, {
      props: {
        initialState,
        history: historyForTesting,
      },
    });
  });
}

// Mounting with context is needed because some components,
// esp those from react-router-dom (such as NavLink)
// require that they be rendered within a Route within a Router.
export const mountWithContext = async (
  Component,
  props = {},
  state = {},
  customHistory = undefined
) => {
  return await setupAppForTesting(Application, {
    props: {
      initialState: state,
      history: customHistory || History.createMemoryHistory(),
      entryComponent: Component,
    },
  });
};
