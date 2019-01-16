import * as React from 'react';
import * as sinon from 'sinon';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import { mountWithContext } from 'tests/helpers';

import Form from '../display';

import page from './page';

describe('Integration | Component | InviteOrganizationDisplay', () => {
  let fakeSubmit;

  beforeEach(async function() {
    fakeSubmit = sinon.spy();
    await mountWithContext(() => <Form onSubmit={fakeSubmit} />);
  });

  describe('The form has values', () => {
    beforeEach(async () => {
      await page.fillEmail('fake@fake.fake');
      await page.fillOrgName('Acme Org');
    });

    it('has values', () => {
      expect(page.orgName).to.equal('Acme Org');
      expect(page.email).to.equal('fake@fake.fake');
    });

    describe('the form is submitted', () => {
      beforeEach(async () => {
        await page.clickSubmit();
      });

      it('submits the data', () => {
        expect(fakeSubmit).to.have.been.calledWithMatch({
          ownerEmail: 'fake@fake.fake',
          name: 'Acme Org',
        });
      });

      it('the form is cleared', () => {
        expect(page.orgName).to.equal('');
        expect(page.email).to.equal('');
      });
    });
  });
});
