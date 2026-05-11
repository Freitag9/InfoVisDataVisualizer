import { filterState } from '../data/FilterState.js';
import { AXIS_OPTIONS } from '../utils/DataUtils.js';
import { colorForGenre } from '../utils/ColorMapper.js';

export class MenuPanel {
  constructor() {
    this._infoPanel = document.getElementById('info-panel');
    this._buildAxisSelects();
    this._bindFilters();
  }

  _buildAxisSelects() {
    const build = (id, currentVal) => {
      const el = document.getElementById(id);
      if (!el) return;
      for (const opt of AXIS_OPTIONS) {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === currentVal) o.selected = true;
        el.appendChild(o);
      }
      el.addEventListener('change', () => {
        const field = id === 'axis-x' ? 'axisX' : id === 'axis-y' ? 'axisY' : 'axisZ';
        filterState.set({ [field]: el.value });
      });
    };
    build('axis-x', filterState.axisX);
    build('axis-y', filterState.axisY);
    build('axis-z', filterState.axisZ);
  }

  populateGenres(genres) {
    const sel = document.getElementById('filter-genre');
    if (!sel) return;
    for (const g of genres) {
      const o = document.createElement('option');
      o.value = g; o.textContent = g;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => filterState.set({ genre: sel.value }));
  }

  _bindFilters() {
    const bindRange = (id, valId, scale, key, decimals) => {
      const el  = document.getElementById(id);
      const lbl = document.getElementById(valId);
      if (!el) return;
      el.addEventListener('input', () => {
        const v = parseFloat(el.value) / scale;
        if (lbl) lbl.textContent = decimals ? v.toFixed(decimals) : Math.round(v);
        filterState.set({ [key]: v });
      });
    };

    bindRange('pop-min',    'pop-min-v',    1,   'minPopularity',   0);
    bindRange('pop-max',    'pop-max-v',    1,   'maxPopularity',   0);
    bindRange('energy-min', 'energy-min-v', 100, 'minEnergy',       2);
    bindRange('energy-max', 'energy-max-v', 100, 'maxEnergy',       2);
    bindRange('dance-min',  'dance-min-v',  100, 'minDanceability', 2);
    bindRange('dance-max',  'dance-max-v',  100, 'maxDanceability', 2);
    bindRange('valence-min','valence-min-v',100, 'minValence',      2);
    bindRange('valence-max','valence-max-v',100, 'maxValence',      2);
    bindRange('tempo-min',  'tempo-min-v',  1,   'minTempo',        0);
    bindRange('tempo-max',  'tempo-max-v',  1,   'maxTempo',        0);

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

  hideForXR() {
    document.getElementById('menu-toggle').style.display = 'none';
    document.getElementById('menu-panel').classList.remove('open');
    document.getElementById('menu-overlay').classList.remove('open');
  }

  showForDesktop() {
    document.getElementById('menu-toggle').style.display = 'flex';
  }

  showTrackInfo(track) {
    if (!track) { this._infoPanel.classList.remove('open'); return; }

    document.getElementById('info-name').textContent   = track.track_name;
    document.getElementById('info-artist').textContent = track.artists;

    const chip = document.getElementById('info-genre');
    chip.textContent          = track.track_genre;
    const c                   = colorForGenre(track.track_genre);
    chip.style.background     = c + '33';
    chip.style.color          = c;
    chip.style.border         = `1px solid ${c}`;

    const stats = [
      ['Popularity',    `${track.popularity}/100`],
      ['Danceability',  track.danceability.toFixed(3)],
      ['Energy',        track.energy.toFixed(3)],
      ['Valence',       track.valence.toFixed(3)],
      ['Tempo',         `${track.tempo.toFixed(0)} BPM`],
      ['Loudness',      `${track.loudness.toFixed(1)} dB`],
      ['Acousticness',  track.acousticness.toFixed(3)],
      ['Duration',      formatDuration(track.duration_ms)],
      ['Explicit',      track.explicit ? 'Yes' : 'No'],
    ];

    document.getElementById('info-stats').innerHTML = stats
      .map(([k,v]) => `<span class="stat-label">${k}</span><span class="stat-val">${v}</span>`)
      .join('');

    this._infoPanel.classList.add('open');
  }
}

function formatDuration(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
