import * as React from 'react';
import * as uuid from 'uuid';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import { getAuth0LockInstance, setToken, showLock, hideLock } from '@lib/auth0';

export interface IProps {
  afterLogin: () => void;
}

class Lock extends React.Component<IProps & i18nProps> {
  state = { loggedIn: false };
  lockRef: any;
  lockId: any;

  constructor(props) {
    super(props);

    this.lockRef = React.createRef();
    this.lockId = uuid();
  }

  componentDidMount() {
    this.configureAuth0();
  }

  componentWillUnmount() {
    hideLock();
  }

  configureAuth0() {
    const { t } = this.props;

    const auth0Options = {
      container: this.lockRef.current.id,
      languageDictionary: {
        // auth0 has a ton of entries here...
        // https://github.com/auth0/lock/blob/master/src/i18n/en.js
        title: t('auth.title'),
        signUpLabel: t('auth.signup'),
        loginLabel: t('auth.login'),
        loginSubmitLabel: t('auth.login'),
      },
    };

    const lock = getAuth0LockInstance(auth0Options);

    lock.on('authenticated', (authResult) => {
      setToken(authResult.idToken);

      lock.hide();
      this.props.afterLogin();
    });

    showLock();
  }

  render() {
    return <div ref={this.lockRef} id={this.lockId} />;
  }
}

export default compose<IProps & i18nProps, IProps>(withTranslations)(Lock);
