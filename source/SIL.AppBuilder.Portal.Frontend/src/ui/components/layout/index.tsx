import * as React from 'react';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Header from '@ui/components/header';
import Sidebar from '@ui/components/sidebar';
import {
  showSidebar as showSidebarInStore,
  hideSidebar as hideSidebarInStore,
} from '@store/user-interface';

function Layout({ children }) {
  const isSidebarVisible = useSelector((state: any) => state.ui.isSidebarVisible);
  const dispatch = useDispatch();
  const hideSidebar = useCallback(() => dispatch(hideSidebarInStore()), [dispatch]);

  const sidebarStatus = isSidebarVisible ? 'is-sidebar-visible' : 'is-sidebar-hidden';

  return (
    <div className='flex-row-lg flex-grow h-100vh no-overflow'>
      <div
        className={`
        sidebar-container flex-row transition-all h-100vh
        align-items-stretch ${sidebarStatus}`}
      >
        <Sidebar className='sidebar-wrapper' closeSidebar={hideSidebar} />

        <div className='no-select sidebar-underlay full-overlay' onClick={hideSidebar} />
      </div>

      <div className={`flex-column flex-grow h-100vh overflows ${sidebarStatus}`}>
        <Header />

        {children}
      </div>
    </div>
  );
}

export const withLayout = (Component) => (props) => (
  <Layout>
    <Component {...props} />
  </Layout>
);

export default Layout;
