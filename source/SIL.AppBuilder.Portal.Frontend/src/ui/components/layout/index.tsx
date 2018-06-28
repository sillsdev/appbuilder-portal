
import React, { Component } from 'react';
import Header from '@ui/components/header';
import Sidebar from '@ui/components/sidebar';

import './layout.scss';

class Layout extends Component {
  render() {
    return (
      <div className='wrapper'>
        <Sidebar />
        <Header />
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Layout;