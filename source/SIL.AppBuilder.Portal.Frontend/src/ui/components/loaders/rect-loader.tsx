import * as React from 'react';

import './styles.scss';

export default class RectLoader extends React.Component {
  render() {
    return (
      <div className="spinner m-t-xxl m-b-xxl">
        <div className="rect1" />
        <div className="rect2" />
        <div className="rect3" />
        <div className="rect4" />
        <div className="rect5" />
      </div>
    );
  }
}
