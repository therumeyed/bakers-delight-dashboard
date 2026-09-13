// Editable topic library (brief section 11). Each entry drives one
// DataForSEO Trends request and one round of social search per platform.
// `theme` values double as the Theme filter options in the UI.
//
// Biased toward short, broad terms rather than long specific phrases --
// Google Trends' related-queries feature is sensitive to phrase
// length/specificity, and a 3-4 word compound phrase ("after school
// snacks", "christmas catering") is much more likely to have thin or empty
// related-query data than the single word it's built from, independent of
// any parsing bug. DataForSEO's own dashboard demoed rich rising-query
// results for the broad word "lunchbox" specifically. Narrower phrases
// were dropped rather than kept alongside the broad ones -- each is its
// own billed DataForSEO task, so there's no reason to keep paying for ones
// unlikely to return anything useful.
const TOPICS = [
  { theme: 'lunchboxes', label: 'Lunchboxes', queries: ['lunchbox', 'school lunch', 'kids lunch'] },
  { theme: 'picnic_snacking', label: 'Picnic & snacking', queries: ['picnic', 'picnic food'] },
  { theme: 'bread_rolls', label: 'Bread & rolls', queries: ['bread', 'bread rolls', 'sourdough'] },
  { theme: 'entertaining', label: 'Entertaining', queries: ['party food', 'barbecue', 'entertaining'] },
  { theme: 'seasonal', label: 'Seasonal occasions', queries: ['school holidays', 'easter', 'mothers day', 'fathers day', 'christmas', 'summer'] }
];

// Multicultural discovery is deliberately query-less at v1: the brief
// requires surfacing rising related queries rather than hard-coding
// assumptions, and flags every hit for human review before it's used for
// audience targeting. `requiresReview: true` is read by the report builder
// to force confidence down to 'early_signal' regardless of score.
const MULTICULTURAL_THEME = { theme: 'multicultural', label: 'Multicultural discovery', queries: [], requiresReview: true };

const ALL_TOPICS = [...TOPICS, MULTICULTURAL_THEME];

function allQueries() {
  return ALL_TOPICS.flatMap((t) => t.queries.map((q) => ({ theme: t.theme, query: q })));
}

function themeForQuery(query) {
  const hit = ALL_TOPICS.find((t) => t.queries.includes(query));
  return hit ? hit.theme : null;
}

module.exports = { TOPICS, MULTICULTURAL_THEME, ALL_TOPICS, allQueries, themeForQuery };
