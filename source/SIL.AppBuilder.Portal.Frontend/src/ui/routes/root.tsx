import * as React from 'react';
import { Route, Link } from 'react-router-dom';

import IndexRoute, { pathName as rootPath } from '@ui/routes/index';
import LoginRoute, { pathName as loginPath } from '@ui/routes/login';
import TasksRoute, { pathName as tasksPath} from '@ui/routes/tasks';

export default class RootPage extends React.Component {
  render() {
    return (
      <div>
        <h1>render test</h1>

        <section>
          <Route exact path={rootPath} component={IndexRoute} />
          <Route exact path={loginPath} component={LoginRoute} />
          <Route exact path={tasksPath} component={TasksRoute} />
        </section>

        <footer>
          <Link to={loginPath}>Login?</Link>
          &nbsp;|&nbsp;
          <Link to={rootPath}>Home?</Link>
          &nbsp;|&nbsp;
          <Link to={tasksPath}>Tasks?</Link>
        </footer>
      </div>
    );
  }
}
