import * as React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import { attributesFor } from '@data/helpers';

import { NotificationResource } from '@data';

import { useDataActions } from '@data/containers/resources/notification/with-data-actions';
import TimezoneLabel from '@ui/components/labels/timezone';

import { preventDefault } from '~/lib/dom';

export default function({ notification }) {
  const { markAsSeen, clear } = useDataActions(notification);
  const { message, dateCreated, dateRead } = attributesFor(notification);

  const isViewed = dateRead !== null;
  const viewState = isViewed ? 'seen' : 'not-seen';

  return (
    <div
      data-test-notification
      className={`notification-item ${viewState}`}
      onClick={preventDefault(markAsSeen)}
    >
      <a
        data-test-notification-close-one
        className='close'
        href='#'
        onClick={preventDefault(clear)}
      >
        <CloseIcon />
      </a>
      <p className={!isViewed ? 'bold' : ''}>{message}</p>
      <div className='time'>
        <TimezoneLabel dateTime={dateCreated} />
      </div>
    </div>
  );
}
