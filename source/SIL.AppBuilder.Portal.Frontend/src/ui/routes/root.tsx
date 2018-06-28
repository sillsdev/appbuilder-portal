import * as React from 'react';
import { Route, Link } from 'react-router-dom';
import Notifications from 'react-notify-toast';


import IndexRoute, { pathName as rootPath } from '@ui/routes/index';
import LoginRoute, { pathName as loginPath } from '@ui/routes/login';
import TasksRoute, { pathName as tasksPath} from '@ui/routes/tasks';
import AdminRoute, { pathName as adminPath} from '@ui/routes/admin';

export default class RootPage extends React.Component {
  render() {
    return (
      <div>
        <Notifications />

        <h1>render test</h1>

        <section>
          <Route exact path={rootPath} component={IndexRoute} />
          <Route exact path={loginPath} component={LoginRoute} />
          <Route exact path={tasksPath} component={TasksRoute} />
          <Route exact path={adminPath} component={AdminRoute} />
        </section>

        <footer>
          <Link to={loginPath}>Login?</Link>
          &nbsp;|&nbsp;
          <Link to={rootPath}>Home?</Link>
          &nbsp;|&nbsp;
          <Link to={tasksPath}>Tasks?</Link>
          &nbsp;|&nbsp;
          <Link to={adminPath}>Admin</Link>
        </footer>
      </div>
    );
  }
}
