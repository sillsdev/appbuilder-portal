import { useState, useContext, useMemo, useCallback } from 'react';
import { __RouterContext, RouteChildrenProps } from 'react-router';
import { attributesFor } from 'react-orbitjs';
import useInterval from 'react-useinterval';
import moment from 'moment-timezone';

import { useTranslations } from '~/lib/i18n';
import { useCurrentUser } from '~/data/containers/with-current-user';

export function useRouter<Params extends { [K in keyof Params]?: string } = {}>() {
  return useContext<RouteChildrenProps<Params>>(__RouterContext);
}

export function useMemoIf<TReturn>(fn: () => TReturn, condition, memoOn) {
  return useMemo<TReturn | undefined>(() => {
    if (condition) {
      return fn();
    }
  }, [condition, fn]);
}

export function useToggle(defaultValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(defaultValue);
  const toggle = () => setValue(!value);

  return [value, toggle];
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

export function useConditionalPoll(untilFn: () => Promise<boolean>, interval = 1000) {
  const [isFinished, setFinished] = useState(false);

  const callback = useCallback(async () => {
    if (isFinished) {
      return;
    }

    const result = await untilFn();

    if (result) {
      setFinished(true);
    }
  }, [isFinished, untilFn]);

  useInterval(callback, interval);
  return { isFinished };
}
