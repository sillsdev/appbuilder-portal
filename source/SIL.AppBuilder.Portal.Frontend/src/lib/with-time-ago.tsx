import * as React from 'react';
import TimeAgo from 'javascript-time-ago';

const en = require('javascript-time-ago/locale/en');

export function withTimeAgo(WrappedComponent) {

  class HOC extends React.Component {

    state = {
      timeAgoFormatter: null
    }

    constructor(props) {
      super(props);

      TimeAgo.locale(en);

      this.state = {
        timeAgoFormatter: new TimeAgo()
      }
    }

    render() {
      return <WrappedComponent {...this.props} timeAgo={this.state.timeAgoFormatter} />;
    }
  }

  return HOC;
};
