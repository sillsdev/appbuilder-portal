import * as React from 'react';
import * as sinon from 'sinon';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { mountWithContext } from 'tests/helpers';

import ProductArtifact from './index';
// import page from './page';

describe('Integration | Component | ProductArtifact', () => {
  beforeEach(async function() {
    await mountWithContext(() => <ProductArtifact />);
  });

  // it('list of artifacts is toggleable', () => {
  //   expect(true).to.equal(false);
  // });

});
