import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import Login from '@ui/routes/login';
import Tasks from '@ui/routes/tasks';

export default class RootPage extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path='/' render={() => (<Redirect to="/tasks" />)} />
        <Route path='/tasks' component={Tasks} />
        <Route path='/login' component={Login} />
      </Switch>
    );
  }
}
