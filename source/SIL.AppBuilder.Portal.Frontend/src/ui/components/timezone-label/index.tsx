import * as React from 'react';
import { compose } from 'recompose';

import {
  withMomentTimezone,
  IProvidedProps as TimezoneProps
} from '@lib/with-moment-timezone';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  dateTime: string;
  emptyLabel?: string;
}

type IProps =
  & IOwnProps
  & TimezoneProps
  & i18nProps;

class TimezoneLabel extends React.Component<IProps> {

  render() {

    const { dateTime, emptyLabel, moment, timezone, t } = this.props;
    let dateTimeZ = dateTime;

    if (!dateTime) {
      return emptyLabel || '';
    }

    if (!dateTime.includes('Z')) {
      dateTimeZ += 'Z';
    }
    const dateTimeTZ = moment(dateTimeZ).tz(timezone);

    return (
      <span title={dateTimeTZ.format('MMMM Do YYYY, h:mm:ss')}>
        {dateTimeTZ.fromNow(true)}
      </span>
    );
  }
}

export default compose(
  withTranslations,
  withMomentTimezone
)(TimezoneLabel);