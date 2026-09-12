// DB-backed integration test, gated on TEST_DATABASE_URL (never DATABASE_URL)
// so `npm test` can never touch a real database just because one happens to
// be configured in the environment -- same convention as the sibling
// Melbourne Airport dashboard in this account.
const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const skip = !TEST_DATABASE_URL ? 'set TEST_DATABASE_URL to a scratch database to run this suite' : false;

describe('report generation from fixture evidence (DB-backed)', { skip }, () => {
  let db, buildReport;

  before(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    db = require('../src/db');
    ({ buildReport } = require('../src/reportBuilder'));
    await db.initSchema();
  });

  beforeEach(async () => {
    await db.pool.query('TRUNCATE TABLE recommendation_evidence, recommendations, signals, source_items, provider_runs, reports RESTART IDENTITY CASCADE');
  });

  after(async () => {
    await db.pool.query('TRUNCATE TABLE recommendation_evidence, recommendations, signals, source_items, provider_runs, reports RESTART IDENTITY CASCADE');
    await db.pool.end();
  });

  test('a theme with zero collected evidence produces no signal and no recommendation', async () => {
    const report = await db.getOrCreateReport('2026-01-01');
    const result = await buildReport(report.id, '2026-01-01');
    assert.equal(result.recommendationsCreated, 0);
    const bundle = await db.getReportBundle(report);
    assert.equal(bundle.signals.length, 0);
    assert.equal(bundle.recommendations.length, 0);
  });

  test('real evidence produces a recommendation traceable back to its source_items', async () => {
    const report = await db.getOrCreateReport('2026-01-02');
    const run = await db.recordProviderRun(report.id, {
      providerName: 'Google News RSS', sourceType: 'google_news', status: 'live'
    });
    await db.upsertSourceItem({
      providerRunId: run.id,
      sourceType: 'google_news',
      sourceName: 'Test Publication',
      sourceUrl: 'https://example.com/article',
      externalId: 'https://example.com/article',
      contentHash: 'fixture-hash-1',
      title: 'Bakery bread rolls trending for school lunches',
      queryOrTopic: 'lunchbox ideas',
      theme: 'lunchboxes',
      publishedAt: new Date('2026-01-01'),
      dataStatus: 'live'
    });

    const result = await buildReport(report.id, '2026-01-02');
    assert.equal(result.recommendationsCreated, 1);

    const bundle = await db.getReportBundle(report);
    assert.equal(bundle.recommendations.length, 1);
    const rec = bundle.recommendations[0];
    assert.equal(rec.theme, 'lunchboxes');
    assert.ok(rec.evidence.length >= 1, 'recommendation must carry at least one linked evidence row');
    assert.equal(rec.evidence[0].source_url, 'https://example.com/article');
    assert.equal(rec.evidence[0].data_status, 'live');
  });

  test('an imported/cached item is never surfaced with data_status live', async () => {
    const report = await db.getOrCreateReport('2026-01-03');
    const run = await db.recordProviderRun(report.id, {
      providerName: 'DataForSEO (cached)', sourceType: 'dataforseo_trends', status: 'cached'
    });
    const item = await db.upsertSourceItem({
      providerRunId: run.id,
      sourceType: 'dataforseo_trends',
      sourceName: 'DataForSEO (cached)',
      contentHash: 'fixture-hash-2',
      title: 'picnic snacks (cached)',
      queryOrTopic: 'picnic snacks',
      theme: 'picnic_snacking',
      normalizedMetrics: { interestByRegion: [{ region: 'VIC', value: 80 }] },
      dataStatus: 'cached'
    });
    assert.equal(item.data_status, 'cached');

    await buildReport(report.id, '2026-01-03');
    const bundle = await db.getReportBundle(report);
    const signal = bundle.signals.find((s) => s.theme === 'picnic_snacking');
    assert.equal(signal.data_status, 'cached');
  });
});
