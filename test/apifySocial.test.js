const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { isGenuineMatch } = require('../src/providers/apifySocial');

describe('apifySocial isGenuineMatch', () => {
  test('a real match with no exclude list on its topic still matches', () => {
    assert.equal(isGenuineMatch('Fresh sourdough bread rolls from the bakery', 'bread'), true);
  });
  test('an unrelated post does not match at all', () => {
    assert.equal(isGenuineMatch('Best basketball highlights this week', 'bread'), false);
  });
});
