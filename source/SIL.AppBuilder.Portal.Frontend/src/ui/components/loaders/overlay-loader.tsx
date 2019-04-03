import React from 'react';
import RectLoader from './rect-loader';

export default function OverlayLoader(props: any) {
  return (
    <div
      className='flex-row flex-grow justify-content-conter align-items-center'
      {...props}
      style={{
        opacity: 0.5,
        background: 'white',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        ...(props.style || {})
      }}
    >
      <RectLoader style={{ margin: 'auto' }} />
    </div>
  );
}
