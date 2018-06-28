
import React, { Component } from 'react';
import Header from '@ui/components/header';

import './layout.scss';

class Layout extends Component {
  render() {
    return (
      <div className='wrapper'>
        <Header />
        <div>
          <button onClick={(e) => {
           // this.setState({ visible: !this.state.visible });
          }}>Open (burger)</button>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Layout;