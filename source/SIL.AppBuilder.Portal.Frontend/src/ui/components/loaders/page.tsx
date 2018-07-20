import * as React from 'react';

import './styles.scss';

export default class PageLoader extends React.Component {
  render() {
    return (
      <div className='flex-row flex-grow justify-content-center align-items-center'>
        <div className="spinner m-t-xxl m-b-xxl">
          <div className="rect1"></div>
          <div className="rect2"></div>
          <div className="rect3"></div>
          <div className="rect4"></div>
          <div className="rect5"></div>
        </div>
      </div>
    )
  }
}
