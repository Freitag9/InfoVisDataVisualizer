const KEY = 'infovis_recent';
const MAX = 8;

export function addRecent(track) {
  const prev = getRecent().filter(t => t.track_id !== track.track_id);
  prev.unshift({
    track_id:   track.track_id,
    track_name: track.track_name,
    artists:    track.artists,
    track_genre:track.track_genre,
    popularity: track.popularity,
  });
  if (prev.length > MAX) prev.length = MAX;
  try { localStorage.setItem(KEY, JSON.stringify(prev)); } catch {}
}

export function getRecent() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; } catch { return []; }
}
