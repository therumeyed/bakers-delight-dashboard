// TrendsProvider: DataForSEO Google Trends explore. Async task_post ->
// bounded poll of task_get, per the brief's "never keep a web request open
// while waiting" rule -- this runs from ingest.js (a script), never from an
// Express request handler, so a bounded synchronous poll here is fine.
const BASE = 'https://api.dataforseo.com/v3';
const AUSTRALIA_LOCATION_CODE = 2036;

function isConfigured() {
  return Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
}

function authHeader() {
  const token = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
  return `Basic ${token}`;
}

async function submitTask(keyword) {
  const res = await fetch(`${BASE}/keywords_data/google_trends/explore/task_post`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    // Single keyword per request -- item_types requiring one keyword
    // (queries_list, topics_list) can't be mixed with multi-keyword compares.
    body: JSON.stringify([{
      keywords: [keyword],
      location_code: AUSTRALIA_LOCATION_CODE,
      language_code: 'en',
      time_range: 'past_30_days',
      item_types: ['google_trends_graph', 'google_trends_map', 'google_trends_queries_list']
    }])
  });
  const json = await res.json();
  const task = json?.tasks?.[0];
  if (!res.ok || !task || task.status_code >= 40000) {
    throw new Error(`DataForSEO task_post failed for "${keyword}": ${task?.status_message || res.statusText}`);
  }
  return { taskId: task.id, cost: task.cost || 0 };
}

async function pollTask(taskId, { pollMs = 4000, maxWaitMs = 120000 } = {}) {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const res = await fetch(`${BASE}/keywords_data/google_trends/explore/task_get/${taskId}`, {
      headers: { Authorization: authHeader() }
    });
    const json = await res.json();
    const task = json?.tasks?.[0];
    if (task && task.status_code === 20000) return task;
    if (task && task.status_code >= 40000) throw new Error(`DataForSEO task ${taskId} failed: ${task.status_message}`);
    await new Promise((r) => setTimeout(r, pollMs));
  }
  throw new Error(`DataForSEO task ${taskId} did not finish within ${maxWaitMs}ms`);
}

// Defensive parsing -- DataForSEO's exact nesting varies by item_type and we
// have no live account to verify against yet. Anything unrecognised is kept
// in rawPayload rather than dropped, per the "never discard the original
// item" rule; interestByRegion/relatedQueries just come back empty instead
// of throwing so one odd response shape doesn't take down the whole run.
function parseResult(task) {
  const items = task?.result?.[0]?.items || [];
  const map = items.find((i) => i.type === 'google_trends_map');
  const queriesList = items.find((i) => i.type === 'google_trends_queries_list');
  const graph = items.find((i) => i.type === 'google_trends_graph');

  const interestByRegion = (map?.data || map?.items || [])
    .map((r) => ({ region: r.geo_name || r.region || r.location_name, value: r.value ?? r.values?.[0] }))
    .filter((r) => r.region && typeof r.value === 'number');

  const relatedQueries = {
    top: (queriesList?.top_queries || queriesList?.top || []).map((q) => ({ query: q.query, value: q.value })),
    rising: (queriesList?.rising_queries || queriesList?.rising || []).map((q) => ({ query: q.query, value: q.value ?? q.formatted_value }))
  };

  const interestOverTime = (graph?.data || graph?.items || [])
    .map((p) => ({ date: p.date_from || p.date, value: p.values?.[0] }))
    .filter((p) => p.date && typeof p.value === 'number');

  return { interestByRegion, relatedQueries, interestOverTime };
}

/**
 * @param {string} keyword
 * @returns {Promise<{status: 'live'|'failed'|'awaiting_connection', cost: number, taskId?: string, data?: object, error?: string}>}
 */
async function explore(keyword) {
  if (!isConfigured()) {
    return { status: 'awaiting_connection', cost: 0 };
  }
  try {
    const { taskId, cost } = await submitTask(keyword);
    const task = await pollTask(taskId);
    return { status: 'live', cost: (task.cost || 0) + cost, taskId, data: parseResult(task), rawPayload: task };
  } catch (err) {
    return { status: 'failed', cost: 0, error: err.message };
  }
}

module.exports = { explore, isConfigured, AUSTRALIA_LOCATION_CODE };
