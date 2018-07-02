import * as React from 'react';
import * as sinon from 'sinon';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { mountWithContext } from 'tests/helpers';

import Display from '../display';
import page from './page';

describe('Integration | Component | Create Organization Form', () => {
  let fakeSubmit;

  beforeEach(async () => {
    fakeSubmit = sinon.spy();

    await mountWithContext(() => (
      <Display
        token='invite-token'
        onSubmit={fakeSubmit}/>
    ));
  });

  describe('The form has values', () => {
    beforeEach(async () => {
      await page.fillWebsite('fake.fake');
      await page.fillOrgName('Acme Org');
    });

    it('has values', () => {
      expect(page.orgName).to.equal('Acme Org');
      expect(page.website).to.equal('fake.fake');
    });

    describe('the form is submitted', () => {
      beforeEach(async () => {
        await page.clickSubmit();
      });

      it('submits the data', () => {
        expect(fakeSubmit).to.have.been.calledWithMatch({
          websiteUrl: 'fake.fake',
          name: 'Acme Org',
          token: 'invite-token'
        });
      });
    });
  });
});
