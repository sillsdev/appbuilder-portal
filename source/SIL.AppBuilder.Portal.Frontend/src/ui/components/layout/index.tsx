
import React, { Component } from 'react';
import Header from '@ui/components/header';

class Layout extends Component {

  render() {
    return (
      <div className='wrapper'>
        <Header />
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Layout;