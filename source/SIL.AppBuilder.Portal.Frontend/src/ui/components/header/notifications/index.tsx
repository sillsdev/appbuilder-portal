import { compose } from 'recompose';

import Display from './display';
import { withData, DataProps, ActionProps } from './data';
import { withTranslations, i18nProps } from '@lib/i18n';

import './notification.scss';

export interface Props {
  timeAgo: any;
}

export type IProps =
  & Props
  & DataProps
  & ActionProps
  & i18nProps;

export default compose(
  withData,
  withTranslations
)(Display);
