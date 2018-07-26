import * as React from 'react';

import RectLoader from './rect-loader';

export default class PageLoader extends React.Component {
  render() {
    return (
      <div className='flex-row flex-grow justify-content-center align-items-center'>
        <RectLoader />
      </div>
    );
  }
}
