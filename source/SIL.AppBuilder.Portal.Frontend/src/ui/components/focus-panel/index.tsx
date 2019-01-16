import * as React from 'react';

export interface IProps {
  title: string;
}

export default class FocusPanel extends React.Component<IProps> {
  render() {
    const { title, children } = this.props;

    return (
      <div className='bg-blue flex h-100vh flex-grow justify-content-center align-items-center'>
        <div className='bg-white gray-border'>
          <div className='p-lg p-l-lg p-r-lg'>
            <h1 className='bold gray-text'>{title}</h1>
          </div>
          <hr />

          <div className='p-lg'>{children}</div>
        </div>
      </div>
    );
  }
}
