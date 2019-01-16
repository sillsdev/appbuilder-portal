import * as React from 'react';
import { DataProvider } from 'react-orbitjs';
import Store from '@orbit/store';
import Coordinator from '@orbit/coordinator';
import PageLoader from '@ui/components/loaders/page';
import { Source } from '@orbit/data';

import { createStore } from './store';

interface IState {
  store: Store;
  sources: { [sourceName: string]: Source };
}

export default class APIProvider extends React.Component<{}, IState> {
  state = { store: undefined, sources: undefined };
  coordinator: Coordinator;

  constructor(props) {
    super(props);

    this.initDataStore();
  }

  async initDataStore() {
    const { sources } = await createStore.bind(this)();

    this.setState({ store: sources.inMemory, sources });
  }

  render() {
    const { store, sources } = this.state;

    if (!store) {
      return <PageLoader />;
    }

    return (
      <DataProvider dataStore={store} sources={sources}>
        {this.props.children}
      </DataProvider>
    );
  }
}
