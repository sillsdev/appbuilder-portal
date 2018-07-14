import * as React from 'react';
import { DataProvider } from 'react-orbitjs';
import Store from '@orbit/store';
import Coordinator from '@orbit/coordinator';

import { createStore } from './store';

interface IState {
  store: Store;
};

export default class APIProvider extends React.Component<{}, IState> {
  state = { store: undefined };
  coordinator: Coordinator;

  constructor(props) {
    super(props);

    this.initDataStore();
  }

  async initDataStore() {
    const store = await createStore();

    this.setState({ store });
  }

  render() {
    const { store } = this.state;

    if (!store) return 'Loading...';

    return (
      <DataProvider dataStore={store}>
        {this.props.children}
      </DataProvider>
    );
  }
}
