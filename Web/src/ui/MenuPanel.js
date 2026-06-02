import { filterState } from '../data/FilterState.js';
import { AXIS_OPTIONS, denormalizeLabel } from '../utils/DataUtils.js';
import { colorForGenre, familyForGenre, getLegend } from '../utils/ColorMapper.js';
import { addRecent, getRecent } from '../utils/RecentlyViewed.js';
import { DualRange } from './DualRange.js';
import { FEATURE_INFO, ENCODING_INFO } from '../utils/FeatureInfo.js';

export class MenuPanel {
  constructor(scatterPlot) {
    this._plot      = scatterPlot;
    this._infoPanel = document.getElementById('info-panel');
    this._buildAxisSelects();
    this._bindFilters();
    this._initSearch();
    this._renderRecent();
    this._initGlossary();
    this._renderLegend();
  }

  // ── Genre family legend ───────────────────────────────────
  _renderLegend() {
    const el = document.getElementById('legend-list');
    if (!el) return;
    el.innerHTML = getLegend().map(({ family, color }) =>
      `<div class="legend-item">
        <span class="legend-swatch" style="background:${color}"></span>
        <span class="legend-name">${family}</span>
      </div>`
    ).join('');
  }

  // ── Glossary overlay (feature descriptions) ───────────────
  _initGlossary() {
    const overlay = document.getElementById('glossary-overlay');
    const body    = document.getElementById('glossary-body');
    if (!overlay || !body) return;

    let html = '<div class="gloss-section">Achsen-Werte</div>';
    for (const f of FEATURE_INFO) {
      html += `<div class="gloss-item">
        <div class="gloss-name"><b>${f.label}</b><span class="gloss-range">${f.range}</span></div>
        <div class="gloss-desc">${f.desc}</div>
      </div>`;
    }
    html += '<div class="gloss-section">Darstellung &amp; Filter</div>';
    for (const e of ENCODING_INFO) {
      html += `<div class="gloss-item">
        <div class="gloss-name"><b>${e.label}</b></div>
        <div class="gloss-desc">${e.desc}</div>
      </div>`;
    }
    body.innerHTML = html;

    const open  = () => overlay.classList.add('open');
    const close = () => overlay.classList.remove('open');
    document.getElementById('glossary-btn')?.addEventListener('click', open);
    document.getElementById('glossary-close')?.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  }

  // ── Axis selects + coupled dual-range filters ─────────────
  _buildAxisSelects() {
    const dims = [
      { sel: 'axis-x', dim: 0, field: 'axisX', range: 'rangeX' },
      { sel: 'axis-y', dim: 1, field: 'axisY', range: 'rangeY' },
      { sel: 'axis-z', dim: 2, field: 'axisZ', range: 'rangeZ' },
    ];
    this._ranges = {};

    for (const d of dims) {
      const el = document.getElementById(d.sel);
      for (const opt of AXIS_OPTIONS) {
        const o = document.createElement('option');
        o.value = opt.value; o.textContent = opt.label;
        if (opt.value === filterState[d.field]) o.selected = true;
        el.appendChild(o);
      }

      // Dual-thumb slider in normalized 0..100 space
      const slider = new DualRange(document.getElementById(d.range), {
        min: 0, max: 100, step: 1, valueMin: 0, valueMax: 100,
        onChange: (lo, hi) => {
          filterState.setRange(d.dim, lo / 100, hi / 100);
          this._updateRangeLabel(d);
        },
      });
      this._ranges[d.dim] = slider;

      el.addEventListener('change', () => {
        filterState.setAxis(d.dim, el.value);
        slider.set(0, 100);              // reset range on axis change
        this._updateRangeLabel(d);
      });

      this._updateRangeLabel(d);
    }
  }

  _updateRangeLabel(d) {
    const lbl = document.getElementById(`${d.range}-v`);
    if (!lbl) return;
    const r = filterState[d.range];
    const field = filterState[d.field];
    if (r.min <= 0.001 && r.max >= 0.999) { lbl.textContent = 'all'; return; }
    lbl.textContent = `${denormalizeLabel(field, r.min)} – ${denormalizeLabel(field, r.max)}`;
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

  // ── Base filters ──────────────────────────────────────────
  _bindFilters() {
    // Popularity dual-range
    const pLbl = document.getElementById('pop-v');
    new DualRange(document.getElementById('pop-range'), {
      min: 0, max: 100, step: 1, valueMin: 0, valueMax: 100,
      onChange: (lo, hi) => {
        if (pLbl) pLbl.textContent = `${lo} – ${hi}`;
        filterState.set({ minPopularity: lo, maxPopularity: hi });
      },
    });

    // Vocal segmented control
    this._bindSegmented('seg-vocal', val => filterState.set({ vocal: val }));

    const cb = document.getElementById('filter-explicit');
    cb?.addEventListener('change', () => filterState.set({ explicitOnly: cb.checked }));

    const cnt  = document.getElementById('track-count');
    const cntL = document.getElementById('count-label');
    cnt?.addEventListener('input', () => {
      const v = parseInt(cnt.value);
      if (cntL) cntL.textContent = v;
      filterState.setTrackCount(v);
    });
  }

  _bindSegmented(id, onSelect) {
    const group = document.getElementById(id);
    if (!group) return;
    group.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onSelect(btn.dataset.val);
      });
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
    chip.textContent      = `${track.track_genre} · ${familyForGenre(track.track_genre)}`;
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
