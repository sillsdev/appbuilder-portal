import * as React from 'react';
import { withRouter, RouteComponentProps  } from 'react-router-dom';
import {
  Container, Menu, Button,
} from 'semantic-ui-react';
import MenuIcon from '@material-ui/icons/Menu';
import { deleteToken } from '@lib/auth0';

import UserDropdown from './user-dropdown';
import Notifications from './notifications';

import LocaleSelect from '@ui/components/inputs/locale-select';

import './header.scss';

export interface Props {
  showSidebar: () => void;
}

export type IProps =
  & Props
  & RouteComponentProps<{}>;

class Header extends React.Component<IProps> {

  handleSignOut = () => {
    const { history } = this.props;

    deleteToken();
    history.push('/login');
  }

  render() {
    const { history, showSidebar } = this.props;

    return (
      <Menu data-test-header-menu className='menu-navbar'>
        <Container>
          <Menu.Item className='sidebar-button-item d-sm-none'>
            <Button
              data-test-header-sidebar-button
              className='sidebar-button'
              onClick={showSidebar}>
              <MenuIcon />
            </Button>
          </Menu.Item>

          <Menu.Item
            data-test-header-appname header
            className='logo'
            onClick={() => history.push('/')}>
            SCRIPTORIA
          </Menu.Item>

          <Menu.Menu position='right'>
            <Menu.Item>
              <Button
                data-test-header-addproject
                className='add-project d-xs-none'>
                Add Project
              </Button>
            </Menu.Item>

            <Menu.Item>
              <LocaleSelect/>
            </Menu.Item>

            <Menu.Item>
              <Notifications/>
            </Menu.Item>

            <Menu.Item>
              <UserDropdown/>
            </Menu.Item>
          </Menu.Menu>
        </Container>
      </Menu>
    );
  }
}

export default withRouter(Header);
