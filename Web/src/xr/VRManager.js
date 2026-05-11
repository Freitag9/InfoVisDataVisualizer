import * as BABYLON from '@babylonjs/core';
import { VRMenuPanel } from '../ui/VRMenuPanel.js';
import { VRTrackInfoPanel } from '../ui/VRTrackInfoPanel.js';

const MOVE_SPEED = 0.05;
const DEAD_ZONE  = 0.15;

export class VRManager {
  constructor(scene, scatterPlot) {
    this.scene       = scene;
    this.scatterPlot = scatterPlot;
    this._xr         = null;
    this._wristMenu  = null;
    this._infoPanel  = null;
    this._menuOpen   = false;
    this._grabbing   = null;
    this._grabObs    = null;
    this._observers  = [];
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

    // Show 3D info panel inside headset on track select
    const meta = this.scene.metadata ?? {};
    this.scene.metadata = meta;
    const prevCb = meta.onTrackSelected;
    meta.onTrackSelected = (track) => {
      prevCb?.(track);
      const cam = xr.baseExperience?.camera;
      if (cam) this._infoPanel.show(track, cam);
    };

    xr.input.onControllerAddedObservable.add(ctrl => {
      const hand = ctrl.inputSource.handedness;
      console.log(`[VR] controller added: ${hand}`);

      ctrl.onMotionControllerInitObservable.add(mc => {
        console.log(`[VR] motion controller ready: ${hand} | profile: ${mc.profileId}`);
        console.log(`[VR] components:`, mc.getComponentIds());

        if (hand === 'left')  this._setupLeft(ctrl, mc, xr);
        if (hand === 'right') this._setupRight(ctrl, mc, xr);
      });

      // Fallback: if motion controller never fires (some PC setups)
      // try setup after a short delay using raw inputSource
      setTimeout(() => {
        if (hand === 'left'  && !this._leftReady)  this._setupLeftFallback(ctrl, xr);
        if (hand === 'right' && !this._rightReady) this._setupRightFallback(ctrl, xr);
      }, 2000);
    });
  }

  // ── Left controller ─────────────────────────────────────────────────────
  _setupLeft(ctrl, mc, xr) {
    this._leftReady = true;
    const grip = ctrl.grip ?? ctrl.pointer;

    // Update wrist menu position every frame in world space (avoid setParent scale issues)
    const menuObs = this.scene.onBeforeRenderObservable.add(() => {
      if (!this._menuOpen) return;
      const gripPos = grip.getAbsolutePosition();
      const cam     = xr.baseExperience?.camera;
      const menuPos = new BABYLON.Vector3(gripPos.x, gripPos.y + 0.22, gripPos.z);
      this._wristMenu.setWorldPosition(menuPos);
      if (cam) this._wristMenu.lookAtCamera(cam.globalPosition);
    });
    this._observers.push(menuObs);

    // Y-button (Oculus Touch left) or b-button → toggle wrist menu
    for (const id of ['y-button', 'b-button', 'xr-standard-thumbstick-button']) {
      const btn = mc.getComponent(id);
      if (btn) {
        btn.onButtonStateChangedObservable.add(c => {
          if (!c.pressed) return;
          this._menuOpen = !this._menuOpen;
          this._wristMenu.setVisible(this._menuOpen);
          console.log(`[VR] wrist menu: ${this._menuOpen}`);
        });
        console.log(`[VR] wrist menu bound to: ${id}`);
        break;
      }
    }

    // Left thumbstick → locomotion
    const stick = mc.getComponent('xr-standard-thumbstick');
    if (stick) {
      const obs = this.scene.onBeforeRenderObservable.add(() => {
        const cam = xr.baseExperience?.camera;
        if (!cam) return;
        const { x, y } = stick.axes;
        if (Math.abs(x) < DEAD_ZONE && Math.abs(y) < DEAD_ZONE) return;
        const fwd   = cam.getDirection(BABYLON.Axis.Z); fwd.y = 0; fwd.normalize();
        const right = cam.getDirection(BABYLON.Axis.X); right.y = 0; right.normalize();
        cam.position.addInPlace(fwd.scale(-y * MOVE_SPEED));
        cam.position.addInPlace(right.scale(x * MOVE_SPEED));
      });
      this._observers.push(obs);
      console.log('[VR] locomotion bound to left thumbstick');
    }

    // Left squeeze → grab scatter plot
    this._bindGrab(ctrl, mc, 'left');
  }

  // ── Right controller ────────────────────────────────────────────────────
  _setupRight(ctrl, mc, xr) {
    this._rightReady = true;

    // Right trigger → pick sphere
    const trigger = mc.getComponent('xr-standard-trigger');
    if (trigger) {
      let fired = false;
      trigger.onButtonStateChangedObservable.add(c => {
        if (c.value > 0.85 && !fired) {
          fired = true;
          this._pickSphere(ctrl);
        }
        if (c.value < 0.3) fired = false;
      });
      console.log('[VR] sphere pick bound to right trigger');
    }

    // Right squeeze → grab scatter plot
    this._bindGrab(ctrl, mc, 'right');
  }

  // ── Grab mechanic ───────────────────────────────────────────────────────
  _bindGrab(ctrl, mc, hand) {
    const squeeze = mc.getComponent('xr-standard-squeeze');
    if (!squeeze) { console.warn(`[VR] no squeeze component on ${hand}`); return; }

    squeeze.onButtonStateChangedObservable.add(c => {
      if (c.value > 0.5 && !this._grabbing) {
        this._startGrab(ctrl);
        console.log(`[VR] grab start (${hand})`);
      } else if (c.value < 0.25 && this._grabbing?.ctrl === ctrl) {
        this._endGrab();
        console.log(`[VR] grab end (${hand})`);
      }
    });
    console.log(`[VR] grab bound to ${hand} squeeze`);
  }

  _startGrab(ctrl) {
    const node   = ctrl.grip ?? ctrl.pointer;
    const offset = this.scatterPlot.root.getAbsolutePosition()
      .subtract(node.getAbsolutePosition());
    this._grabbing = { ctrl, offset: offset.clone() };

    this._grabObs = this.scene.onBeforeRenderObservable.add(() => {
      if (!this._grabbing) return;
      const n   = this._grabbing.ctrl.grip ?? this._grabbing.ctrl.pointer;
      const pos = n.getAbsolutePosition().add(this._grabbing.offset);
      this.scatterPlot.setPosition(pos);
    });
  }

  _endGrab() {
    if (this._grabObs) {
      this.scene.onBeforeRenderObservable.remove(this._grabObs);
      this._grabObs = null;
    }
    this._grabbing = null;
  }

  // ── Sphere picking ──────────────────────────────────────────────────────
  _pickSphere(ctrl) {
    const pointer = ctrl.pointer;
    if (!pointer) { console.warn('[VR] no pointer node'); return; }

    const origin    = pointer.getAbsolutePosition().clone();
    const direction = BABYLON.Vector3.TransformNormal(
      new BABYLON.Vector3(0, 0, 1), // WebXR aim space: +Z is forward
      pointer.getWorldMatrix(),
    ).normalize();
    const ray  = new BABYLON.Ray(origin, direction, 100);
    const pick = this.scene.pickWithRay(ray, m => m.isPickable && !!m.metadata?.track);
    if (pick?.hit) {
      console.log('[VR] picked:', pick.pickedMesh?.metadata?.track?.track_name);
      this.scatterPlot.onVRPick(pick.pickedMesh);
    } else {
      console.log('[VR] no hit');
    }
  }

  // ── Fallbacks (PC WebXR without full motion controller profile) ─────────
  _setupLeftFallback(ctrl, xr) {
    console.warn('[VR] left controller fallback: using gamepad polling');
    const gp = ctrl.inputSource.gamepad;
    if (!gp) return;
    const grip = ctrl.grip ?? ctrl.pointer;
    this._wristMenu.attachTo(grip);

    const obs = this.scene.onBeforeRenderObservable.add(() => {
      const cam = xr.baseExperience?.camera;
      if (!cam || !gp) return;

      // Thumbstick axes: index 2/3 on Oculus Touch left
      const x = gp.axes[2] ?? 0;
      const y = gp.axes[3] ?? 0;
      if (Math.abs(x) > DEAD_ZONE || Math.abs(y) > DEAD_ZONE) {
        const fwd   = cam.getDirection(BABYLON.Axis.Z); fwd.y = 0; fwd.normalize();
        const right = cam.getDirection(BABYLON.Axis.X); right.y = 0; right.normalize();
        cam.position.addInPlace(fwd.scale(-y * MOVE_SPEED));
        cam.position.addInPlace(right.scale(x * MOVE_SPEED));
      }

      // Y-button = buttons[3] on Oculus Touch left
      const yBtn = gp.buttons[3];
      if (yBtn?.pressed && !this._yWasPressed) {
        this._menuOpen = !this._menuOpen;
        this._wristMenu.setVisible(this._menuOpen);
      }
      this._yWasPressed = yBtn?.pressed ?? false;
    });
    this._observers.push(obs);
  }

  _setupRightFallback(ctrl, xr) {
    console.warn('[VR] right controller fallback: using gamepad polling');
    const gp = ctrl.inputSource.gamepad;
    if (!gp) return;

    const obs = this.scene.onBeforeRenderObservable.add(() => {
      if (!gp) return;
      // Trigger = buttons[0], Squeeze = buttons[1] on Oculus Touch
      const trigger = gp.buttons[0];
      if (trigger?.pressed && !this._triggerWasPressed) {
        this._pickSphere(ctrl);
      }
      this._triggerWasPressed = trigger?.pressed ?? false;

      const squeeze = gp.buttons[1];
      if ((squeeze?.value ?? 0) > 0.5 && !this._grabbing) {
        this._startGrab(ctrl);
      } else if ((squeeze?.value ?? 0) < 0.25 && this._grabbing?.ctrl === ctrl) {
        this._endGrab();
      }
    });
    this._observers.push(obs);
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────
  async exit() {
    this._endGrab();
    for (const obs of this._observers)
      this.scene.onBeforeRenderObservable.remove(obs);
    this._observers = [];
    this._wristMenu?.dispose();
    this._infoPanel?.dispose();
    await this._xr?.baseExperience?.exitXRAsync();
  }
}
