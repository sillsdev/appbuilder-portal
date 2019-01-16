import * as React from 'react';
import { IAttributeProps } from '@lib/dom';

type IProps = IAttributeProps & { isLoading: boolean };

export class LoadingWrapper extends React.PureComponent<IProps> {
  render() {
    const { isLoading, children, className, ...otherProps } = this.props;

    return (
      <div {...otherProps} className={`p-relative ${className}`}>
        {children}

        {isLoading && <div className='loading-overlay' />}
      </div>
    );
  }
}

export default LoadingWrapper;
