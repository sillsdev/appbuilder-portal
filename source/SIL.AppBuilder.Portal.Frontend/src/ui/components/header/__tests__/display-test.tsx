import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { mountWithContext } from 'tests/helpers';

import Header from '../display';

import headerHelper from 'tests/helpers/components/header';

describe('Integration | Component | Header', () => {

  describe('mounting', () => {
    beforeEach(async () => {
      await mountWithContext(() => <Header/>);
    });

    it('suceeds',() => {
      expect(document.querySelector('[data-test-header-menu]')).to.exist;
      expect(document.querySelector('[data-test-header-appname]')).to.exist;
      expect(document.querySelector('[data-test-header-addproject]')).to.exist;
      expect(document.querySelector('[data-test-header-notification]')).to.exist;
    });
  });

  describe('Only one dropdown open at a time', async () => {

    await headerHelper.notificationDropdownClick();
    expect(document.querySelector('[data-test-header-notification]').classList.contains('active visible')).to.be.true;
    expect(document.querySelector('[data-test-header-avatar]').classList.contains('active visible')).to.be.false;

    await headerHelper.avatarDropdownClick();
    expect(document.querySelector('[data-test-header-avatar]').classList.contains('active visible')).to.be.true;
    expect(document.querySelector('[data-test-header-notification]').classList.contains('active visible')).to.be.false;

  });

});
