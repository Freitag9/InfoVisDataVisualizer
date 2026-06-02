/**
 * Dual-thumb range slider — one track, two draggable handles (min + max).
 * Builds its DOM into the given container.
 *
 * new DualRange(containerEl, { min, max, step, valueMin, valueMax, onChange })
 *   onChange(min, max) fires live while dragging.
 */
export class DualRange {
  constructor(container, opts) {
    this.min  = opts.min ?? 0;
    this.max  = opts.max ?? 100;
    this.step = opts.step ?? 1;
    this.lo   = opts.valueMin ?? this.min;
    this.hi   = opts.valueMax ?? this.max;
    this.onChange = opts.onChange ?? (() => {});

    container.classList.add('dual-range');
    container.innerHTML = `
      <div class="dr-rail"></div>
      <div class="dr-fill"></div>
      <input type="range" class="dr-input dr-lo">
      <input type="range" class="dr-input dr-hi">
    `;
    this._fill = container.querySelector('.dr-fill');
    this._loEl = container.querySelector('.dr-lo');
    this._hiEl = container.querySelector('.dr-hi');

    for (const el of [this._loEl, this._hiEl]) {
      el.min = this.min; el.max = this.max; el.step = this.step;
    }
    this._loEl.value = this.lo;
    this._hiEl.value = this.hi;

    this._loEl.addEventListener('input', () => this._onInput('lo'));
    this._hiEl.addEventListener('input', () => this._onInput('hi'));

    this._render();
  }

  _onInput(which) {
    let lo = parseFloat(this._loEl.value);
    let hi = parseFloat(this._hiEl.value);
    // Prevent thumbs crossing
    if (lo > hi) {
      if (which === 'lo') { hi = lo; this._hiEl.value = hi; }
      else                { lo = hi; this._loEl.value = lo; }
    }
    this.lo = lo; this.hi = hi;
    this._render();
    this.onChange(lo, hi);
  }

  _render() {
    const span = this.max - this.min || 1;
    const lPct = ((this.lo - this.min) / span) * 100;
    const hPct = ((this.hi - this.min) / span) * 100;
    this._fill.style.left  = `${lPct}%`;
    this._fill.style.width = `${hPct - lPct}%`;
    // Raise whichever thumb is on top depending on position so both stay grabbable
    this._loEl.style.zIndex = lPct > 90 ? 5 : 3;
    this._hiEl.style.zIndex = 4;
  }

  /** Programmatically set values (e.g. reset on axis change). */
  set(lo, hi) {
    this.lo = lo; this.hi = hi;
    this._loEl.value = lo; this._hiEl.value = hi;
    this._render();
  }
}
