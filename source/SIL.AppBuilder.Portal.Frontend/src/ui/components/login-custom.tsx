import * as React from 'react';
import { withTemplateHelpers, Mut } from 'react-action-decorators';

import { login as loginToAuth0 } from '@lib/auth0';

export interface IProps {
  afterLogin: () => void;
}

export interface IState {
  isPasswordFieldVisible: boolean;
  username?: string;
  password?: string;
}

const EMAIL_REGEX = /(.+)@(.+)\.(.+)/;

@withTemplateHelpers
export default class Lock extends React.Component<IProps, IState> {
  mut: Mut;
  state = { loggedIn: false, isPasswordFieldVisible: false, username: '', password: '' };

  showPassword = () => {
    this.setState({ isPasswordFieldVisible: true });
  }

  isEmailValid = () => {
    const { username } = this.state;

    return EMAIL_REGEX.test(username);
  }

  isFormValid = () => {
    const { password } = this.state;

    return (password && password.length > 0 && this.isEmailValid());
  }

  onFormSubmit = (e) => {
    e.preventDefault();
    const { isPasswordFieldVisible } = this.state;

    if (isPasswordFieldVisible) {
      this.login();
    } else {
      this.showPassword();
    }
  }

  login = async () => {
    const { username, password } = this.state;

    await loginToAuth0(username, password);

    this.props.afterLogin();
  }


  render() {
    const { mut } = this;
    const { isPasswordFieldVisible, username, password } = this.state;

    return (
      <div className='flex h-100 flex-grow justify-content-center align-items-center'>
        <div className='bg-white gray-border'>
          <div className='p-lg p-l-xl p-r-xl flex-column justify-content-center align-items-center'>
            <h1 className='bold'>Welcome to Scriptura</h1>
          </div>
          <hr />
          <div className='p-lg'>
            <form className='ui form m-b-lg' onSubmit={this.onFormSubmit}>
              <div className='field ui input m-b-lg block w-100'>
                <label>Email Address</label>
                <input required
                  type='email'
                  value={username}
                  onChange={mut('username')}
                  className='ui input w-100'
                  placeholder='example@domain.com'
                 />
              </div>

              { isPasswordFieldVisible && (
                <div className='ui input block w-100'>
                  <label>Password</label>
                  <input required autoFocus
                    type='password'
                    value={password}
                    onChange={mut('password')}
                    className='ui input w-100'
                    placeholder='**********'
                  />
                </div>
              )}
            </form>

            { !isPasswordFieldVisible && (
              <button
                disabled={!this.isEmailValid()}
                className='ui button w-100'
                type='submit'
                onClick={this.showPassword}>
                Next
              </button>
            )}
            { isPasswordFieldVisible && (
              <button
                type='submit'
                disabled={!this.isFormValid()}
                className='ui button w-100'
                onClick={this.login}>
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
