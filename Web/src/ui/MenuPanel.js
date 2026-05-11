import { filterState } from '../data/FilterState.js';
import { AXIS_OPTIONS } from '../utils/DataUtils.js';
import { colorForGenre } from '../utils/ColorMapper.js';

/**
 * Wires up the desktop HTML menu panel (index.html) to FilterState.
 */
export class MenuPanel {
  constructor() {
    this._panel   = document.getElementById('menu-panel');
    this._toggle  = document.getElementById('menu-toggle');
    this._info    = document.getElementById('info-panel');
    this._visible = true;
    this._buildAxisSelects();
    this._bindFilters();
    this._bindToggle();
  }

  _buildAxisSelects() {
    const selectX = document.getElementById('axis-x');
    const selectY = document.getElementById('axis-y');
    const selectZ = document.getElementById('axis-z');

    const build = (el, currentVal) => {
      for (const opt of AXIS_OPTIONS) {
        const o = document.createElement('option');
        o.value       = opt.value;
        o.textContent = opt.label;
        if (opt.value === currentVal) o.selected = true;
        el.appendChild(o);
      }
    };

    build(selectX, filterState.axisX);
    build(selectY, filterState.axisY);
    build(selectZ, filterState.axisZ);

    selectX.addEventListener('change', () => filterState.set({ axisX: selectX.value }));
    selectY.addEventListener('change', () => filterState.set({ axisY: selectY.value }));
    selectZ.addEventListener('change', () => filterState.set({ axisZ: selectZ.value }));
  }

  populateGenres(genres) {
    const sel = document.getElementById('filter-genre');
    for (const g of genres) {
      const o = document.createElement('option');
      o.value       = g;
      o.textContent = g;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => filterState.set({ genre: sel.value }));
  }

  _bindFilters() {
    const bind = (id, labelId, scale, filterKey, decimals = 0) => {
      const el  = document.getElementById(id);
      const lbl = document.getElementById(labelId);
      if (!el) return;
      el.addEventListener('input', () => {
        const v = parseFloat(el.value) / scale;
        if (lbl) lbl.textContent = v.toFixed(decimals);
        filterState.set({ [filterKey]: v });
      });
    };

    bind('pop-min',    null,        1,   'minPopularity');
    bind('pop-max',    null,        1,   'maxPopularity');
    bind('energy-min', null,        100, 'minEnergy', 2);
    bind('energy-max', null,        100, 'maxEnergy', 2);
    bind('dance-min',  null,        100, 'minDanceability', 2);
    bind('dance-max',  null,        100, 'maxDanceability', 2);
    bind('valence-min',null,        100, 'minValence', 2);
    bind('valence-max',null,        100, 'maxValence', 2);

    const tempoMin = document.getElementById('tempo-min');
    const tempoMax = document.getElementById('tempo-max');
    if (tempoMin) tempoMin.addEventListener('input', () =>
      filterState.set({ minTempo: parseFloat(tempoMin.value) }));
    if (tempoMax) tempoMax.addEventListener('input', () =>
      filterState.set({ maxTempo: parseFloat(tempoMax.value) }));

    const explicitCb = document.getElementById('filter-explicit');
    if (explicitCb) explicitCb.addEventListener('change', () =>
      filterState.set({ explicitOnly: explicitCb.checked }));

    const countSlider = document.getElementById('track-count');
    const countLabel  = document.getElementById('count-label');
    if (countSlider) countSlider.addEventListener('input', () => {
      const v = parseInt(countSlider.value);
      if (countLabel) countLabel.textContent = v;
      filterState.set({ trackCount: v });
    });
  }

  _bindToggle() {
    this._toggle.addEventListener('click', () => {
      this._visible = !this._visible;
      this._panel.style.display = this._visible ? 'block' : 'none';
    });
  }

  hideForXR() {
    this._panel.style.display  = 'none';
    this._toggle.style.display = 'none';
  }

  showForDesktop() {
    this._panel.style.display  = 'block';
    this._toggle.style.display = 'none';
  }

  showTrackInfo(track) {
    if (!track) { this._info.style.display = 'none'; return; }
    this._info.style.display = 'block';

    document.getElementById('info-name').textContent   = track.track_name;
    document.getElementById('info-artist').textContent = track.artists;

    const chip = document.getElementById('info-genre');
    chip.textContent             = track.track_genre;
    chip.style.background        = colorForGenre(track.track_genre) + '44';
    chip.style.color             = colorForGenre(track.track_genre);
    chip.style.border            = `1px solid ${colorForGenre(track.track_genre)}`;

    const stats = [
      ['Popularity', `${track.popularity} / 100`],
      ['Danceability', track.danceability.toFixed(3)],
      ['Energy', track.energy.toFixed(3)],
      ['Valence', track.valence.toFixed(3)],
      ['Tempo', `${track.tempo.toFixed(0)} BPM`],
      ['Loudness', `${track.loudness.toFixed(1)} dB`],
      ['Acousticness', track.acousticness.toFixed(3)],
      ['Duration', formatDuration(track.duration_ms)],
      ['Explicit', track.explicit ? 'Yes' : 'No'],
    ];

    const statsEl = document.getElementById('info-stats');
    statsEl.innerHTML = stats.map(([k, v]) =>
      `<span class="stat-label">${k}</span><span class="stat-val">${v}</span>`
    ).join('');
  }
}

function formatDuration(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
