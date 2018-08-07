import * as React from 'react';

import Message from './header-message';

export interface IProps {
  error?: any;
}

export default class PageError extends React.Component<IProps> {
  render() {
    const { error } = this.props;

    return (
      <div className='w-100 h-100vh flex-row justify-content-center align-items-center'>
        <Message error={error} />
      </div>
    );
  }
}
