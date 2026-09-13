const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

describe('llmStrategist', () => {
  test('returns null without ANTHROPIC_API_KEY -- never blocks report generation', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { writeRationale } = require('../src/llmStrategist');
    const result = await writeRationale({
      themeLabel: 'Bread & rolls',
      actionType: 'Create',
      distinctSourceCount: 2,
      risingQueries: [{ query: 'pav bhaji pav', value: 160 }],
      topQueries: [],
      interestByRegion: [],
      socialExamples: []
    });
    assert.equal(result, null);
  });
});
