import * as React from 'react';

import RectLoader from './rect-loader';

interface IProps {
  loaderProps?: any;
}

export default class PageLoader extends React.PureComponent<IProps> {
  render() {
    const loaderProps = this.props.loaderProps || {};

    return (
      <div className='flex-row flex-grow justify-content-center align-items-center'>
        <RectLoader className='m-t-xxl m-b-xxl' {...loaderProps} />
      </div>
    );
  }
}
