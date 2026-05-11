import Papa from 'papaparse';

/**
 * Streams dataset.csv via PapaParse and reports progress.
 * Returns a promise resolving to SpotifyTrack[].
 */
export function loadDataset(url = '/dataset.csv', onProgress) {
  return new Promise((resolve, reject) => {
    const tracks = [];

    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      step(result) {
        const r = result.data;
        if (!r.track_id) return;
        tracks.push({
          track_id:         r.track_id,
          track_name:       r.track_name ?? '',
          artists:          r.artists ?? '',
          album_name:       r.album_name ?? '',
          track_genre:      r.track_genre ?? '',
          popularity:       Number(r.popularity) || 0,
          duration_ms:      Number(r.duration_ms) || 0,
          explicit:         r.explicit === true || r.explicit === 'True',
          danceability:     Number(r.danceability) || 0,
          energy:           Number(r.energy) || 0,
          key:              Number(r.key) || 0,
          loudness:         Number(r.loudness) || 0,
          mode:             Number(r.mode) || 0,
          speechiness:      Number(r.speechiness) || 0,
          acousticness:     Number(r.acousticness) || 0,
          instrumentalness: Number(r.instrumentalness) || 0,
          liveness:         Number(r.liveness) || 0,
          valence:          Number(r.valence) || 0,
          tempo:            Number(r.tempo) || 0,
          time_signature:   Number(r.time_signature) || 4,
        });

        if (onProgress && tracks.length % 5000 === 0) {
          onProgress(tracks.length);
        }
      },
      complete() { resolve(tracks); },
      error(err)  { reject(err); },
    });
  });
}

/** Collect unique genres sorted alphabetically. */
export function extractGenres(tracks) {
  const set = new Set(tracks.map(t => t.track_genre).filter(Boolean));
  return [...set].sort();
}
