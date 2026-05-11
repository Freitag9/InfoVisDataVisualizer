import { filterState } from '../data/FilterState.js';
import { AXIS_OPTIONS } from '../utils/DataUtils.js';
import { colorForGenre } from '../utils/ColorMapper.js';
import { addRecent, getRecent } from '../utils/RecentlyViewed.js';

export class MenuPanel {
  constructor(scatterPlot) {
    this._plot      = scatterPlot;
    this._infoPanel = document.getElementById('info-panel');
    this._buildAxisSelects();
    this._bindFilters();
    this._initSearch();
    this._renderRecent();
  }

  // ── Axis selects ──────────────────────────────────────────
  _buildAxisSelects() {
    const build = (id, currentVal, field) => {
      const el = document.getElementById(id);
      if (!el) return;
      for (const opt of AXIS_OPTIONS) {
        const o = document.createElement('option');
        o.value = opt.value; o.textContent = opt.label;
        if (opt.value === currentVal) o.selected = true;
        el.appendChild(o);
      }
      el.addEventListener('change', () => filterState.set({ [field]: el.value }));
    };
    build('axis-x', filterState.axisX, 'axisX');
    build('axis-y', filterState.axisY, 'axisY');
    build('axis-z', filterState.axisZ, 'axisZ');
  }

  populateGenres(genres) {
    const sel = document.getElementById('filter-genre');
    if (!sel) return;
    for (const g of genres) {
      const o = document.createElement('option');
      o.value = g; o.textContent = g; sel.appendChild(o);
    }
    sel.addEventListener('change', () => filterState.set({ genre: sel.value }));
  }

  // ── Filters ───────────────────────────────────────────────
  _bindFilters() {
    const bindRange = (id, valId, scale, key, dec) => {
      const el = document.getElementById(id);
      const lbl= document.getElementById(valId);
      if (!el) return;
      el.addEventListener('input', () => {
        const v = parseFloat(el.value) / scale;
        if (lbl) lbl.textContent = dec ? v.toFixed(dec) : Math.round(v);
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

    const cb = document.getElementById('filter-explicit');
    if (cb) cb.addEventListener('change', () => filterState.set({ explicitOnly: cb.checked }));

    const cnt = document.getElementById('track-count');
    const cntL= document.getElementById('count-label');
    if (cnt) cnt.addEventListener('input', () => {
      const v = parseInt(cnt.value);
      if (cntL) cntL.textContent = v;
      filterState.set({ trackCount: v });
    });
  }

  // ── Search ────────────────────────────────────────────────
  _initSearch() {
    const input    = document.getElementById('search-input');
    const dropdown = document.getElementById('search-dropdown');
    if (!input || !dropdown) return;

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      const q = input.value.trim();
      if (!q) { dropdown.classList.remove('open'); return; }
      debounce = setTimeout(() => this._updateSearchResults(q, input, dropdown), 150);
    });

    // Close dropdown on outside click/tap
    document.addEventListener('pointerdown', e => {
      if (!input.contains(e.target) && !dropdown.contains(e.target))
        dropdown.classList.remove('open');
    });

    // Clear button
    document.getElementById('search-clear')?.addEventListener('click', () => {
      input.value = '';
      dropdown.classList.remove('open');
      input.focus();
    });
  }

  _updateSearchResults(query, input, dropdown) {
    const results = this._plot.findTracks(query, 8);
    dropdown.innerHTML = '';

    if (!results.length) {
      dropdown.innerHTML = '<div class="search-empty">No tracks found</div>';
      dropdown.classList.add('open');
      return;
    }

    for (const track of results) {
      const item = document.createElement('div');
      item.className = 'search-item';
      const col = colorForGenre(track.track_genre);
      item.innerHTML = `
        <span class="si-dot" style="background:${col}"></span>
        <span class="si-info">
          <span class="si-name">${escapeHtml(track.track_name)}</span>
          <span class="si-artist">${escapeHtml(track.artists)}</span>
        </span>
        <span class="si-pop">${track.popularity}</span>`;

      item.addEventListener('pointerdown', e => {
        e.preventDefault();
        input.value = track.track_name;
        dropdown.classList.remove('open');
        const found = this._plot.highlightTrack(track.track_id);
        if (!found) {
          // Track not in current render — show info anyway
          this.showTrackInfo(track);
        }
      });
      dropdown.appendChild(item);
    }
    dropdown.classList.add('open');
  }

  // ── Recently Viewed ───────────────────────────────────────
  _renderRecent() {
    const container = document.getElementById('recent-list');
    if (!container) return;
    this._refreshRecent(container);
  }

  _refreshRecent(container) {
    if (!container) container = document.getElementById('recent-list');
    if (!container) return;
    const items = getRecent();
    if (!items.length) {
      container.innerHTML = '<div class="recent-empty">Nothing yet</div>';
      return;
    }
    container.innerHTML = '';
    for (const t of items) {
      const el  = document.createElement('div');
      el.className = 'recent-item';
      const col = colorForGenre(t.track_genre);
      el.innerHTML = `
        <span class="ri-dot" style="background:${col}"></span>
        <span class="ri-info">
          <span class="ri-name">${escapeHtml(t.track_name)}</span>
          <span class="ri-artist">${escapeHtml(t.artists)}</span>
        </span>
        <span class="ri-pop">${t.popularity}</span>`;
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        this._plot.highlightTrack(t.track_id);
      });
      container.appendChild(el);
    }
  }

  // ── Track Info Panel ──────────────────────────────────────
  showTrackInfo(track) {
    if (!track) { this._infoPanel.classList.remove('open'); return; }

    addRecent(track);
    this._refreshRecent();

    document.getElementById('info-name').textContent   = track.track_name;
    document.getElementById('info-artist').textContent = track.artists;

    const chip = document.getElementById('info-genre');
    const col  = colorForGenre(track.track_genre);
    chip.textContent      = track.track_genre;
    chip.style.background = col + '33';
    chip.style.color      = col;
    chip.style.border     = `1px solid ${col}`;

    document.getElementById('info-stats').innerHTML = [
      ['Popularity',    `${track.popularity}/100`],
      ['Danceability',  track.danceability.toFixed(3)],
      ['Energy',        track.energy.toFixed(3)],
      ['Valence',       track.valence.toFixed(3)],
      ['Tempo',         `${track.tempo.toFixed(0)} BPM`],
      ['Loudness',      `${track.loudness.toFixed(1)} dB`],
      ['Acousticness',  track.acousticness.toFixed(3)],
      ['Duration',      formatDuration(track.duration_ms)],
      ['Explicit',      track.explicit ? 'Yes' : 'No'],
    ].map(([k,v]) =>
      `<span class="stat-label">${k}</span><span class="stat-val">${v}</span>`
    ).join('');

    this._infoPanel.classList.add('open');
  }

  // ── XR visibility ─────────────────────────────────────────
  hideForXR() {
    document.getElementById('menu-toggle').style.display = 'none';
    document.getElementById('search-bar').style.display  = 'none';
    document.getElementById('menu-panel').classList.remove('open');
    document.getElementById('menu-overlay').classList.remove('open');
  }

  showForDesktop() {
    document.getElementById('menu-toggle').style.display = 'flex';
    document.getElementById('search-bar').style.display  = 'flex';
  }
}

function formatDuration(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
