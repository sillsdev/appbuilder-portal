import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import Convergence from '@bigtest/convergence';
import i18n from '@translations';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  resetBrowser,
} from 'tests/helpers/index';
import app from 'tests/helpers/pages/app';

describe('Acceptance | Invitations | routing', () => {
  resetBrowser();
  useFakeAuthentication();
  setupApplicationTest();

  describe('navigates to /invitations', () => {
    beforeEach(async () => {
      await visit('/invitations');
    });

    it('displays that the path is not found', () => {
      expect(app.headers).to.contain(i18n.t('errors.notFoundTitle'));
    });

    it('maintains the URL (no redirect)', () => {
      expect(location().pathname).to.eq('/invitations');
    });
  });

  describe('navigates to /invitations/something/something', () => {
    beforeEach(async () => {
      await visit('/invitations/something/something');
    });

    it('displays that the path is not found', () => {
      expect(app.headers).to.contain(i18n.t('errors.notFoundTitle'));
    });

    it('maintains the URL (no redirect)', () => {
      expect(location().pathname).to.eq('/invitations/something/something');
    });
  });

  describe('navigates to an invitation', () => {
    beforeEach(async () => {
      await visit('/invitations/organization/something');

      await new Convergence().when(() => app.headers);
    });

    it.always('should not say that the path was not found', () => {
      expect(app.headers).to.not.contain(i18n.t('errors.notFoundTitle'));
    });

    it('should not redirect', () => {
      expect(location().pathname).to.eq('/invitations/organization/something');
    });
  });
});
