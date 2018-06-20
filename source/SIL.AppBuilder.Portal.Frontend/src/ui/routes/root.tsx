import * as React from 'react';
import { Route } from 'react-router-dom';

import IndexRoute from '@ui/routes/index';

export default class RootPage extends React.Component {
  render() {
    return (
      <div>
        <h1>render test</h1>

        <section>
          <Route exact path='/' component={IndexRoute} />
        </section>
      </div>
    );
  }
}
