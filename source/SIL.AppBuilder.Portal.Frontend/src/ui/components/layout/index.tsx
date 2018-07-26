import * as React from 'react';
import { connect } from 'react-redux';

import Header from '@ui/components/header';
import Sidebar from '@ui/components/sidebar';

import { toggleSidebar } from '@store/user-interface';

const mapStateToProps = ({ ui }) => ({
  isSidebarVisible: ui.isSidebarVisible
});

const mapDispatchToProps = dispatch => ({
  toggleSidebar: () => dispatch(toggleSidebar())
});

class Layout extends React.Component {

  render() {
    const { toggleSidebar: toggle, isSidebarVisible } = this.props;

    const sidebarStatus = isSidebarVisible ? 'is-sidebar-visible' : 'is-sidebar-hidden';

    return (
      <div className='flex-row-lg flex-grow h-100vh no-overflow'>

        <div className={`
          sidebar-container flex-row transition-all h-100vh
          align-items-stretch ${sidebarStatus}`}>

          <Sidebar className='sidebar-wrapper' closeSidebar={toggle} />

          <div className='no-select sidebar-underlay full-overlay' onClick={toggle} />
        </div>

        <div className={`flex-column flex-grow h-100vh overflows ${sidebarStatus}`}>
          <Header />

          {this.props.children}
        </div>
      </div>
    );
  }
}

const ConnectedLayout = connect(
  mapStateToProps,
  mapDispatchToProps
)( Layout );

export const withLayout = (Component) => (props) => (
  <ConnectedLayout><Component { ...props } /></ConnectedLayout>
);

export default ConnectedLayout;
