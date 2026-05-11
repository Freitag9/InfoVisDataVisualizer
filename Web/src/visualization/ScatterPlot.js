import * as BABYLON from '@babylonjs/core';
import { normalize, shuffle } from '../utils/DataUtils.js';
import { colorForGenre, hexToRGB01 } from '../utils/ColorMapper.js';
import { filterState } from '../data/FilterState.js';
import { AxisRenderer } from './AxisRenderer.js';
import { ProjectionRay } from './ProjectionRay.js';

const PLOT_SIZE = 10;
const BASE_SPHERE_SEGMENTS = 8;

export class ScatterPlot {
  constructor(scene) {
    this.scene     = scene;
    this.root      = new BABYLON.TransformNode('scatterPlot', scene);
    this.spheres   = [];   // TrackPoint meshes currently in scene
    this.allTracks = [];   // full dataset
    this.selected  = null;

    this._axisRenderer  = new AxisRenderer(scene, this.root, PLOT_SIZE);
    this._projectionRay = new ProjectionRay(scene, this.root);

    this._template = BABYLON.MeshBuilder.CreateSphere(
      '_sphereTemplate', { diameter: 1, segments: BASE_SPHERE_SEGMENTS }, scene,
    );
    this._template.isVisible = false;
    this._template.setParent(this.root);

    filterState.onChange(() => this.rebuild());
  }

  setTracks(tracks) {
    this.allTracks = tracks;
    this.rebuild();
  }

  /** Returns up to `limit` tracks whose name matches the query (case-insensitive). */
  findTracks(query, limit = 8) {
    if (!query) return [];
    const q = query.toLowerCase();
    const results = [];
    for (const t of this.allTracks) {
      if (t.track_name.toLowerCase().includes(q)) {
        results.push(t);
        if (results.length >= limit) break;
      }
    }
    return results;
  }

  /** Highlight a track sphere by track_id. Returns true if found in current render. */
  highlightTrack(trackId) {
    const mesh = this.spheres.find(m => m.metadata?.track?.track_id === trackId);
    if (mesh) {
      this.selectSphere(mesh);
      // Fly camera toward the sphere
      const cam = this.scene.activeCamera;
      if (cam?.setTarget) {
        const worldPos = BABYLON.Vector3.TransformCoordinates(
          mesh.position, this.root.getWorldMatrix(),
        );
        cam.setTarget(worldPos);
      }
      return true;
    }
    return false;
  }

  rebuild() {
    this._clearSpheres();
    const fs = filterState;

    let filtered = this.allTracks.filter(t => fs.passes(t));
    shuffle(filtered);
    if (filtered.length > fs.trackCount) filtered.length = fs.trackCount;

    for (const track of filtered) this._spawnSphere(track);

    this._axisRenderer.update(fs.axisX, fs.axisY, fs.axisZ);
    this._projectionRay.hide();
    this.selected = null;
  }

  _spawnSphere(track) {
    const fs   = filterState;
    const nx   = normalize(track, fs.axisX);
    const ny   = normalize(track, fs.axisY);
    const nz   = normalize(track, fs.axisZ);
    const popN = track.popularity / 100;
    const r    = 0.04 + popN * 0.18;

    const mesh = this._template.clone(`sphere_${track.track_id}`);
    mesh.isVisible = true;
    mesh.scaling.setAll(r * 2);
    mesh.position.set(nx * PLOT_SIZE, ny * PLOT_SIZE, nz * PLOT_SIZE);

    const hex      = colorForGenre(track.track_genre);
    const { r: cr, g: cg, b: cb } = hexToRGB01(hex);
    const mat      = new BABYLON.StandardMaterial(`mat_${track.track_id}`, this.scene);
    mat.diffuseColor  = new BABYLON.Color3(cr, cg, cb);
    mat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
    mat.emissiveColor = new BABYLON.Color3(cr * 0.15, cg * 0.15, cb * 0.15);
    mesh.material = mat;
    mesh.metadata = { track, r: cr, g: cg, b: cb };
    mesh.isPickable = true;

    mesh.actionManager = new BABYLON.ActionManager(this.scene);
    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPickTrigger, () => this.selectSphere(mesh),
    ));
    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPointerOverTrigger,
      () => { mat.emissiveColor = new BABYLON.Color3(cr * 0.6, cg * 0.6, cb * 0.6); },
    ));
    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPointerOutTrigger,
      () => { mat.emissiveColor = new BABYLON.Color3(cr * 0.15, cg * 0.15, cb * 0.15); },
    ));

    this.spheres.push(mesh);
  }

  selectSphere(mesh) {
    if (this.selected) {
      const { r, g, b } = this.selected.metadata;
      this.selected.material.emissiveColor = new BABYLON.Color3(r * 0.15, g * 0.15, b * 0.15);
    }
    this.selected = mesh;
    const { r, g, b } = mesh.metadata;
    mesh.material.emissiveColor = new BABYLON.Color3(r * 0.8, g * 0.8, b * 0.8);
    this._projectionRay.show(mesh.position, mesh.metadata.track, filterState);
    this.scene.metadata?.onTrackSelected?.(mesh.metadata.track);
  }

  onVRPick(mesh) {
    if (mesh?.metadata?.track) this.selectSphere(mesh);
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
