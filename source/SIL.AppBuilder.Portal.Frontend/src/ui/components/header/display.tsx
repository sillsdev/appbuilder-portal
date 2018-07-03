import * as React from 'react';
import { withRouter, RouteComponentProps  } from 'react-router-dom';
import {
  Container, Menu, Button,
  Dropdown, Image, Icon
} from 'semantic-ui-react';


import { deleteToken } from '@lib/auth0';
import './header.scss';

export interface State {
}

export interface Props {
}

class Header extends React.Component<Props & RouteComponentProps<{}>, State> {
  handleSignOut = () => {
    const { history } = this.props;

    deleteToken();
    history.push('/login');
  }

  render() {
    const { history } = this.props;

    return (
      <Menu data-test-header-menu className='menu-navbar'>
        <Container>
          <Menu.Item data-test-header-appname header onClick={(e) => history.push('/')}>
            SCRIPTORIA
          </Menu.Item>

          <Menu.Menu position='right'>
            <Menu.Item>
              <Button data-test-header-addproject>Add Project</Button>
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
                  </span>}>

                <Dropdown.Menu>
                  <Dropdown.Item text='notification 1' />
                  <Dropdown.Item text='notification 2' />
                  <Dropdown.Item text='notification 3' />
                  <Dropdown.Item text='notification 4' />
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>

            <Menu.Item>
              <Dropdown
                data-test-header-avatar
                className='avatar-dropdown'
                pointing='top right'
                icon={null}
                trigger={
                  <span className='black-text font-lg'>
                    FL
                  </span>
                }
              >
                <Dropdown.Menu>
                  <Dropdown.Item text='My Profile' />
                  <Dropdown.Item text='Notification Settings' />
                  <Dropdown.Item text='Help' />
                  <Dropdown.Item
                    data-test-logout
                    text='Sign Out'
                    onClick={this.handleSignOut}/>
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>
          </Menu.Menu>
        </Container>
      </Menu>
    );
  }
}

export default withRouter(Header);
