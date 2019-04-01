import * as React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { location, visit } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import { find } from 'lodash';
import { respondWithJsonApi, resetBrowser } from 'tests/helpers/index';
import {
  setupRequestInterceptor,
  useFakeAuthentication,
  setupApplicationTest,
} from 'tests/helpers';

import Page from './-page';
import { notifications } from './-factory';

describe('Acceptance | Notifications', () => {
  let page = null;
  let mockNotifications = notifications(10, 3);

  resetBrowser();
  useFakeAuthentication();
  setupApplicationTest();

  beforeEach(async function() {
    let requestCount = 0;
    this.server.get('/api/notifications').intercept((req, res) => {
      res.headers['Content-Type'] = 'application/vnd.api+json';
      res.status(200);

      if (requestCount === 0) {
        res.json({ data: mockNotifications });
      } else if (requestCount === 1) {
        res.json({
          data: mockNotifications.map((n) => {
            return {
              ...n,
              attributes: {
                ...n.attributes,
                'date-read': new Date(),
              },
            };
          }),
        });
      }

      requestCount++;
    });

    this.server.delete(['/api/notifications', '/api/notifications/:id']).intercept((req, res) => {
      res.status(204);
    });
    this.mockDelete(204, '/notifications');

    this.server.patch(['/api/notifications/:id', '/api/notifications']).intercept((req, res) => {
      const patch = JSON.parse(req.body);
      const n = find(mockNotifications, ['id', patch.data.id]);
      const responseJSON = { ...n };
      responseJSON.attributes = { ...responseJSON.attributes, ...patch.data.attributes };
      console.log('PATCH', req.url, req.body, req.params, patch, responseJSON);
      respondWithJsonApi(200, { data: responseJSON })(req, res);
    });
    page = new Page();

    await visit('/');
    await page.isPresent;
  });

  describe('menu interactions', () => {
    it('it indicates unread notifications', () => {
      expect(page.hasUnreadNotificationsIndicator).to.be.true;
    });

    describe('Open Notification dropdown', () => {
      beforeEach(async () => {
        await page.toggleNotificationMenu();
        await when(() => page.menu.isVisible);
      });

      it('is open', () => {
        expect(page.menu.isVisible).to.be.true;
      });

      describe('Click close on an inividual notification', () => {
        let notificationsCount;
        beforeEach(async () => {
          notificationsCount = page.notificationCount;
          await when(() => page.menu.isVisible);
          await page.menu.notifications(0).clear();
        });

        it('deletes the notification', () => {
          expect(page.notificationCount).to.equal(notificationsCount - 1);
        });
      });

      describe('Click individual notification', () => {
        beforeEach(async function() {
          await page.menu.notifications(0).click();
        });

        it('marks it as read', () => {
          expect(page.menu.notifications(0).isUnread).to.be.false;
        });
      });

      describe('Clears all notifications', () => {
        beforeEach(async () => {
          await page.menu.clearAll();
        });

        it('has no more notifications listed', () => {
          expect(page.notificationCount).to.eq(0);
        });
      });

      describe('Close menu', () => {
        // logic on this needs to be re-done, because we CANNOT be marking messages
        // as unread when they aren't even visible
        beforeEach(async () => {
          await when(() => page.menu.isVisible);
          await page.toggleNotificationMenu();
        });

        xit('marks all as read', () => {
          expect(page.hasUnreadNotifications).to.be.false;
        });

        xit('indicates no unread messages', () => {
          expect(page.hasUnreadNotificationsIndicator).to.be.false;
        });
      });
    });
  });
});
