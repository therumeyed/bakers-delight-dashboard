// Bakers Delight's real, current product range -- confirmed complete (the
// "All Products" collection on bakersdelight.com.au, 24 SKUs) by the client
// directly, 2026-09-13. Used only to ground the LLM strategist's product-fit
// reasoning in src/llmStrategist.js -- it must never suggest a product that
// isn't in this list, and this list must never be invented or guessed.
// Prices are AUD, converted from the store's cents-based values.
const PRODUCTS = [
  { name: 'Round White Roll', price: 1.10 },
  { name: 'White Long Roll', price: 1.10 },
  { name: 'Traditional Scone', price: 3.00 },
  { name: 'Hi-Fibre Lo-GI White Block Loaf', price: 5.90 },
  { name: 'Vanilla Slice Scroll', price: 4.80 },
  { name: 'Cheesymite Scroll', price: 4.50 },
  { name: 'White Dinner Roll', price: 0.90 },
  { name: 'Spinach & Fetta Twisted Delight', price: 7.80 },
  { name: 'Italian Roll', price: 3.90 },
  { name: 'White Block Loaf', price: 5.00 },
  { name: 'Hi-Fibre Lo-GI Wholemeal Block Loaf', price: 5.90 },
  { name: 'Mini Cheesymite Scroll 4 Pack', price: 8.60 },
  { name: 'White Knot Roll', price: 1.10 },
  { name: 'Mediterranean Pizza', price: 5.60 },
  { name: 'Hi-Fibre Lo-GI Round Roll', price: 1.30 },
  { name: 'Hi-Fibre Lo-GI White Lunch Box Roll 6 Pack', price: 5.60 },
  { name: 'Croissant', price: 3.90 },
  { name: 'Hi-Protein Low Carb Wholegrain Round Roll', price: 1.50 },
  { name: 'Sticky Cinnamon Scroll', price: 4.70 },
  { name: 'Mini Custard Scroll 4 Pack', price: 8.60 },
  { name: 'Sourdough Vienna', price: 8.00 },
  { name: 'Margherita Pizza', price: 5.60 },
  { name: 'Hi-Protein Low Carb Wholegrain Block Loaf', price: 6.70 },
  { name: 'Croissant 4 Pack', price: 14.40 }
];

module.exports = { PRODUCTS };
