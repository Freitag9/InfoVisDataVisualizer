import { normalize } from '../utils/DataUtils.js';

/**
 * Reactive singleton holding axis selection + all filters.
 *
 * Axis-coupled range filters (rangeX/Y/Z) are stored in NORMALIZED [0,1] space
 * so they always match whatever field is currently mapped to that axis.
 * Changing an axis resets its range to full [0,1].
 *
 * Listeners receive a `type` hint: 'axis' | 'count' | 'filter'
 * so the renderer can avoid unnecessary re-sampling.
 */
class FilterState {
  constructor() {
    this.axisX = 'danceability';
    this.axisY = 'energy';
    this.axisZ = 'valence';

    // Axis-coupled range filters (normalized 0..1)
    this.rangeX = { min: 0, max: 1 };
    this.rangeY = { min: 0, max: 1 };
    this.rangeZ = { min: 0, max: 1 };

    // Base filters (axis-independent)
    this.genre         = '';
    this.minPopularity = 0;
    this.maxPopularity = 100;
    this.explicitOnly  = false;
    this.vocal         = 'all';   // 'all' | 'instrumental' | 'vocal'

    this.trackCount     = 500;
    this.availableGenres = [];
    this._listeners      = new Set();
  }

  onChange(cb)  { this._listeners.add(cb); return () => this._listeners.delete(cb); }
  _emit(type)   { for (const cb of this._listeners) cb(this, type); }

  /** Generic setter for base filters. */
  set(patch, type = 'filter') {
    Object.assign(this, patch);
    this._emit(type);
  }

  /** Change an axis field and reset that axis's range filter to full. */
  setAxis(dim, field) {
    if (dim === 0) { this.axisX = field; this.rangeX = { min: 0, max: 1 }; }
    if (dim === 1) { this.axisY = field; this.rangeY = { min: 0, max: 1 }; }
    if (dim === 2) { this.axisZ = field; this.rangeZ = { min: 0, max: 1 }; }
    this._emit('axis');
  }

  /** Update an axis-coupled range filter (values in normalized 0..1). */
  setRange(dim, min, max) {
    const r = { min, max };
    if (dim === 0) this.rangeX = r;
    if (dim === 1) this.rangeY = r;
    if (dim === 2) this.rangeZ = r;
    this._emit('filter');
  }

  setTrackCount(v) { this.trackCount = v; this._emit('count'); }

  /** Does a track pass all active filters? */
  passes(track) {
    // Base filters
    if (this.genre && track.track_genre !== this.genre) return false;
    if (track.popularity < this.minPopularity) return false;
    if (track.popularity > this.maxPopularity) return false;
    if (this.explicitOnly && !track.explicit) return false;
    if (this.vocal === 'instrumental' && track.instrumentalness < 0.5) return false;
    if (this.vocal === 'vocal' && track.instrumentalness >= 0.5) return false;

    // Axis-coupled range filters (normalized)
    const nx = normalize(track, this.axisX);
    if (nx < this.rangeX.min || nx > this.rangeX.max) return false;
    const ny = normalize(track, this.axisY);
    if (ny < this.rangeY.min || ny > this.rangeY.max) return false;
    const nz = normalize(track, this.axisZ);
    if (nz < this.rangeZ.min || nz > this.rangeZ.max) return false;

    return true;
  }
}

export const filterState = new FilterState();
