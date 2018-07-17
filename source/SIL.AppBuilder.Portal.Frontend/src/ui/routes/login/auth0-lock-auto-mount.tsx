import * as React from 'react';
import * as uuid from 'uuid';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps } from 'react-i18next';

import { getAuth0LockInstance, setToken, showLock, hideLock } from '@lib/auth0';

export interface IProps {
  afterLogin: () => void;
}

class Lock extends React.Component<IProps & InjectedTranslateProps> {
  state = { loggedIn : false };
  lockRef: any;

  constructor(props) {
    super(props);

    this.lockRef = React.createRef();
  }

  componentDidMount() {
    const { t, i18n } = this.props;
    console.log(t, i18n);

    const lock = getAuth0LockInstance({
      container: this.lockRef.current.id,
      languageDictionary: {
        // auth0 has a ton of entries here...
        // https://github.com/auth0/lock/blob/master/src/i18n/en.js
        title: t('auth.title'),
        signUpLabel: t('auth.signup'),
        loginLabel: t('auth.login'),
        loginSubmitLabel: t('auth.login'),
      }
    });

    lock.on('authenticated', (authResult) => {
      setToken(authResult.idToken);

      lock.hide();
      this.props.afterLogin();
    });

    showLock();
  }

  componentWillUnmount() {
    hideLock();
  }

  render() {
    return <div ref={this.lockRef} id={uuid()} />;
  }
}

export default compose(
  translate('translations')
)(Lock);
