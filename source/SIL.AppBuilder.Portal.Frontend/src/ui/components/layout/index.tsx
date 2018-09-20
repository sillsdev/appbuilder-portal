import * as React from 'react';
import { connect } from 'react-redux';

import Header from '@ui/components/header';
import Sidebar from '@ui/components/sidebar';

import { showSidebar as showSidebarInStore, hideSidebar as hideSidebarInStore } from '@store/user-interface';

interface IOwnProps {
  isSidebarVisible: boolean;
  showSidebar: () => void;
  hideSidebar: () => void;
}

const mapStateToProps = ({ ui }) => ({
  isSidebarVisible: ui.isSidebarVisible
});

const mapDispatchToProps = dispatch => {
  return {
    showSidebar: () => dispatch(showSidebarInStore()),
    hideSidebar: () => dispatch(hideSidebarInStore())
  };
};

// TODO: find a better way to implemented this using CSS
const SM_BREAKPOINT = 768;

class Layout extends React.Component<IOwnProps> {

  updateSidebar = () => {

    const { showSidebar, isSidebarVisible } = this.props;

    if (window.innerWidth > SM_BREAKPOINT && !isSidebarVisible) {
      showSidebar();
    }
  }

  componentDidMount() {
    this.updateSidebar();
    window.addEventListener('resize', this.updateSidebar);
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateSidebar);
  }

  render() {
    const { hideSidebar, isSidebarVisible } = this.props;

    const sidebarStatus = isSidebarVisible ? 'is-sidebar-visible' : 'is-sidebar-hidden';

    return (
      <div className='flex-row-lg flex-grow h-100vh no-overflow'>

        <div className={`
          sidebar-container flex-row transition-all h-100vh
          align-items-stretch ${sidebarStatus}`}>

          <Sidebar className='sidebar-wrapper' closeSidebar={hideSidebar} />

          <div className='no-select sidebar-underlay full-overlay' onClick={hideSidebar} />
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
