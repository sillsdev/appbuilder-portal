import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { mount } from '@bigtest/react';
import { expect } from 'chai';

import Header from '../display';

describe('Integration | Component | Header', () => {

  describe('mounting', () => {
    beforeEach(async () => {
      await mount(() => <Header/>);
    });

    it('suceeds', async () => {
      expect(document.querySelector('[data-test-header-menu]')).to.exist;
      expect(document.querySelector('[data-test-header-appname]')).to.exist;
      expect(document.querySelector('[data-test-header-addproject]')).to.exist;
      expect(document.querySelector('[data-test-header-notification]')).to.exist;
    });
  });

});
