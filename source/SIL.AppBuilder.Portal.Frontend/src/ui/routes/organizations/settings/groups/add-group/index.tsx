import * as React from 'react';
import { compose } from 'recompose';

import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import Display from './display';
import { withData } from './with-data';


export default compose(
  translate('translations'),
  withData,
)(Display);
