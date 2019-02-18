import * as React from 'react';
import { Popup } from 'semantic-ui-react';

import { useTimezoneFormatters } from '~/lib/hooks';

interface IOwnProps {
  dateTime: string;
  emptyLabel?: string;
  className?: string;
}

type IProps = IOwnProps;

export default function RelativeTimeLabelInZone({ dateTime, emptyLabel, className }: IProps) {
  const { timeAgo, format } = useTimezoneFormatters();

  if (!dateTime) {
    return emptyLabel || '';
  }

  const trigger = <span className={className}>{timeAgo(dateTime, false)}</span>;

  return <Popup trigger={trigger} content={format(dateTime)} />;
}
