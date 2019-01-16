import * as React from 'react';
import { compose } from 'recompose';
import * as moment from 'moment-timezone';
import { withCurrentUserContext, ICurrentUserProps } from '@data/containers/with-current-user';

import { attributesFor } from '../data/helpers';

import { withTranslations, i18nProps } from './i18n';

export interface IProvidedProps {
  moment: moment.MomentTimezone;
  timezone: string;
}

type IProps = ICurrentUserProps & i18nProps;

export function withMomentTimezone(WrappedComponent) {
  class DataWrapper extends React.Component<IProps> {
    render() {
      const { i18n, currentUser } = this.props;
      const { timezone } = attributesFor(currentUser);

      moment.locale(i18n.language);

      const timeProps = {
        moment,
        timezone: timezone || moment.tz.guess(),
      };

      return <WrappedComponent {...this.props} {...timeProps} />;
    }
  }

  return compose<IProps, {}>(
    withTranslations,
    withCurrentUserContext
  )(DataWrapper);
}
