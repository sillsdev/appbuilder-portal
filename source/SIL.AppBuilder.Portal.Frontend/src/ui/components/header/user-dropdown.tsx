import * as React from 'react';
import { withRouter, RouteComponentProps  } from 'react-router-dom';
import {
  Container, Menu, Button,
  Dropdown, Image, Icon
} from 'semantic-ui-react';


import { deleteToken } from '@lib/auth0';
import './header.scss';

export type IProps =
  & { toggleSidebar: () => void }
  & RouteComponentProps<{}>;

class UserDropdown extends React.Component<IProps> {

  handleSignOut = () => {
    const { history } = this.props;

    deleteToken();
    history.push('/login');
  }

  render() {
    const { history, toggleSidebar } = this.props;

    return (
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
          <Dropdown.Item
            data-test-profile
            text='My Profile'
            onClick={e => history.push('/profile')}
          />
          <Dropdown.Item text='Notification Settings' />
          <Dropdown.Item text='Help' />

          <Dropdown.Item
            data-test-logout
            text='Sign Out'
            onClick={this.handleSignOut}/>

        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default withRouter(UserDropdown);
