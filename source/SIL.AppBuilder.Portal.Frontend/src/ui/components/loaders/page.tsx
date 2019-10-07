import * as React from 'react';

import RectLoader from './rect-loader';

interface IProps {
  loaderProps?: any;
  sizeClass?: string;
}

export default class PageLoader extends React.PureComponent<IProps> {
  render() {
    const loaderProps = this.props.loaderProps || {};
    const sizeClass = this.props.sizeClass || 'm-t-xxl m-b-xxl';
    return (
      <div className='flex-row flex-grow justify-content-center align-items-center'>
        <RectLoader className={sizeClass} {...loaderProps} />
      </div>
    );
  }
}
