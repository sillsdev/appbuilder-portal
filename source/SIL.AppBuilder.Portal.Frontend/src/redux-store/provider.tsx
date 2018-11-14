import * as React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, Store, compose } from 'redux';

import { setCurrentOrganizationId } from '@lib/current-organization';


import { reducers } from './reducers';
import { middleware, setup as setupMiddleware } from './middleware';
import { default as enhancers } from './enhancers';

export interface IYieldedProps {
  store: Store;
}

export interface IProps {
  initialState?: any;
  children: any;
}

export default class ReduxProvider extends React.Component<IProps> {
  store: Store;

  constructor(props) {
    super(props);

    const { initialState } = props;

    // this is intentionally a class property.
    // we don't want the store re-created during any
    // lifecycle event.
    this.store = this.initRedux(initialState);
  }

  initRedux(initialState: any): Store {
    const fromLS = localStorage.getItem('reduxState');
    const persistedState = fromLS ? JSON.parse(fromLS) : {};

    const state = {
      ...(initialState || {}),
      ...persistedState
    };

    const store = createStore(
      reducers,
      state,
      compose(
        // sagas, maybe thunks, etc
        applyMiddleware(...middleware),
        // e.g.: dev tools
        enhancers
      )
    );

    // Start sagas, etc
    setupMiddleware(store);

    // persist certain things between reloads
    store.subscribe(() => {
      const currentState = store.getState();
      const toPersist = {
        data: currentState.data,
        ui: currentState.ui
      };

      // NOTE: that for non-react/redux things (jquery, fetch, etc),
      //       we need to manually set this specific key
      setCurrentOrganizationId(currentState.data.currentOrganizationId);

      try {
        localStorage.setItem('reduxState', JSON.stringify(toPersist));
      } catch (e) {
        console.error(toPersist, e);
        throw e;
      }
    });

    return store;
  }

  render() {
    const { children } = this.props;

    const isFunction = typeof children === 'function';
    return (
      <Provider store={this.store}>
        {isFunction
          ? children({ store: this.store })
          : children
        }
      </Provider>
    );
  }
}
