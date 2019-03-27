import * as React from 'react';
import { Provider } from 'react-redux';
import { Route, BrowserRouter, Switch, Redirect } from 'react-router-dom';
import { DWKitForm } from '@assets/vendor/dwkit/optimajet-form.js';
import {
  ApplicationRouter,
  NotificationComponent,
  FormContent,
  FlowContent,
  Thunks,
  Store,
  Actions,
  // TODO: swap this out with the local one.
  //       this way we can customize authentication
  SignalRConnector,
  StateBindedForm,
  API,
} from '@assets/vendor/dwkit/optimajet-app.js';
import * as toast from '@lib/toast';

import '~/global-config';

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
  Store.resetForm();
}

export default class App extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      pagekey: 0,
    };

    resetFormState();

    const me = this;
    Store.dispatch(
      Thunks.userinfo.fetch(function() {
        me.forceUpdate();
      })
    );

    window.DWKitApp = this;
    window.DWKitApp.API = API;
    this.onFetchStarted();
    SignalRConnector.Connect(Store);
  }

  componentWillUnmount() {
    resetFormState();
  }

  render() {
    const sectorprops = {
      eventFunc: this.actionsFetch.bind(this),
      getAdditionalDataForControl: this.additionalFetch.bind(this, undefined),
    };

    return (
      <div
        className='p-lg flex-column flex-grow dwkit-form-container align-items-center'
        key={this.state.pagekey}
      >
        <DWKitForm
          className='dwkit-header w-100'
          {...sectorprops}
          formName='top'
          modelurl='/ui/form/top'
        />
        <Provider store={Store}>
          <>
            <ApplicationRouter onRefresh={this.onRefresh} />
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
                path='/form-dashboard'
                render={(props) => {
                  return (
                    <div className='flex-row flex-grow form-layout-wrapper'>
                      <FormContent className='flex-grow' {...props} formName='dashboard' />
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
                  return <Redirect to='/tasks' />;
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
    $('body').loadingModal({
      text: 'Loading...',
      animation: 'foldingCube',
      backgroundColor: '#1262E2',
    });
  };

  onFetchFinished = () => {
    $('body').loadingModal('destroy');
  };

  onRefresh = () => {
    this.onFetchStarted();
    Store.resetForm();
    this.setState({
      pagekey: this.state.pagekey + 1,
    });
    SignalRConnector.Connect(Store);
  };

  actionsFetch = (args) => {
    Store.dispatch(Thunks.form.executeActions(args));
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
  };
}
