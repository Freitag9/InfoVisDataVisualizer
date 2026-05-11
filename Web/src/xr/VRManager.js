import * as BABYLON from '@babylonjs/core';
import { VRMenuPanel } from '../ui/VRMenuPanel.js';

const WRIST_THRESHOLD = 0.7; // dot product: palm facing camera

/**
 * Manages WebXR immersive-vr session.
 * - Controller locomotion (right thumbstick)
 * - Right ray interactor → sphere selection
 * - Left controller wrist menu (palm-toward-head opens menu)
 */
export class VRManager {
  constructor(scene, scatterPlot) {
    this.scene       = scene;
    this.scatterPlot = scatterPlot;
    this._xrHelper   = null;
    this._wristMenu  = null;
    this._leftCtrl   = null;
    this._rightCtrl  = null;
  }

  static async isSupported() {
    return navigator.xr?.isSessionSupported?.('immersive-vr') ?? false;
  }

  async enter() {
    const xr = await this.scene.createDefaultXRExperienceAsync({
      uiOptions:         { sessionMode: 'immersive-vr' },
      optionalFeatures:  ['local-floor'],
    });
    this._xrHelper = xr;
    this._wristMenu = new VRMenuPanel(this.scene);

    xr.input.onControllerAddedObservable.add(ctrl => {
      ctrl.onMotionControllerInitObservable.add(mc => {
        if (mc.handedness === 'left')  this._initLeftController(ctrl, mc);
        if (mc.handedness === 'right') this._initRightController(ctrl, mc, xr);
      });
    });

    xr.input.onControllerRemovedObservable.add(ctrl => {
      if (ctrl === this._leftCtrl)  this._leftCtrl  = null;
      if (ctrl === this._rightCtrl) this._rightCtrl = null;
    });
  }

  _initLeftController(ctrl, mc) {
    this._leftCtrl = ctrl;
    this._wristMenu.attachTo(ctrl.grip ?? ctrl.pointer);

    // Check palm orientation every frame
    this.scene.onBeforeRenderObservable.add(() => {
      if (!this._leftCtrl || !this._xrHelper?.baseExperience?.camera) return;
      const cam   = this._xrHelper.baseExperience.camera;
      const grip  = ctrl.grip ?? ctrl.pointer;

      // Palm normal: local +Y of the grip node
      const palmWorld = BABYLON.Vector3.TransformNormal(
        BABYLON.Axis.Y,
        grip.getWorldMatrix(),
      ).normalize();

      const toHead = cam.globalPosition.subtract(grip.getAbsolutePosition()).normalize();
      const dot    = BABYLON.Vector3.Dot(palmWorld, toHead);

      this._wristMenu.setVisible(dot > WRIST_THRESHOLD);
    });
  }

  _initRightController(ctrl, mc, xr) {
    this._rightCtrl = ctrl;

    // Thumbstick locomotion
    const thumbstick = mc.getComponent('xr-standard-thumbstick');
    if (thumbstick) {
      this.scene.onBeforeRenderObservable.add(() => {
        if (!thumbstick.changes.axes) return;
        const cam   = xr.baseExperience.camera;
        const speed = 0.06;
        const fwd   = cam.getDirection(BABYLON.Axis.Z);
        const right = cam.getDirection(BABYLON.Axis.X);
        fwd.y = 0; fwd.normalize();
        right.y = 0; right.normalize();
        cam.position.addInPlace(fwd.scale(thumbstick.axes.y * speed));
        cam.position.addInPlace(right.scale(thumbstick.axes.x * speed));
      });
    }

    // Trigger → sphere selection via ray
    const trigger = mc.getComponent('xr-standard-trigger');
    if (trigger) {
      trigger.onButtonStateChangedObservable.add(comp => {
        if (comp.value < 0.9) return;
        const ray  = ctrl.getWorldPointerRayToRef(new BABYLON.Ray(BABYLON.Vector3.Zero(), BABYLON.Axis.Z));
        const pick = this.scene.pickWithRay(ray, m => m.isPickable && m.metadata?.track);
        if (pick?.hit) this.scatterPlot.onVRPick(pick.pickedMesh);
      });
    }
  }

  async exit() {
    await this._xrHelper?.baseExperience?.exitXRAsync();
    this._wristMenu?.dispose();
  }
}
