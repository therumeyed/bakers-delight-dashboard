// Editable topic library (brief section 11). Each entry drives one
// DataForSEO Trends request and one round of social search per platform.
// `theme` values double as the Theme filter options in the UI.
const TOPICS = [
  { theme: 'lunchboxes', label: 'Lunchboxes', queries: ['lunchbox ideas', 'school lunch ideas', 'kids lunch', 'after school snacks'] },
  { theme: 'picnic_snacking', label: 'Picnic & snacking', queries: ['picnic snacks', 'easy picnic food', 'family picnic ideas'] },
  { theme: 'bread_rolls', label: 'Bread & rolls', queries: ['fresh bread', 'bread rolls', 'sourdough', 'bakery bread'] },
  { theme: 'entertaining', label: 'Entertaining', queries: ['party food', 'bring a plate', 'easy entertaining', 'barbecue sides'] },
  { theme: 'seasonal', label: 'Seasonal occasions', queries: ['school holidays', 'easter baking', 'mothers day', 'fathers day', 'christmas catering', 'summer gathering food'] }
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
