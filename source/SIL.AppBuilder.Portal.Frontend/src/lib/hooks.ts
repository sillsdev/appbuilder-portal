import { useState, useContext } from 'react';
import { __RouterContext } from 'react-router';
import { attributesFor } from 'react-orbitjs';
import moment from 'moment-timezone';

import { useTranslations } from '~/lib/i18n';

import { useCurrentUser } from '~/data/containers/with-current-user';

export function useRouter() {
  return useContext(__RouterContext);
}

export function useToggle(defaultValue: boolean = false) {
  const [value, setValue] = useState(defaultValue);

  return [value, () => setValue(!value)];
}

export function useMoment() {
  const { i18n } = useTranslations();
  const { currentUser } = useCurrentUser();
  const { timezone } = attributesFor(currentUser);

  moment.locale(i18n.language);

  return {
    moment,
    timezone: timezone || moment.tz.guess(),
  };
}

export function useTimezoneFormatters() {
  const { moment, timezone } = useMoment();

  const inTz = (dateTime) => {
    if (!dateTime.includes('Z')) {
      dateTime += 'Z';
    }

    return moment(dateTime).tz(timezone);
  };

  return {
    timeAgo(dateTime: string, label = true) {
      return moment(inTz(dateTime)).fromNow(!label);
    },
    relativeTimeAgo(dateTime: string) {
      return moment(inTz(dateTime)).fromNow(true);
    },
    format(dateTime, format = 'LLL') {
      return moment(inTz(dateTime)).format(format);
    },
  };
}
