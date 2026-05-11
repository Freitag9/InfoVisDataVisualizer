import * as BABYLON from '@babylonjs/core';
import { AXIS_OPTIONS } from '../utils/DataUtils.js';

const TICK_COUNT  = 5;
const LABEL_SCALE = 0.25;
const AXIS_ALPHA  = 0.6;

export class AxisRenderer {
  constructor(scene, parent, plotSize) {
    this.scene    = scene;
    this.parent   = parent;
    this.plotSize = plotSize;
    this._meshes  = [];
    this._labels  = [];
  }

  update(axisX, axisY, axisZ) {
    this._clear();
    this._buildAxis('x', axisX, new BABYLON.Vector3(1,0,0), new BABYLON.Color3(1,0.3,0.3));
    this._buildAxis('y', axisY, new BABYLON.Vector3(0,1,0), new BABYLON.Color3(0.3,1,0.3));
    this._buildAxis('z', axisZ, new BABYLON.Vector3(0,0,1), new BABYLON.Color3(0.3,0.5,1));
  }

  _buildAxis(id, field, dir, color) {
    const s = this.plotSize;
    const origin = BABYLON.Vector3.Zero();

    // Axis line
    const line = BABYLON.MeshBuilder.CreateLines(`axis_${id}`, {
      points: [origin, dir.scale(s)],
    }, this.scene);
    line.color   = color;
    line.alpha   = AXIS_ALPHA;
    line.setParent(this.parent);
    this._meshes.push(line);

    // Axis floor grid lines (XZ plane only)
    if (id === 'x' || id === 'z') {
      this._buildFloorGrid(id, color);
    }

    // Tick marks + labels
    const meta = AXIS_OPTIONS.find(o => o.value === field);
    const label = meta?.label ?? field;
    const min   = meta?.min ?? 0;
    const max   = meta?.max ?? 1;

    for (let i = 0; i <= TICK_COUNT; i++) {
      const t   = i / TICK_COUNT;
      const pos = dir.scale(t * s);
      const val = min + t * (max - min);
      const txt = Number.isInteger(val) ? String(val) : val.toFixed(2);

      this._makeLabel(`${txt}`, pos, color);
    }

    // Axis name label at the end + a bit offset
    const namePos = dir.scale(s * 1.08);
    this._makeLabel(label, namePos, color, 1.5);
  }

  _buildFloorGrid(id, color) {
    const s     = this.plotSize;
    const steps = TICK_COUNT;
    const points= [];

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * s;
      if (id === 'x') {
        points.push([new BABYLON.Vector3(t,0,0), new BABYLON.Vector3(t,0,s)]);
      } else {
        points.push([new BABYLON.Vector3(0,0,t), new BABYLON.Vector3(s,0,t)]);
      }
    }

    const grid = BABYLON.MeshBuilder.CreateLineSystem(`grid_${id}`, { lines: points }, this.scene);
    grid.color = color;
    grid.alpha = 0.12;
    grid.setParent(this.parent);
    this._meshes.push(grid);
  }

  _makeLabel(text, position, color, scaleMult = 1) {
    // Dynamic texture label rendered on a plane
    const plane = BABYLON.MeshBuilder.CreatePlane(`lbl_${text}_${Math.random()}`, {
      width:  text.length * 0.12 * scaleMult,
      height: 0.18 * scaleMult,
    }, this.scene);
    plane.position.copyFrom(position);
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    plane.setParent(this.parent);

    const dt  = new BABYLON.DynamicTexture(`dt_${text}`, { width: 256, height: 64 }, this.scene);
    dt.drawText(text, null, 48, `bold ${Math.round(32 * scaleMult)}px monospace`,
      `rgb(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)})`,
      'transparent', true);

    const mat = new BABYLON.StandardMaterial(`lblMat_${text}`, this.scene);
    mat.diffuseTexture  = dt;
    mat.emissiveTexture = dt;
    mat.opacityTexture  = dt;
    mat.backFaceCulling = false;
    mat.disableLighting = true;
    plane.material = mat;

    this._meshes.push(plane);
    this._labels.push(dt);
  }

  _clear() {
    for (const m of this._meshes) m.dispose();
    for (const t of this._labels) t.dispose();
    this._meshes = [];
    this._labels = [];
  }

  dispose() { this._clear(); }
}
