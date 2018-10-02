import { describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { tokensToObject } from './utils';

describe('Unit | string', () => {
  describe('tokensToObject', () => {
    it('handles empty input', () => {
      const input = '';
      const expected = {};
      const result = tokensToObject(input);

      expect(result).to.deep.equal(expected);
    });

    it('handles tokens with no value', () => {
      const input = 'name:';
      const expected = { name: '' };
      const result = tokensToObject(input);

      expect(result).to.deep.equal(expected);
    });

    it('handles a single token-value pair', () => {
      const input = 'name:"Preston"';
      const expected = { name: 'Preston' };
      const result = tokensToObject(input);

      expect(result).to.deep.equal(expected);
    });

    it('handles multilpe token-value pairs', () => {
      const input = 'name:"Preston" language:English some:thing';
      const expected = { name: 'Preston', language: 'English', some: 'thing' };
      const result = tokensToObject(input);

      expect(result).to.deep.equal(expected);
    });

    it('handles mismatched or incomplete token-value pairs', () => {
      const input = 'name:"Preston" language: some:';
      const expected = { name: 'Preston', language: '', some: '' };
      const result = tokensToObject(input);

      expect(result).to.deep.equal(expected);
    });
  });
});
