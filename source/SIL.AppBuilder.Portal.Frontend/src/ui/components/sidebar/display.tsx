import React, { Component } from 'react';

import './sidebar.scss';

export interface IProps {
  isSidebarVisible: boolean,
  toggleSidebar: any
}

class Sidebar extends Component<IProps> {

  render() {
    return (
      <div className='sidebar' style={{ display: this.props.isSidebarVisible ? 'block' : 'none' }}>
        <button className='close' onClick={(e) => {
          this.props.toggleSidebar()
        }}>X (Close)</button>
        <a href='#'>Link 1</a>
        <a href='#'>Link 2</a>
      </div>
    );
  }
}

export default Sidebar;
