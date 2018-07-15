import * as React from 'react';
import { withRouter, RouteComponentProps  } from 'react-router-dom';
import {
  Container, Menu, Button,
  Dropdown, Image, Icon
} from 'semantic-ui-react';


import { deleteToken } from '@lib/auth0';
import OrganizationSwitcher from './organization-switcher';
import './header.scss';
import UserDropdown from './user-dropdown';

export interface Props {
  toggleSidebar: () => void;
}

class Header extends React.Component<Props & RouteComponentProps<{}>> {

  handleSignOut = () => {
    const { history } = this.props;

    deleteToken();
    history.push('/login');
  }

  render() {
    const { history, toggleSidebar } = this.props;

    return (
      <Menu data-test-header-menu className='menu-navbar'>
        <Container>
          <Menu.Item>
            <Button
              data-test-header-sidebar-button
              className='sidebar-button'
              onClick={toggleSidebar}>
              <Icon name='bars' size='large' />
            </Button>
          </Menu.Item>
          <Menu.Item
            data-test-header-appname header
            className='logo'
            onClick={(e) => history.push('/')}>
            SCRIPTORIA
          </Menu.Item>

          <Menu.Menu position='right'>

            <Menu.Item>
              <Button
                data-test-header-addproject
                className='add-project'>
                Add Project
              </Button>
            </Menu.Item>

            <Menu.Item>
              <OrganizationSwitcher />
            </Menu.Item>

            <Menu.Item className='notification-item'>
              <Dropdown
                data-test-header-notification
                className='notification-dropdown'
                pointing='top right'
                icon={null}
                trigger={
                  <span>
                    <Icon circular name='alarm' size='large' />
                  </span>
                }
              >
                <Dropdown.Menu>
                  <Dropdown.Item text='notification 1' />
                  <Dropdown.Item text='notification 2' />
                  <Dropdown.Item text='notification 3' />
                  <Dropdown.Item text='notification 4' />
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>

            <Menu.Item>
              <UserDropdown toggleSidebar={toggleSidebar}/>
            </Menu.Item>
          </Menu.Menu>
        </Container>
      </Menu>
    );
  }
}

export default withRouter(Header);
