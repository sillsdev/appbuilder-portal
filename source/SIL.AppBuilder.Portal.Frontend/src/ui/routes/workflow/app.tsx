import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
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

import * as $ from '@assets/vendor/dwkit/jquery.js';
window.$ = window.jQuery = $;
import '@assets/vendor/dwkit/konva.min.js';
import '@assets/vendor/dwkit/ace.js';
import '@assets/vendor/dwkit/Chart.min.js';
import '@assets/vendor/dwkit/jquery.auto-complete.min.js';
import '@assets/vendor/dwkit/jquery.loadingModal.min.js';

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
    this.state = {
      pagekey: 0
    };

    const me = this;
    // Store.dispatch(Thunks.userinfo.fetch(function () {
    //   me.forceUpdate();
    // }));
    // Store.resetForm();


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
        { /* <DWKitForm {...sectorprops}
          className='dwkit-header'
          formName="header"
          data={{currentUser: attributesFor(currentUser).name}}
          modelurl="/ui/form/header" />*/}
        <DWKitForm className='dwkit-header w-100' {...sectorprops} formName="top" modelurl="/ui/form/top"/>
        <Provider store={Store}>
          <>
            <ApplicationRouter onRefresh={this.onRefresh.bind(this)} />
            <NotificationComponent
              onFetchStarted={this.onFetchStarted.bind(this)}
              onFetchFinished={this.onFetchFinished.bind(this)} />

            <Route path='/form' render={(props) => {
              return (
                <div className='flex-row flex-grow form-layout-wrapper'>
                  <FormContent className='flex-grow' { ...props } />
                </div>
              );
            }} />
            <Route path='/flow' render={(props) => {
              return (
                <div className='flex-row flex-grow form-layout-wrapper'>
                  <FormContent className='flex-grow' { ...props } />
                </div>
              )
            }} />
          </>
        </Provider>
        { /* <DWKitForm {...sectorprops} formName="footer" modelurl="/ui/form/footer" />*/ }
      </div>
    );
  }

  onFetchStarted() {
    $('body').loadingModal({
      text: 'Loading...',
      animation: 'foldingCube',
      backgroundColor: '#1262E2'
    });
  }

  onFetchFinished() {
    $('body').loadingModal('destroy');
  }

  onRefresh() {
    this.onFetchStarted();
    Store.resetForm();
    // this.setState({
    //   pagekey: this.state.pagekey + 1
    // });
    // SignalRConnector.Connect(Store);
  }

  actionsFetch(args) {
    Store.dispatch(Thunks.form.executeActions(args));
  }

  additionalFetch(formName, controlRef, { startIndex, pageSize, filters, sort, model }, callback) {
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

// SignalRConnector.Connect(Store);

// render(<App/>,document.getElementById('content'));


