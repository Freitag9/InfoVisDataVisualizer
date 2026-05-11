import * as BABYLON from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, StackPanel } from '@babylonjs/gui';
import { colorForGenre } from '../utils/ColorMapper.js';

/**
 * World-space info panel shown inside the VR headset when a track is selected.
 * Positions itself 1.2 m in front of the camera and faces the user (billboard).
 */
export class VRTrackInfoPanel {
  constructor(scene) {
    this.scene  = scene;
    this._plane = BABYLON.MeshBuilder.CreatePlane('vrInfoPanel', {
      width: 0.55, height: 0.45,
    }, scene);
    this._plane.isVisible  = false;
    this._plane.isPickable = false;
    this._plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    this._tex = AdvancedDynamicTexture.CreateForMesh(this._plane, 560, 460);
    this._tex.background = 'rgba(8,8,18,0.95)';

    const root = new StackPanel();
    root.paddingTopInPixels   = 18;
    root.paddingLeftInPixels  = 22;
    root.paddingRightInPixels = 22;
    this._tex.addControl(root);

    this._name   = this._text(root, '', '#ffffff', 28, '52px', 'bold', true);
    this._artist = this._text(root, '', '#aaaaaa', 20, '30px');
    this._genre  = this._text(root, '', '#1db954',  18, '28px');
    this._stats  = this._text(root, '', '#cccccc',  17, '260px', 'normal', true);
  }

  _text(parent, text, color, fontSize, height, fontWeight = 'normal', wrap = false) {
    const t = new TextBlock();
    t.text   = text;
    t.color  = color;
    t.fontSize       = fontSize;
    t.fontWeight     = fontWeight;
    t.height         = height;
    t.textWrapping   = wrap;
    t.textHorizontalAlignment = 0; // left
    t.paddingTopInPixels = 4;
    parent.addControl(t);
    return t;
  }

  show(track, camera) {
    // Position 1.2 m ahead of camera, slightly below eye level
    const fwd = camera.getForwardRay(1).direction.normalize();
    this._plane.position = camera.globalPosition
      .add(fwd.scale(1.2))
      .add(new BABYLON.Vector3(0, -0.08, 0));
    this._plane.isVisible = true;

    this._name.text   = track.track_name;
    this._artist.text = track.artists;
    this._genre.text  = `● ${track.track_genre}`;
    this._genre.color = colorForGenre(track.track_genre);
    this._stats.text  = [
      `Popularity   ${track.popularity} / 100`,
      `Energy       ${track.energy.toFixed(3)}`,
      `Danceability ${track.danceability.toFixed(3)}`,
      `Valence      ${track.valence.toFixed(3)}`,
      `Tempo        ${track.tempo.toFixed(0)} BPM`,
      `Loudness     ${track.loudness.toFixed(1)} dB`,
      `Acousticness ${track.acousticness.toFixed(3)}`,
      `Explicit     ${track.explicit ? 'Yes' : 'No'}`,
    ].join('\n');
  }

  hide()    { this._plane.isVisible = false; }
  dispose() { this._tex?.dispose(); this._plane?.dispose(); }
}
