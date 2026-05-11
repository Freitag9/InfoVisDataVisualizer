import * as BABYLON from '@babylonjs/core';
import { AXIS_OPTIONS, displayValue } from '../utils/DataUtils.js';

/**
 * When a sphere is selected, shows:
 *  - vertical line from sphere down to XZ floor (Y=0)
 *  - crosshair lines on the floor: to X-axis edge and to Z-axis edge
 *  - dot at floor intersection
 *  - text labels with exact values at axis edges
 */
export class ProjectionRay {
  constructor(scene, parent) {
    this.scene  = scene;
    this.parent = parent;
    this._meshes= [];
    this._visible = false;
  }

  show(spherePos, track, filterState) {
    this.hide();

    const { x, y, z } = spherePos;
    const floor = 0; // Y = 0 is the XZ plane

    const lineColor = new BABYLON.Color3(1, 0.9, 0.2);

    // Vertical drop line
    this._line([new BABYLON.Vector3(x, y, z), new BABYLON.Vector3(x, floor, z)], lineColor, 0.8);

    // Floor crosshair: to X-axis (z=0 edge)
    this._line([new BABYLON.Vector3(x, floor, z), new BABYLON.Vector3(x, floor, 0)], lineColor, 0.5);
    // Floor crosshair: to Z-axis (x=0 edge)
    this._line([new BABYLON.Vector3(x, floor, z), new BABYLON.Vector3(0, floor, z)], lineColor, 0.5);

    // Dot on floor
    const dot = BABYLON.MeshBuilder.CreateSphere('proj_dot', { diameter: 0.08 }, this.scene);
    dot.position.set(x, floor, z);
    dot.setParent(this.parent);
    const dotMat = new BABYLON.StandardMaterial('proj_dot_mat', this.scene);
    dotMat.emissiveColor = lineColor;
    dotMat.disableLighting = true;
    dot.material = dotMat;
    this._meshes.push(dot);

    // Value labels at axis edges
    const xMeta = AXIS_OPTIONS.find(o => o.value === filterState.axisX);
    const yMeta = AXIS_OPTIONS.find(o => o.value === filterState.axisY);
    const zMeta = AXIS_OPTIONS.find(o => o.value === filterState.axisZ);

    this._valueLabel(
      `${xMeta?.label ?? filterState.axisX}: ${displayValue(track, filterState.axisX)}`,
      new BABYLON.Vector3(x, floor - 0.3, -0.5),
      lineColor,
    );
    this._valueLabel(
      `${zMeta?.label ?? filterState.axisZ}: ${displayValue(track, filterState.axisZ)}`,
      new BABYLON.Vector3(-0.5, floor - 0.3, z),
      lineColor,
    );
    this._valueLabel(
      `${yMeta?.label ?? filterState.axisY}: ${displayValue(track, filterState.axisY)}`,
      new BABYLON.Vector3(x + 0.4, y, z),
      new BABYLON.Color3(0.3, 1, 0.3),
    );

    this._visible = true;
  }

  hide() {
    for (const m of this._meshes) { m.material?.dispose(); m.dispose(); }
    this._meshes = [];
    this._visible = false;
  }

  _line(points, color, alpha = 1) {
    const l = BABYLON.MeshBuilder.CreateLines(`proj_line_${Math.random()}`, { points }, this.scene);
    l.color = color;
    l.alpha = alpha;
    l.setParent(this.parent);
    this._meshes.push(l);
  }

  _valueLabel(text, position, color) {
    const plane = BABYLON.MeshBuilder.CreatePlane(`proj_lbl_${Math.random()}`, {
      width: text.length * 0.08, height: 0.2,
    }, this.scene);
    plane.position.copyFrom(position);
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    plane.setParent(this.parent);

    const dt = new BABYLON.DynamicTexture(`proj_dt_${Math.random()}`, { width: 512, height: 64 }, this.scene);
    dt.drawText(text, 4, 48, 'bold 28px monospace',
      `rgb(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)})`,
      'transparent', true);

    const mat = new BABYLON.StandardMaterial(`proj_mat_${Math.random()}`, this.scene);
    mat.diffuseTexture  = dt;
    mat.emissiveTexture = dt;
    mat.opacityTexture  = dt;
    mat.backFaceCulling = false;
    mat.disableLighting = true;
    plane.material = mat;
    this._meshes.push(plane);
  }

  dispose() { this.hide(); }
}
