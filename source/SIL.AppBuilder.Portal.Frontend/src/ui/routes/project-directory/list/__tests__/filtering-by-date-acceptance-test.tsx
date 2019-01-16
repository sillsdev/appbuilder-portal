import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  wait,
} from 'tests/helpers/index';
import range from '@ui/components/inputs/date-range/-page';

import page from './page';
import { threeProjects, DTProjects } from './scenarios';

describe('Acceptance | Project Directory | Filtering | By Date', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function() {
    const { server } = this.polly;

    this.mockGet(200, 'product-definitions', { data: [] });

    server.namespace('/api', () => {
      server.get('/projects').intercept((req, res) => {
        res.status(200);
        res.headers['Content-Type'] = 'application/vnd.api+json';

        res.json(threeProjects);
      });
    });
  });

  beforeEach(async function() {
    await visit('/directory');
  });

  it('both fields are empty', () => {
    expect(range.fromValue).to.equal('');
    expect(range.toValue).to.equal('');
  });

  it('does not show the clear icons', () => {
    expect(range.toClearIsVisible).to.equal(false);
    expect(range.fromClearIsVisible).to.equal(false);
  });

  describe('user sets the from date', () => {
    beforeEach(async function() {
      await range.fromSet('07/02/2018');
    });

    it('sets the from date', () => {
      expect(range.fromValue).to.equal('07/02/2018');
    });

    it('shows the clear icon', () => {
      expect(range.fromClearIsVisible).to.equal(true);
    });

    describe('user clicks the clear button', () => {
      beforeEach(async function() {
        await range.fromClickClear();
      });

      it('no longer has a from date', () => {
        expect(range.fromValue).to.equal('');
      });

      it('does not show the clear icon', () => {
        expect(range.fromClearIsVisible).to.equal(false);
      });
    });
  });

  describe('user sets the to date', () => {
    beforeEach(async function() {
      await range.toSet('07/02/2018');
    });

    it('sets the from date', () => {
      expect(range.toValue).to.equal('07/02/2018');
    });

    it('shows the clear icon', () => {
      expect(range.toClearIsVisible).to.equal(true);
    });

    describe('user clicks the clear button', () => {
      beforeEach(async function() {
        await range.toClickClear();
      });

      it('no longer has a from date', () => {
        expect(range.toValue).to.equal('');
      });

      it('does not show the clear icon', () => {
        expect(range.toClearIsVisible).to.equal(false);
      });
    });
  });
});
