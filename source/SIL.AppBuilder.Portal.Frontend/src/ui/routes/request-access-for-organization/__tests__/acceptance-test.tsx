import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers/index';

import { pathName as formPath } from '../index';
import { pathName as successPath } from '../success';

import app from 'tests/helpers/pages/app';
import page from './page';

describe('Acceptance | Request Access For Organization', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('navigates to form', () => {
    beforeEach(async function() {
      await visit(formPath);
    });

    it('maintains the URL (no redirect)', () => {
      expect(location().pathname).to.eq(formPath);
    });

    describe('the form is filled', () => {
      beforeEach(async function() {
        await page.fillName('Acme Inc.');
        await page.fillEmail('orgAdmin@acmeinc.org');
        await page.fillSite('acmeinc.org');
        await page.clickSubmit();
      });

      describe('an error occurs', () => {
        beforeEach(async function() {
          const { server } = this.polly;

          server.post('/url-tbd').intercept((req, res) => {
            res.status(422);
          });
        });

        it('shows an error message', () => {
          expect(page.hasError).to.be.true;
        });
      });

      describe('an error does not occur', () => {
        beforeEach(async function() {
          const { server } = this.polly;

          server.post('/url-tbd').intercept((req, res) => {
            res.status(200);
          });
        });

        it('is redirected to the success screen', () => {
          expect(location().pathname).to.eq(successPath);
        });
      });
    });
  });

  describe('navigates to /invitations/organization', () => {
    beforeEach(async function() {
      await visit('/invitations/organization');
    });

    it('displays that the path is not found', () => {
      expect(app.headers).to.contain('Not Found!');
    });

    it('maintains the URL (no redirect)', () => {
      expect(location().pathname).to.eq('/invitations/organization');
    });
  });

  describe('navigates to an invitation', () => {
    beforeEach(async function() {
      await visit('/invitations/organization/something');
    });

    it('should not say that the path was not found', () => {
      expect(app.headers).to.not.contain('Not Found!');
    });

    it('should not redirect', () => {
      expect(location().pathname).to.eq('/invitations/organization/something');
    });
  });
});
