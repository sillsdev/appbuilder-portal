import * as React from 'react';
import { Route, Link } from 'react-router-dom';

import IndexRoute, { pathName as rootPath } from '@ui/routes/index';
import LoginRoute, { pathName as loginPath } from '@ui/routes/login';

export default class RootPage extends React.Component {
  render() {
    return (
      <div>
        <h1>render test</h1>

        <section>
          <Route exact path={rootPath} component={IndexRoute} />
          <Route exact path={loginPath} component={LoginRoute} />
        </section>

        <footer>
          <Link to={loginPath}>Login?</Link>
          &nbsp;|&nbsp;
          <Link to={rootPath}>Home?</Link>
        </footer>
      </div>
    );
  }
}
