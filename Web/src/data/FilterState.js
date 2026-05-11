/**
 * Reactive singleton holding all filter + axis settings.
 * Call onChange(cb) to subscribe; the callback receives the updated state.
 */
class FilterState {
  constructor() {
    this.axisX          = 'danceability';
    this.axisY          = 'energy';
    this.axisZ          = 'valence';
    this.genre          = '';
    this.minPopularity  = 0;
    this.maxPopularity  = 100;
    this.minEnergy      = 0;
    this.maxEnergy      = 1;
    this.minDanceability= 0;
    this.maxDanceability= 1;
    this.minValence     = 0;
    this.maxValence     = 1;
    this.minTempo       = 40;
    this.maxTempo       = 220;
    this.explicitOnly   = false;
    this.trackCount     = 500;
    this.availableGenres= [];
    this._listeners     = new Set();
  }

  onChange(cb) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  _emit() {
    for (const cb of this._listeners) cb(this);
  }

  set(patch) {
    Object.assign(this, patch);
    this._emit();
  }

  passes(track) {
    if (this.genre && track.track_genre !== this.genre)          return false;
    if (track.popularity < this.minPopularity)                    return false;
    if (track.popularity > this.maxPopularity)                    return false;
    if (track.energy < this.minEnergy)                            return false;
    if (track.energy > this.maxEnergy)                            return false;
    if (track.danceability < this.minDanceability)                return false;
    if (track.danceability > this.maxDanceability)                return false;
    if (track.valence < this.minValence)                          return false;
    if (track.valence > this.maxValence)                          return false;
    if (track.tempo < this.minTempo)                              return false;
    if (track.tempo > this.maxTempo)                              return false;
    if (this.explicitOnly && !track.explicit)                     return false;
    return true;
  }
}

export const filterState = new FilterState();
