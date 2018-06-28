
import React, { Component } from 'react';
import Header from '@ui/components/header';

import './layout.scss';

class Layout extends Component {

  state = { visible: false }

  handleButtonClick = () => this.setState({ visible: !this.state.visible })

  handleSidebarHide = () => this.setState({ visible: false })

  render() {

    const { visible } = this.state

    console.log(visible);

    return (
      <div className='wrapper'>
        <div className='sidebar' style={{ display: visible ? 'block' : 'none'}}>
          <button className='close' onClick={(e) => {
            this.setState({ visible: false })
          }}>X (Close)</button>
          <a href='#'>Link 1</a>
          <a href='#'>Link 2</a>
        </div>
        <Header />
        <div>
          <button onClick={(e) => {
            this.setState({ visible: !this.state.visible });
          }}>Open (burger)</button>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Layout;