import React, { useEffect, useCallback, useRef } from 'react';
import NotificationIcon from '@material-ui/icons/Notifications';
import NotificationActiveIcon from '@material-ui/icons/NotificationsActive';

import Row from './row';

import { useTranslations } from '~/lib/i18n';

import { useToggle } from '~/lib/hooks';

import { useOrbit, attributesFor } from 'react-orbitjs';

import { NotificationResource } from '~/data';

import { useLiveData } from '~/data/live';

import { useCurrentUser } from '~/data/containers/with-current-user';

import { useCollectionDataActions } from '~/data/containers/resources/notification/with-collection-data-actions';

import { preventDefault } from '~/lib/dom';

interface ISubscribedTo {
  notifications: NotificationResource[];
}

export default function Notifications() {
  useLiveData('notifications');

  const { t } = useTranslations();
  const { currentUser } = useCurrentUser();
  const [visible, toggleVisible] = useToggle(false);
  const element = useRef<HTMLElement>();

  const {
    subscriptions: { notifications },
  } = useOrbit<ISubscribedTo>({
    notifications: (q) =>
      q
        .findRecords('notification')
        .filter({ relation: 'user', record: currentUser })
        .sort('-dateCreated', '-dateRead'),
  });

  const { clearAll, markAllAsViewed } = useCollectionDataActions(notifications);

  const haveAllNotificationsBeenSeen = notifications.every(
    (n) => attributesFor(n).dateRead !== null
  );
  const hasNotifications = notifications.length > 0;

  const toggle = useCallback(
    (e) => {
      const isWithinDropdown = element.current && element.current.contains(e.target);

      if (visible && isWithinDropdown) {
        // the click is inside the notifications dropdown,
        // we do not toggle.
        return;
      }

      if (visible) {
        markAllAsViewed();
        // refetch();
      }

      toggleVisible();
    },
    [visible]
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener('click', toggle);

      return () => document.removeEventListener('click', toggle);
    }
  }, [visible]);

  const isMenuVisible = visible ? 'visible' : '';

  return (
    <div
      ref={(node) => (element.current = node)}
      className='ui top right pointing dropdown'
      data-test-header-notification
    >
      <div
        data-test-notification-trigger
        data-test-notification-active={!haveAllNotificationsBeenSeen}
        style={{ position: 'relative' }}
        onClick={toggle}
      >
        {haveAllNotificationsBeenSeen ? <NotificationIcon /> : <NotificationActiveIcon />}
      </div>

      <div className={`ui menu transition notifications ${isMenuVisible}`}>
        {hasNotifications && (
          <>
            <div className='notification-buttons'>
              <a
                href='#'
                data-test-clear-all
                onClick={preventDefault(() => {
                  clearAll();
                  // refetch();
                })}
              >
                {t('header.clearAll')}
              </a>
            </div>

            <div className={notifications.length > 3 ? 'scrollable-menu' : ''}>
              {notifications.map((notification) => (
                <Row key={notification.id} notification={notification} />
              ))}
            </div>
          </>
        )}

        {!hasNotifications && (
          <div className='notification-no-data'>{t('header.emptyNotifications')}</div>
        )}
      </div>
    </div>
  );
}
