import * as React from 'react';
import { IAttributeProps, filterForValidAttributes } from '@lib/dom';

import './styles.scss';

type IProps = IAttributeProps & { isLoading: boolean };

export class LoadingWrapper extends React.PureComponent<IProps> {
  render() {
    const { isLoading, children, className, ...otherProps } = this.props;
    const attributes = filterForValidAttributes(otherProps);

    return (
      <div {...attributes} className={`p-relative ${className}`}>
        {children}

        {isLoading && (
          <div className='loading-overlay'>
            <div className='dot-loader' />
          </div>
        )}
      </div>
    );
  }
}

export default LoadingWrapper;
