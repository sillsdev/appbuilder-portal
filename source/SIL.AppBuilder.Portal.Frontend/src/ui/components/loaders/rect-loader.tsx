import * as React from 'react';
import { IAttributeProps } from '@lib/dom';

import './styles.scss';

export default class RectLoader extends React.PureComponent<IAttributeProps> {
  render() {
    const { className, ...attributes } = this.props;

    return (
      <div className={`spinner ${className}`} {...attributes}>
        <div className='rect1' />
        <div className='rect2' />
        <div className='rect3' />
        <div className='rect4' />
        <div className='rect5' />
      </div>
    );
  }
}
