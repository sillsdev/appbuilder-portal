import * as React from 'react';
import { compose } from 'recompose';
import * as moment from 'moment-timezone';

import { withCurrentUser, IProvidedProps as CurrentUserProps } from '@data/containers/with-current-user';
import { withTranslations } from './i18n';
import { attributesFor } from '../data/helpers';

export interface IProvidedProps {
  moment: moment.Moment;
  timezone: string;
}

export function withMomentTimezone(WrappedComponent) {

  class DataWrapper extends React.Component<CurrentUserProps> {

    render() {

      const { i18n, currentUser } = this.props;
      const { timezone } = attributesFor(currentUser);

      moment.locale(i18n.default.language);

      const timeProps = {
        moment,
        timezone
      };

      return <WrappedComponent {...this.props} {...timeProps} />;
    }
  }

  return compose(
    withTranslations,
    withCurrentUser()
  )(DataWrapper);
}
