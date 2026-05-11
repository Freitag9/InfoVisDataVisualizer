import * as BABYLON from '@babylonjs/core';
import { normalize, shuffle } from '../utils/DataUtils.js';
import { colorForGenre, hexToRGB01 } from '../utils/ColorMapper.js';
import { filterState } from '../data/FilterState.js';
import { AxisRenderer } from './AxisRenderer.js';
import { ProjectionRay } from './ProjectionRay.js';

const PLOT_SIZE = 10;
const BASE_SPHERE_SEGMENTS = 8; // low poly for performance

export class ScatterPlot {
  /** @param {BABYLON.Scene} scene */
  constructor(scene) {
    this.scene    = scene;
    this.root     = new BABYLON.TransformNode('scatterPlot', scene);
    this.spheres  = [];
    this.allTracks= [];
    this.selected = null;

    this._axisRenderer  = new AxisRenderer(scene, this.root, PLOT_SIZE);
    this._projectionRay = new ProjectionRay(scene, this.root);

    // Template sphere (cloned for each track)
    this._template = BABYLON.MeshBuilder.CreateSphere(
      '_sphereTemplate',
      { diameter: 1, segments: BASE_SPHERE_SEGMENTS },
      scene,
    );
    this._template.isVisible = false;
    this._template.setParent(this.root);

    filterState.onChange(() => this.rebuild());
  }

  setTracks(tracks) {
    this.allTracks = tracks;
    this.rebuild();
  }

  rebuild() {
    this._clearSpheres();
    const fs = filterState;

    let filtered = this.allTracks.filter(t => fs.passes(t));
    shuffle(filtered);
    if (filtered.length > fs.trackCount) filtered.length = fs.trackCount;

    for (const track of filtered) {
      this._spawnSphere(track);
    }

    this._axisRenderer.update(fs.axisX, fs.axisY, fs.axisZ);
    this._projectionRay.hide();
    this.selected = null;
  }

  _spawnSphere(track) {
    const fs    = filterState;
    const nx    = normalize(track, fs.axisX);
    const ny    = normalize(track, fs.axisY);
    const nz    = normalize(track, fs.axisZ);
    const popN  = track.popularity / 100;
    const radius= 0.04 + popN * 0.18;

    const mesh  = this._template.clone(`sphere_${track.track_id}`);
    mesh.isVisible = true;
    mesh.scaling.setAll(radius * 2);
    mesh.position.set(nx * PLOT_SIZE, ny * PLOT_SIZE, nz * PLOT_SIZE);

    const hex   = colorForGenre(track.track_genre);
    const { r, g, b } = hexToRGB01(hex);
    const mat   = new BABYLON.StandardMaterial(`mat_${track.track_id}`, this.scene);
    mat.diffuseColor  = new BABYLON.Color3(r, g, b);
    mat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
    mat.emissiveColor = new BABYLON.Color3(r * 0.15, g * 0.15, b * 0.15);
    mesh.material = mat;

    mesh.metadata = { track, radius };
    mesh.isPickable = true;

    mesh.actionManager = new BABYLON.ActionManager(this.scene);
    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPickTrigger,
      () => this.selectSphere(mesh),
    ));

    // Hover glow
    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPointerOverTrigger,
      () => { mat.emissiveColor = new BABYLON.Color3(r * 0.6, g * 0.6, b * 0.6); },
    ));
    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPointerOutTrigger,
      () => { mat.emissiveColor = new BABYLON.Color3(r * 0.15, g * 0.15, b * 0.15); },
    ));

    this.spheres.push(mesh);
  }

  selectSphere(mesh) {
    if (this.selected) {
      const prev = this.selected.metadata;
      const { r, g, b } = hexToRGB01(colorForGenre(prev.track.track_genre));
      this.selected.material.emissiveColor = new BABYLON.Color3(r * 0.15, g * 0.15, b * 0.15);
    }

    this.selected = mesh;
    const { r, g, b } = hexToRGB01(colorForGenre(mesh.metadata.track.track_genre));
    mesh.material.emissiveColor = new BABYLON.Color3(r * 0.8, g * 0.8, b * 0.8);

    this._projectionRay.show(mesh.position, mesh.metadata.track, filterState);
    this.scene.metadata?.onTrackSelected?.(mesh.metadata.track);
  }

  /** Called by VR ray interactor with a picked mesh */
  onVRPick(mesh) {
    if (mesh && mesh.metadata?.track) this.selectSphere(mesh);
  }

  setPosition(pos) { this.root.position.copyFrom(pos); }
  setScaling(s)    { this.root.scaling.setAll(s); }

  _clearSpheres() {
    for (const m of this.spheres) { m.material?.dispose(); m.dispose(); }
    this.spheres = [];
  }

  dispose() {
    this._clearSpheres();
    this._axisRenderer.dispose();
    this._projectionRay.dispose();
    this._template.dispose();
    this.root.dispose();
  }
}
