import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { mountWithContext } from 'tests/helpers';

import Header from '../display';

import headerHelper from 'tests/helpers/components/header';

describe('Integration | Component | Header', () => {

  describe('mounting', () => {
    beforeEach(async () => {
      await mountWithContext(() => <Header />);
    });

    it('suceeds',() => {
      expect(headerHelper.isHeaderPresent).to.be.true;
    });
  });

  describe('Dropdowns', () => {
    beforeEach(async () => {
      await mountWithContext(() => <Header />);
    });

    describe('the dropdowns can open', () => {
      beforeEach(async () => {
        expect(headerHelper.isNotificationMenuOpen).to.be.false;

        await headerHelper.clickNotification();
      });

      it('opens the notification dropdown', () => {
        expect(headerHelper.isNotificationMenuOpen).to.be.true;
      });

      describe('only one dropdown is open at a time / dropdowns do not share the same state', () => {
        beforeEach(async () => {
          expect(headerHelper.isAvatarMenuOpen).to.be.false;
          expect(headerHelper.isNotificationMenuOpen).to.be.true;

          await headerHelper.clickAvatar();
        });

        it('closes the notification dropdown, and opens the avatar dropdown', () => {
          expect(headerHelper.isAvatarMenuOpen).to.be.true;
          expect(headerHelper.isNotificationMenuOpen).to.be.false;
        });
      });
    });
  });
});
