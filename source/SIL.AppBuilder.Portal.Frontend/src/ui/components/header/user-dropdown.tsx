import * as React from 'react';
import { compose } from 'recompose';
import { Dropdown } from 'semantic-ui-react';
import { ResourceObject } from 'jsonapi-typescript';
import { withRouter, RouteComponentProps, NavLink  } from 'react-router-dom';

import { getPictureUrl } from '@lib/auth0';
import { UserAttributes } from '@data/models/user';
import { USERS_TYPE, idFromRecordIdentity } from '@data';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withLogout, IProvidedProps as ILogoutProps } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';

import './header.scss';

interface IOwnProps {
  toggleSidebar: () => void;
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
}

export type IProps =
  & IOwnProps
  & RouteComponentProps<{}>
  & i18nProps
  & ILogoutProps;

class UserDropdown extends React.Component<IProps> {
  render() {
    const { t, currentUser, logout } = this.props;

    const currentUserId = idFromRecordIdentity(currentUser as any);

    return (
      <Dropdown
        data-test-header-avatar
        pointing='top right'
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

          <a
            className='item'
            target='_blank'
            href='http://software.sil.org/scriptureappbuilder/service/help/'>
            {t('header.help')}
          </a>

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
  withTranslations,
  withLogout
)(UserDropdown);
