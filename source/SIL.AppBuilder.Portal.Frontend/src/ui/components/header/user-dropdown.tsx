import * as React from 'react';
import { withRouter, RouteComponentProps, NavLink  } from 'react-router-dom';
import {
  Dropdown
} from 'semantic-ui-react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import { UserAttributes } from '@data/models/user';
import { withCurrentUser } from '@data/containers/with-current-user';

import { deleteToken, getPictureUrl } from '@lib/auth0';
import './header.scss';

interface IOwnProps {
  toggleSidebar: () => void;
  currentUser: JSONAPI<UserAttributes>;
}

export type IProps =
  & IOwnProps
  & RouteComponentProps<{}>
  & i18nProps;

class UserDropdown extends React.Component<IProps> {

  handleSignOut = () => {
    const { history } = this.props;

    deleteToken();
    history.push('/login');
  }

  render() {
    const { t, currentUser } = this.props;

    return (
      <Dropdown
        data-test-header-avatar
        pointing='top right'
        icon={null}
        trigger={
          <span data-test-user-dropdown-trigger className='image-fill-container'>
            <img className='round header-icon' src={getPictureUrl()} />
          </span>
        }
      >
        <Dropdown.Menu>
          <Dropdown.Item
            data-test-profile
            text={t('header.myProfile')}
            as={NavLink}
            to={`/users/${currentUser.id}/edit`}
          />
          <Dropdown.Item text={t('header.help')} />

          <Dropdown.Item
            data-test-logout
            text={t('header.signOut')}
            onClick={this.handleSignOut}/>

        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default compose(
  withRouter,
  withCurrentUser(),
  translate('translations'),
)(UserDropdown);
