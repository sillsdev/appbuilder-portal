import React, { Component } from 'react';

import './sidebar.scss';

export interface IProps {
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
}

class Sidebar extends Component<IProps> {

  render() {
    const { toggleSidebar, isSidebarVisible } = this.props;
    const sidebarDisplay = isSidebarVisible ? 'block' : 'none';

    return (
      <div className='sidebar' style={{ display: sidebarDisplay }}>

        <button className='close' onClick={toggleSidebar}>
          X (Close)
        </button>

        <a href='#'>Link 1</a>
        <a href='#'>Link 2</a>
      </div>
    );
  }
}

export default Sidebar;
