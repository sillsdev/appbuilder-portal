import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import { DWKitForm } from '@assets/vendor/dwkit/optimajet-form.js';
import {
  ApplicationRouter,
  NotificationComponent,
  FormContent,
  FlowContent,
  Thunks,
  Store,
  Actions,
  API,
} from '@assets/vendor/dwkit/optimajet-app.js';
import * as toast from '@lib/toast';
import '~/global-config';
import { HubConnectionState } from '@aspnet/signalr';

import { initialState } from './initial-state';
import { SignalRConnector } from './signalr';

import { useRouter } from '~/lib/hooks';
import { PageLoader } from '~/ui/components/loaders';

// Nasty overrides that DWKit assumes have been polluted
// on the global / window namespace
window.alertify = {
  error(...args) {
    toast.error(...args);
  },
  confirm(...args) {
    toast.info(...args);
  },
  log(...args) {
    toast.info(...args);
  },
  success(...args) {
    toast.success(...args);
  },
  set() {},
  custom() {},
  prompt() {},
};

window.Pace = {
  start() {},
  stop() {},
};

function resetFormState() {
  // Without this, the form state becomes stale between
  // viewings of different tasks' forms.
  // TaskA -> form is shown
  // TaskB -> TaskA's form is shown
  // Refresh -> TaskB's form is shown
  //
  // This is a giant anti pattern.
  // the state should never be mutated.
  // but DWKit does not provide the needed APIs to interact with their Redux Store.
  // Additionally, they also mutate everything all over the place.
  //
  // What even are conventions?
  Store.getState().app = initialState.app;
}

function RouteListener({ onLocationChange }) {
  const { history } = useRouter();

  useEffect(() => {
    history.listen((location, action) => {
      onLocationChange(history, location);
    });
  }, [history, onLocationChange]);

  return null;
}

function MaskingLoader() {
  return (
    <div
      style={{
        zIndex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.5)',
      }}
    >
      <PageLoader />
    </div>
  );
}

function ensureConnectedToHub() {
  let connection = SignalRConnector.connection;

  if (connection) {
    if (connection.state === HubConnectionState.Connected) {
      console.debug('dwkit signalr hub is already connected');
      return;
    }

    console.debug(
      'connection exists but state is',
      connection.state,
      ' -- A connected state would be: ',
      HubConnectionState.Connected
    );
    return;
  }

  console.debug('connection to dwkit signalr hub is not yet established');
  SignalRConnector.Connect(Store);
}

// TODO: the signalr integration with this is super broken / just doesn't seem to cause any updates
export default class App extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      pagekey: 0,
      isLoading: false,
    };

    window.DWKitApp = this;
    window.DWKitApp.API = API;
    this.resetDWKitState();
  }

  componentDidMount() {
    this.resetDWKitState();
  }

  componentWillUnmount() {
    SignalRConnector.connection && SignalRConnector.connection.stop();
  }

  resetDWKitState = () => {
    resetFormState();

    Store.dispatch(Thunks.userinfo.fetch(() => this.forceUpdate()));
    ensureConnectedToHub();

    this.onFetchStarted();
  };

  onLocationChange = (history = undefined, location = undefined) => {
    resetFormState();
    if (history) {
      Store.dispatch(Actions.router.routechanged(history, location));
    }

    ensureConnectedToHub();
    this.setState({ pagekey: this.state.pagekey + 1 });
  };

  render() {
    const { isLoading } = this.state;
    const sectorprops = {
      eventFunc: this.actionsFetch.bind(this),
      getAdditionalDataForControl: this.additionalFetch.bind(this, undefined),
    };

    return (
      <div
        className='p-lg flex-column flex-grow dwkit-form-container align-items-center p-relative'
        key={this.state.pagekey}
      >
        {isLoading && <MaskingLoader />}
        <DWKitForm
          className='dwkit-header w-100'
          {...sectorprops}
          formName='top'
          modelurl='/ui/form/top'
        />
        <Provider store={Store}>
          <>
            <RouteListener onLocationChange={this.onLocationChange} />
            <ApplicationRouter
              onRefresh={() => {
                this.onLocationChange();
                ensureConnectedToHub();
              }}
            />

            <NotificationComponent
              onFetchStarted={this.onFetchStarted}
              onFetchFinished={this.onFetchFinished}
            />

            <Switch>
              <Route
                path='/form'
                render={(props) => {
                  return (
                    <div className='flex-row flex-grow form-layout-wrapper'>
                      <FormContent className='flex-grow' {...props} />
                    </div>
                  );
                }}
              />

              <Route
                path='/flow'
                render={(props) => {
                  return (
                    <div className='flex-row flex-grow form-layout-wrapper'>
                      <FlowContent className='flex-grow' {...props} />
                    </div>
                  );
                }}
              />

              <Route
                exact
                path='/'
                render={() => {
                  return <Redirect to='/tasks' push={true} />;
                }}
              />

              <Route
                nomatch
                render={(props) => {
                  if (props.match.path === '/' || props.match.path === '/tasks') {
                    // the parent route will handle this scenario
                    return null;
                  }

                  // Hack for back button (from DWKit's original code)
                  const url = window.location.href;
                  history.back();
                  window.location.href = url;

                  return null;
                }}
              />
            </Switch>
          </>
        </Provider>
      </div>
    );
  }

  onFetchStarted = () => {
    this.setState({ isLoading: true });
  };

  onFetchFinished = () => {
    this.setState({ isLoading: false });
  };

  actionsFetch = (args) => {
    Store.dispatch(Thunks.form.executeActions(args));
    this.onLocationChange();
  };

  additionalFetch = (
    formName,
    controlRef,
    { startIndex, pageSize, filters, sort, model },
    callback
  ) => {
    Store.dispatch(
      Thunks.additional.fetch({
        type: controlRef.props['data-buildertype'],
        formName,
        controlRef,
        startIndex,
        pageSize,
        filters,
        sort,
        callback,
      })
    );
    this.onLocationChange();
  };
}
