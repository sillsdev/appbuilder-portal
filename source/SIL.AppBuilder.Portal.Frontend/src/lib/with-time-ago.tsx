import * as React from 'react';
import TimeAgo from 'javascript-time-ago';

const en = require('javascript-time-ago/locale/en');
const es = require('javascript-time-ago/locale/es');

import i18n from '../translations';


export function withTimeAgo(WrappedComponent) {

  class HOC extends React.Component {

    state = {
      timeAgoFormatter: null
    };

    constructor(props) {
      super(props);

      TimeAgo.locale(en);
      TimeAgo.locale(es);

      this.state = {
        timeAgoFormatter: new TimeAgo(i18n.default.language)
      }
    }

    render() {
      return <WrappedComponent {...this.props} timeAgo={this.state.timeAgoFormatter} />;
    }
  }

  return HOC;
}
