import * as React from 'react';
import { compose } from 'recompose';

import { InjectedTranslateProps as i18nProps } from 'react-i18next';
import UserTable from '@ui/components/user-table';
import { withTranslations } from '@lib/i18n';

import Display from './display';

export const pathName = '/users';

export default compose(
  withTranslations,
)(Display);
