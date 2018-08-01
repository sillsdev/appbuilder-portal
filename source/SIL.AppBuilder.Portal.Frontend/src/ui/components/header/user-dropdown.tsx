import * as React from 'react';
import { withRouter, RouteComponentProps  } from 'react-router-dom';
import {
  Dropdown
} from 'semantic-ui-react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';


import { deleteToken, getPictureUrl } from '@lib/auth0';
import './header.scss';

export type IProps =
  & { toggleSidebar: () => void }
  & RouteComponentProps<{}>
  & i18nProps;

class UserDropdown extends React.Component<IProps> {

  handleSignOut = () => {
    const { history } = this.props;

    deleteToken();
    history.push('/login');
  }

  render() {
    const { history, t } = this.props;

    return (
      <Dropdown
        data-test-header-avatar
        pointing='top right'
        icon={null}
        trigger={
          <span className='image-fill-container'>
            <img className='round header-icon' src={getPictureUrl()} />
          </span>
        }
      >
        <Dropdown.Menu>
          <Dropdown.Item
            data-test-profile
            text={t('header.myProfile')}
            onClick={e => history.push('/profile')}
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
  translate('translations')
)(UserDropdown);
