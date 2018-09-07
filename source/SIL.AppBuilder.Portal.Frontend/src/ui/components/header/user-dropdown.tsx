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
import { ResourceObject } from 'jsonapi-typescript';
import { USERS_TYPE, idFromRecordIdentity } from '@data';
import { withLogout } from '@data/containers/with-logout';

interface IOwnProps {
  toggleSidebar: () => void;
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
}

export type IProps =
  & IOwnProps
  & RouteComponentProps<{}>
  & i18nProps;

class UserDropdown extends React.Component<IProps> {
  render() {
    const { t, currentUser, logout } = this.props;

    const currentUserId = idFromRecordIdentity(currentUser as any);

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
            to={`/users/${currentUserId}/edit`}
          />
          <Dropdown.Item text={t('header.help')} />

          <Dropdown.Item
            data-test-logout
            text={t('header.signOut')}
            onClick={logout}/>

        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default compose(
  withRouter,
  withCurrentUser(),
  translate('translations'),
  withLogout
)(UserDropdown);
