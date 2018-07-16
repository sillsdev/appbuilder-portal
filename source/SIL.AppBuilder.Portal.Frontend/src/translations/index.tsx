import * as React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';

import enUs from './locales/en-us.json';

// shorthand, because FormattedMessage is way too
// long with how often we'll be using it..
export function t(id: string, defaultMsg: string) {
  return <FormattedMessage id={id} defaultMessage={defaultMsg} />;
}
