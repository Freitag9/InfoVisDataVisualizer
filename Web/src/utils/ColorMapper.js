// Deterministic genre → color mapping. First 20 genres get distinct hues,
// remainder are hashed. Colors are perceptually spaced in HSL.

const PALETTE = [
  '#1db954', '#e91e63', '#2196f3', '#ff9800', '#9c27b0',
  '#00bcd4', '#f44336', '#8bc34a', '#ff5722', '#3f51b5',
  '#009688', '#ffc107', '#607d8b', '#e040fb', '#00e676',
  '#ff6d00', '#40c4ff', '#69f0ae', '#ea80fc', '#ffff00',
];

const _cache = new Map();
let _assignedIndex = 0;

export function colorForGenre(genre) {
  if (!genre) return '#888888';
  if (_cache.has(genre)) return _cache.get(genre);
  const color = PALETTE[_assignedIndex % PALETTE.length];
  _assignedIndex++;
  _cache.set(genre, color);
  return color;
}

export function hexToRGB01(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

export function reset() {
  _cache.clear();
  _assignedIndex = 0;
}

export function getLegend() {
  return Array.from(_cache.entries()).map(([genre, color]) => ({ genre, color }));
}
