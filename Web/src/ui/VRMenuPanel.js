import * as BABYLON from '@babylonjs/core';
import { AdvancedDynamicTexture, StackPanel, Button, TextBlock, Slider, Rectangle } from '@babylonjs/gui';
import { filterState } from '../data/FilterState.js';
import { AXIS_OPTIONS } from '../utils/DataUtils.js';

const PANEL_W = 0.5; // meters
const PANEL_H = 0.7;

/**
 * 3D wrist-mounted menu for VR mode.
 * Attaches to the left controller grip and becomes visible
 * when the VRManager detects palm-toward-head.
 */
export class VRMenuPanel {
  constructor(scene) {
    this.scene    = scene;
    this._plane   = null;
    this._texture = null;
    this._build();
  }

  _build() {
    this._plane = BABYLON.MeshBuilder.CreatePlane('vrMenu', {
      width: PANEL_W, height: PANEL_H,
    }, this.scene);
    this._plane.isVisible = false;
    // Offset so it floats above the controller
    this._plane.position.set(0, 0.12, 0);
    this._plane.rotation.x = -Math.PI / 6; // tilt toward user

    this._texture = AdvancedDynamicTexture.CreateForMesh(this._plane, 512, 720);
    this._texture.background = 'rgba(10,10,20,0.92)';

    const root = new StackPanel();
    root.paddingTopInPixels = 16;
    root.paddingLeftInPixels = 16;
    root.paddingRightInPixels = 16;
    this._texture.addControl(root);

    this._addHeader(root, 'Spotify Visualizer');
    this._addSectionLabel(root, 'AXES');
    this._addAxisPicker(root, 'X Axis', 'axisX', 0);
    this._addAxisPicker(root, 'Y Axis', 'axisY', 1);
    this._addAxisPicker(root, 'Z Axis', 'axisZ', 2);
    this._addSectionLabel(root, 'FILTERS');
    this._addSliderRow(root, 'Min Popularity', 0, 100, filterState.minPopularity,
      v => filterState.set({ minPopularity: v }));
    this._addSliderRow(root, 'Max Popularity', 0, 100, filterState.maxPopularity,
      v => filterState.set({ maxPopularity: v }));
    this._addSliderRow(root, 'Min Energy', 0, 100, filterState.minEnergy * 100,
      v => filterState.set({ minEnergy: v / 100 }));
    this._addSliderRow(root, 'Max Energy', 0, 100, filterState.maxEnergy * 100,
      v => filterState.set({ maxEnergy: v / 100 }));
    this._addSliderRow(root, 'Track Count', 50, 2000, filterState.trackCount,
      v => filterState.set({ trackCount: Math.round(v) }));
  }

  _addHeader(root, text) {
    const t = new TextBlock();
    t.text       = text;
    t.color      = '#1db954';
    t.fontSize   = 28;
    t.fontWeight = 'bold';
    t.height     = '44px';
    t.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    root.addControl(t);
  }

  _addSectionLabel(root, text) {
    const t = new TextBlock();
    t.text     = text;
    t.color    = '#555';
    t.fontSize = 16;
    t.height   = '28px';
    t.paddingTopInPixels = 12;
    t.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    root.addControl(t);
  }

  _addAxisPicker(root, label, field, _dim) {
    const options = AXIS_OPTIONS.map(o => o.value);
    let idx = options.indexOf(filterState[field]);
    if (idx < 0) idx = 0;

    const row = new StackPanel();
    row.isVertical = false;
    row.height = '40px';

    const lbl = new TextBlock();
    lbl.text   = label;
    lbl.color  = '#aaa';
    lbl.width  = '140px';
    lbl.fontSize = 18;

    const btnPrev = Button.CreateSimpleButton('prev', '◀');
    btnPrev.width = '36px'; btnPrev.color = '#fff'; btnPrev.background = '#222';
    btnPrev.fontSize = 18;

    const valLbl = new TextBlock();
    valLbl.text   = AXIS_OPTIONS[idx].label;
    valLbl.color  = '#1db954';
    valLbl.width  = '150px';
    valLbl.fontSize = 16;

    const btnNext = Button.CreateSimpleButton('next', '▶');
    btnNext.width = '36px'; btnNext.color = '#fff'; btnNext.background = '#222';
    btnNext.fontSize = 18;

    btnPrev.onPointerClickObservable.add(() => {
      idx = (idx - 1 + options.length) % options.length;
      valLbl.text = AXIS_OPTIONS[idx].label;
      filterState.set({ [field]: options[idx] });
    });
    btnNext.onPointerClickObservable.add(() => {
      idx = (idx + 1) % options.length;
      valLbl.text = AXIS_OPTIONS[idx].label;
      filterState.set({ [field]: options[idx] });
    });

    row.addControl(lbl);
    row.addControl(btnPrev);
    row.addControl(valLbl);
    row.addControl(btnNext);
    root.addControl(row);
  }

  _addSliderRow(root, label, min, max, initial, onChange) {
    const lbl = new TextBlock();
    lbl.text = `${label}: ${Math.round(initial)}`;
    lbl.color = '#aaa'; lbl.fontSize = 16; lbl.height = '24px';
    lbl.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

    const slider = new Slider();
    slider.minimum = min; slider.maximum = max; slider.value = initial;
    slider.height = '28px';
    slider.color = '#1db954'; slider.background = '#222';
    slider.thumbColor = '#fff';
    slider.onValueChangedObservable.add(v => {
      lbl.text = `${label}: ${Math.round(v)}`;
      onChange(v);
    });

    root.addControl(lbl);
    root.addControl(slider);
  }

  attachTo(node) {
    this._plane.setParent(node);
  }

  setVisible(v) {
    this._plane.isVisible = v;
  }

  dispose() {
    this._texture?.dispose();
    this._plane?.dispose();
  }
}
