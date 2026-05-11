export const AXIS_OPTIONS = [
  { value: 'danceability',     label: 'Danceability',     min: 0,       max: 1 },
  { value: 'energy',           label: 'Energy',           min: 0,       max: 1 },
  { value: 'valence',          label: 'Valence',          min: 0,       max: 1 },
  { value: 'acousticness',     label: 'Acousticness',     min: 0,       max: 1 },
  { value: 'instrumentalness', label: 'Instrumentalness', min: 0,       max: 1 },
  { value: 'speechiness',      label: 'Speechiness',      min: 0,       max: 1 },
  { value: 'liveness',         label: 'Liveness',         min: 0,       max: 1 },
  { value: 'tempo',            label: 'Tempo (BPM)',       min: 40,      max: 220 },
  { value: 'loudness',         label: 'Loudness (dB)',     min: -60,     max: 0 },
  { value: 'popularity',       label: 'Popularity',        min: 0,       max: 100 },
  { value: 'duration_min',     label: 'Duration (min)',    min: 0,       max: 10 },
];

export function normalize(track, field) {
  switch (field) {
    case 'popularity':       return track.popularity / 100;
    case 'loudness':         return Math.min(1, Math.max(0, (track.loudness + 60) / 60));
    case 'tempo':            return Math.min(1, Math.max(0, (track.tempo - 40) / 180));
    case 'duration_min':     return Math.min(1, Math.max(0, track.duration_ms / 600_000));
    default:                 return Math.min(1, Math.max(0, track[field] ?? 0));
  }
}

export function displayValue(track, field) {
  switch (field) {
    case 'popularity':       return `${track.popularity}`;
    case 'loudness':         return `${track.loudness.toFixed(1)} dB`;
    case 'tempo':            return `${track.tempo.toFixed(0)} BPM`;
    case 'duration_min':     return formatDuration(track.duration_ms);
    default:                 return (track[field] ?? 0).toFixed(3);
  }
}

export function formatDuration(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
