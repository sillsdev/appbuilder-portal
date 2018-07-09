import * as React from 'react';
import * as sinon from 'sinon';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { mountWithContext } from 'tests/helpers';

import Display from '../display';
import page from './page';

describe('Integration | Component | Edit Profile Form', () => {
    
  let fakeSubmit;

  beforeEach(async () => {
    fakeSubmit = sinon.spy();

    await mountWithContext(() => (
      <Display onSubmit={fakeSubmit} />
    ));
  });

  describe('The form has values', () => {
    beforeEach(async () => {
      await page.fillName('Fake name');
      await page.fillEmail('fake@domain.com');
      await page.fillLocalization('Lima');
      await page.clickEmailNotification();
      await page.fillSSHKey('abcd');
    });

    it('has values', () => {
      expect(page.name).to.equal('Fake name');
      expect(page.email).to.equal('fake@domain.com');
      expect(page.localization).to.equal('Lima');
      expect(page.emailNotification).to.be.true;
      expect(page.sshKey).to.equal('abcd');
    });

    describe('the form is submitted', () => {
      beforeEach(async () => {
        await page.clickSubmit();
      });

      it('submits the data', () => {
        expect(fakeSubmit).to.have.been.calledWithMatch({
          name: 'Fake name',
          email: 'fake@domain.com',
          localization: 'Lima',
          emailNotification: true,
          sshKey: 'abcd'
        });
      });
    });
  });
});
