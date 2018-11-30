import * as React from 'react';
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';
import { DWKitForm } from "@assets/vendor/dwkit/optimajet-form.js";
import {
  ApplicationRouter, NotificationComponent, FormContent,
  FlowContent, Thunks, Store, Actions, SignalRConnector, StateBindedForm, API
} from '@assets/vendor/dwkit/optimajet-app.js';

import { compose } from 'recompose';
import { requireAuth } from '@lib/auth';
import { withCurrentUser } from '~/data/containers/with-current-user';
import { withLayout } from '@ui/components/layout';
import { attributesFor } from '~/data';

import '~/global-config';

window.alertify = {
  error() { },
  confirm() { },
  log() { },
  success() { },
  set() { },
  custom() { },
  prompt() { },
};

window.Pace = {
  start() { },
  stop() { },
};



export class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('jQuery', $);
    this.state = {
      pagekey: 0
    };

    const me = this;

    window.DWKitApp = this;
    window.DWKitApp.API = API;
    this.onFetchStarted();
  }

  render() {
    const { currentUser } = this.props;

    const sectorprops = {
      eventFunc: this.actionsFetch.bind(this),
      getAdditionalDataForControl: this.additionalFetch.bind(this, undefined)
    };

    const state = Store.getState();
    console.log(Store, state);

    let user = state.app.user;
    if (user === undefined) {
      user = {};
    }

    return (
      <div className="p-lg flex-column flex-grow dwkit-form-container align-items-center" key={this.state.pagekey}>
        <DWKitForm className='dwkit-header w-100' {...sectorprops} formName="top" modelurl="/ui/form/top"/>
        <Provider store={Store}>
          <>
            <ApplicationRouter onRefresh={this.onRefresh} />
            <NotificationComponent
              onFetchStarted={this.onFetchStarted}
              onFetchFinished={this.onFetchFinished} />

            <Route path='/form' render={(props) => {
              return (
                <div className='flex-row flex-grow form-layout-wrapper'>
                  <FormContent className='flex-grow' { ...props } />
                </div>
              );
            }} />

            <Route path='/form-dashboard' render={(props) => {
              return (
                <div className='flex-row flex-grow form-layout-wrapper'>
                  <FormContent className='flex-grow' { ...props } formName='dashboard' />
                </div>
              );
            }} />

            <Route path='/flow' render={(props) => {
              return (
                <div className='flex-row flex-grow form-layout-wrapper'>
                  <FlowContent className='flex-grow' { ...props } />
                </div>
              );
            }} />
          </>
        </Provider>
      </div>
    );
  }

  onFetchStarted = () => {
    $('body').loadingModal({
      text: 'Loading...',
      animation: 'foldingCube',
      backgroundColor: '#1262E2'
    });
  }

  onFetchFinished = () => {
    $('body').loadingModal('destroy');
  }

  onRefresh = () => {
    this.onFetchStarted();
    Store.resetForm();
  }

  actionsFetch = (args) => {
    Store.dispatch(Thunks.form.executeActions(args));
  }

  additionalFetch = (formName, controlRef, { startIndex, pageSize, filters, sort, model }, callback) => {
    Store.dispatch(Thunks.additional.fetch({
      type: controlRef.props["data-buildertype"],
      formName, controlRef, startIndex, pageSize, filters, sort, callback
    }
    ));
  }
}

export default compose(
  requireAuth,
  withLayout,
)(App);

