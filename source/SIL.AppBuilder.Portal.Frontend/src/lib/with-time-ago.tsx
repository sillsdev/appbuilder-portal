import * as React from 'react';
import TimeAgo from 'javascript-time-ago';
import { translate } from 'react-i18next';

const en = require('javascript-time-ago/locale/en');
const es = require('javascript-time-ago/locale/es');


export function withTimeAgo(WrappedComponent) {

  class HOC extends React.Component {

    state = {
      timeAgoFormatter: null
    };

    constructor(props) {
      super(props);

      TimeAgo.locale(en);
      TimeAgo.locale(es);

    }

    render() {

      const { i18n } = this.props;
      const timeAgoFormatter = new TimeAgo(i18n.default.language);

      return <WrappedComponent {...this.props} timeAgo={timeAgoFormatter} />;
    }
  }

  return translate('translations')(HOC);
}
