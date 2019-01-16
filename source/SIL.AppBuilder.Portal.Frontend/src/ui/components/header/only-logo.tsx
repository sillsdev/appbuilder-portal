import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import './header.scss';

class Header extends React.Component<RouteComponentProps> {
  render() {
    const { history } = this.props;

    return (
      <div data-test-header-menu className='ui menu menu-navbar'>
        <div className='ui container'>
          <div className='item header logo' onClick={() => history.push('/')}>
            SCRIPTORIA
          </div>
        </div>
      </div>
    );
  }
}

export default compose(withRouter)(Header);
