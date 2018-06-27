import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { mountWithContext } from 'tests/helpers';

import Layout from '../index';

describe('Integration | Component | Layout', () => {

  describe('mounting', () => {

    beforeEach(async () => {
      await mountWithContext(() => <Layout><div></div></Layout>);
    });

    it('suceeds', async () => {
      expect(document.querySelector('.wrapper')).to.exist;
      expect(document.querySelector('[data-test-header-menu]')).to.exist;
    });
  });

});