import React, { useCallback } from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import { useDispatch } from 'react-redux';
import LocaleSwitch from '@ui/components/inputs/locale-switch';

import Notifications from './notifications';
import UserDropdown from './user-dropdown';

import { showSidebar as showSidebarInStore } from '@store/user-interface';

import { useRouter } from '~/lib/hooks';

import './header.scss';

function AppName() {
  const { history } = useRouter();

  return (
    <div data-test-header-appname className='item header logo' onClick={() => history.push('/')}>
      SCRIPTORIA
    </div>
  );
}

export default function Header() {
  const dispatch = useDispatch();
  const showSidebar = useCallback(
    () => dispatch(showSidebarInStore()),
    [dispatch]
  );

  return (
    <div data-test-header-menu className='ui menu menu-navbar'>
      <div className='ui container'>
        <div className='item sidebar-button-item d-lg-none'>
          <button
            data-test-header-sidebar-button
            className='ui button sidebar-button'
            onClick={showSidebar}
          >
            <MenuIcon />
          </button>
        </div>

        <AppName />

        <div className='right menu'>
          <div className='item'>
            <button data-test-header-addproject className='ui button add-project d-xs-none'>
              Add Project
            </button>
          </div>

          <div className='item'>
            <LocaleSwitch />
          </div>

          <div className='item'>
            <Notifications />
          </div>

          <div className='item'>
            <UserDropdown />
          </div>
        </div>
      </div>
    </div>
  );
}
