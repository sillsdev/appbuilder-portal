import { compose } from 'recompose';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';

import { withData, DataProps, ActionProps } from './data';

import { withTranslations } from '@lib/i18n';

import Display from './display';
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
