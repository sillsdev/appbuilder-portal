import * as React from 'react';
import { compose } from 'recompose';
import { Popup } from 'semantic-ui-react';

import {
  withMomentTimezone,
  IProvidedProps as TimezoneProps
} from '@lib/with-moment-timezone';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  dateTime: string;
  emptyLabel?: string;
  className?: string;
}

type IProps =
  & IOwnProps
  & TimezoneProps
  & i18nProps;

class Timezone extends React.Component<IProps> {

  render() {

    const { dateTime, emptyLabel, moment, timezone, className } = this.props;
    let dateTimeZ = dateTime;

    if (!dateTime) {
      return emptyLabel || '';
    }

    if (!dateTime.includes('Z')) {
      dateTimeZ += 'Z';
    }
    const dateTimeTZ = moment(dateTimeZ).tz(timezone);

    const trigger = (
      <span className={className}>
        {dateTimeTZ.fromNow(true)}
      </span>
    );

    return (
      <Popup trigger={trigger} content={dateTimeTZ.format('MMMM Do YYYY, h:mm:ss')}/>
    );
  }
}

export default compose(
  withTranslations,
  withMomentTimezone
)(Timezone);