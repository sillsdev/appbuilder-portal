import { describe, it, beforeEach } from '@bigtest/mocha';
import { setupAppForTesting } from '@bigtest/react';
import { expect } from 'chai';

import Application from '@ui/application';

// usage: https://github.com/bigtestjs/react/blob/master/tests/setup-app-test.js
describe('Acceptance | Application | renders', () => {
  let app;

  beforeEach(async () => {
    app = await setupAppForTesting(Application);
  });

  it('resolves with the app', async () => {
    expect(app).to.be.an.instanceOf(Application);
  });
});
