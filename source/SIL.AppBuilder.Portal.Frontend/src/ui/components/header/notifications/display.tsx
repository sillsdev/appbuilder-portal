import React from 'react';
import NotificationIcon from '@material-ui/icons/Notifications';
import NotificationActiveIcon from '@material-ui/icons/NotificationsActive';

import Row from './row';

import { useTranslations } from '~/lib/i18n';

import { useToggle } from '~/lib/hooks';

import { useOrbit, attributesFor } from 'react-orbitjs/dist';

import { NotificationResource } from '~/data';

import { useCollectionDataActions } from '~/data/containers/resources/notification/with-collection-data-actions';

import { preventDefault } from '~/lib/dom';

import { useLiveData } from '~/data/live';

interface ISubscribedTo {
  notifications: NotificationResource[];
}

export default function Notifications({ refetch }) {
  useLiveData('notifications');

  const { t } = useTranslations();
  const [visible, toggleVisible] = useToggle(false);

  const {
    subscriptions: { notifications },
  } = useOrbit<ISubscribedTo>({
    notifications: (q) => q.findRecords('notification').sort('-dateCreated', '-dateRead'),
  });

  const { clearAll, markAllAsViewed } = useCollectionDataActions(notifications);

  const haveAllNotificationsBeenSeen = notifications.every(
    (n) => attributesFor(n).dateRead !== null
  );
  const hasNotifications = notifications.length > 0;

  const toggle = () => {
    if (visible) {
      markAllAsViewed();
      // refetch();
    }

    toggleVisible();
  };

  const isMenuVisible = visible ? 'visible' : '';

  return (
    <div className='ui top right pointing dropdown' data-test-header-notification>
      <div
        style={{ zIndex: 1 }}
        className={`full-overlay transition ${visible ? 'visible invisible' : ''}`}
        onClick={toggle}
      />

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
