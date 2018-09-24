import * as React from 'react';
import { compose } from 'recompose';
import MenuIcon from '@material-ui/icons/Menu';
import { withRouter, RouteComponentProps  } from 'react-router-dom';

import LocaleSelect from '@ui/components/inputs/locale-select';
import Notifications from './notifications';
import UserDropdown from './user-dropdown';

import './header.scss';

export interface Props {
  showSidebar: () => void;
}

export type IProps =
  & Props
  & RouteComponentProps<{}>;

class Header extends React.Component<IProps> {

  render() {
    const { history, showSidebar } = this.props;

    return (
      <div data-test-header-menu className='ui menu menu-navbar'>
        <div className='ui container'>
          <div className='item sidebar-button-item d-lg-none'>
            <button
              data-test-header-sidebar-button
              className='ui button sidebar-button'
              onClick={showSidebar}>
              <MenuIcon />
            </button>
          </div>

          <div
            data-test-header-appname
            className='item header logo'
            onClick={() => history.push('/')}>
            SCRIPTORIA
          </div>

          <div className='right menu'>
            <div className='item'>
              <button
                data-test-header-addproject
                className='ui button add-project d-xs-none'>
                Add Project
              </button>
            </div>

            <div className='item'>
              <LocaleSelect/>
            </div>

            <div className='item'>
              <Notifications/>
            </div>

            <div className='item'>
              <UserDropdown/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withRouter
)(Header);
