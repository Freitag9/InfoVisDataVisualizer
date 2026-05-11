import * as BABYLON from '@babylonjs/core';
import { VRMenuPanel } from '../ui/VRMenuPanel.js';
import { VRTrackInfoPanel } from '../ui/VRTrackInfoPanel.js';

const WRIST_DOT   = 0.55;   // palm-toward-head threshold (lower = easier to trigger)
const WRIST_HYST  = 0.08;   // hysteresis to avoid flicker
const MOVE_SPEED  = 0.05;   // m per frame
const DEAD_ZONE   = 0.12;   // thumbstick dead zone

export class VRManager {
  constructor(scene, scatterPlot) {
    this.scene       = scene;
    this.scatterPlot = scatterPlot;
    this._xr         = null;
    this._wristMenu  = null;
    this._infoPanel  = null;
    this._leftCtrl   = null;
    this._rightCtrl  = null;
    this._grabbing   = null;   // { ctrl, offset: Vector3 }
    this._grabObs    = null;   // scene observer while grabbing
    this._menuOpen   = false;
    this._frameObs   = [];     // observers to clean up on exit
  }

  static async isSupported() {
    return navigator.xr?.isSessionSupported?.('immersive-vr') ?? false;
  }

  async enter() {
    const xr = await this.scene.createDefaultXRExperienceAsync({
      uiOptions:        { sessionMode: 'immersive-vr' },
      optionalFeatures: ['local-floor'],
    });
    this._xr        = xr;
    this._wristMenu = new VRMenuPanel(this.scene);
    this._infoPanel = new VRTrackInfoPanel(this.scene);

    // Hook track-selection to show 3D info panel inside headset
    const meta = this.scene.metadata ?? {};
    this.scene.metadata = meta;
    const prevCb = meta.onTrackSelected;
    meta.onTrackSelected = (track) => {
      prevCb?.(track);
      const cam = xr.baseExperience?.camera;
      if (cam) this._infoPanel.show(track, cam);
    };

    xr.input.onControllerAddedObservable.add(ctrl => {
      ctrl.onMotionControllerInitObservable.add(mc => {
        if (mc.handedness === 'left')  this._initLeft(ctrl, mc, xr);
        if (mc.handedness === 'right') this._initRight(ctrl, mc, xr);
      });
    });

    xr.input.onControllerRemovedObservable.add(ctrl => {
      if (ctrl === this._leftCtrl)  this._leftCtrl  = null;
      if (ctrl === this._rightCtrl) this._rightCtrl = null;
    });
  }

  // ── Left controller ────────────────────────────────────────
  _initLeft(ctrl, mc, xr) {
    this._leftCtrl = ctrl;

    // Attach wrist menu above left grip
    const grip = ctrl.grip ?? ctrl.pointer;
    this._wristMenu.attachTo(grip);

    // LEFT thumbstick → locomotion (move in horizontal plane)
    const stick = mc.getComponent('xr-standard-thumbstick');
    if (stick) {
      const obs = this.scene.onBeforeRenderObservable.add(() => {
        if (!this._leftCtrl) return;
        const cam = xr.baseExperience?.camera;
        if (!cam) return;
        const { x, y } = stick.axes;
        if (Math.abs(x) < DEAD_ZONE && Math.abs(y) < DEAD_ZONE) return;
        const fwd   = cam.getDirection(BABYLON.Axis.Z);
        const right = cam.getDirection(BABYLON.Axis.X);
        fwd.y = 0; fwd.normalize();
        right.y = 0; right.normalize();
        cam.position.addInPlace(fwd.scale(-y * MOVE_SPEED));
        cam.position.addInPlace(right.scale(x * MOVE_SPEED));
      });
      this._frameObs.push(obs);
    }

    // LEFT squeeze → grab scatter plot
    this._bindGrip(ctrl, mc);

    // Wrist menu: check palm orientation every frame
    const wristObs = this.scene.onBeforeRenderObservable.add(() => {
      if (!this._leftCtrl) return;
      const cam = xr.baseExperience?.camera;
      if (!cam) return;

      const gripNode  = ctrl.grip ?? ctrl.pointer;
      // Local +Y of grip = palm normal for most OpenXR controllers
      const palmWorld = BABYLON.Vector3.TransformNormal(
        BABYLON.Axis.Y, gripNode.getWorldMatrix(),
      ).normalize();
      const toHead = cam.globalPosition
        .subtract(gripNode.getAbsolutePosition())
        .normalize();
      const dot = BABYLON.Vector3.Dot(palmWorld, toHead);

      if (!this._menuOpen && dot > WRIST_DOT) {
        this._menuOpen = true;
        this._wristMenu.setVisible(true);
      } else if (this._menuOpen && dot < WRIST_DOT - WRIST_HYST) {
        this._menuOpen = false;
        this._wristMenu.setVisible(false);
      }
    });
    this._frameObs.push(wristObs);
  }

  // ── Right controller ───────────────────────────────────────
  _initRight(ctrl, mc, xr) {
    this._rightCtrl = ctrl;

    // RIGHT squeeze → grab scatter plot
    this._bindGrip(ctrl, mc);

    // RIGHT trigger → ray-pick a sphere
    const trigger = mc.getComponent('xr-standard-trigger');
    if (trigger) {
      trigger.onButtonStateChangedObservable.add(comp => {
        if (comp.value < 0.9) return;
        const ray  = ctrl.getWorldPointerRayToRef(
          new BABYLON.Ray(BABYLON.Vector3.Zero(), BABYLON.Axis.Z),
        );
        const pick = this.scene.pickWithRay(
          ray, m => m.isPickable && m.metadata?.track,
        );
        if (pick?.hit) this.scatterPlot.onVRPick(pick.pickedMesh);
      });
    }
  }

  // ── Grab mechanic (shared for both controllers) ────────────
  _bindGrip(ctrl, mc) {
    const squeeze = mc.getComponent('xr-standard-squeeze');
    if (!squeeze) return;

    squeeze.onButtonStateChangedObservable.add(comp => {
      if (comp.value > 0.5 && !this._grabbing) {
        this._startGrab(ctrl);
      } else if (comp.value < 0.3 && this._grabbing?.ctrl === ctrl) {
        this._endGrab();
      }
    });
  }

  _startGrab(ctrl) {
    const node   = ctrl.grip ?? ctrl.pointer;
    const offset = this.scatterPlot.root.getAbsolutePosition()
      .subtract(node.getAbsolutePosition());
    this._grabbing = { ctrl, offset };

    this._grabObs = this.scene.onBeforeRenderObservable.add(() => {
      if (!this._grabbing) return;
      const n      = this._grabbing.ctrl.grip ?? this._grabbing.ctrl.pointer;
      const newPos = n.getAbsolutePosition().add(this._grabbing.offset);
      this.scatterPlot.setPosition(newPos);
    });
  }

  _endGrab() {
    if (this._grabObs) {
      this.scene.onBeforeRenderObservable.remove(this._grabObs);
      this._grabObs = null;
    }
    this._grabbing = null;
  }

  // ── Cleanup ────────────────────────────────────────────────
  async exit() {
    this._endGrab();
    for (const obs of this._frameObs)
      this.scene.onBeforeRenderObservable.remove(obs);
    this._frameObs = [];

    this._wristMenu?.dispose();
    this._infoPanel?.dispose();
    await this._xr?.baseExperience?.exitXRAsync();
  }
}
