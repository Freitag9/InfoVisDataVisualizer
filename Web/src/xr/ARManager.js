import * as BABYLON from '@babylonjs/core';

const TRIPLE_TAP_MS = 500; // max ms between taps to count as triple-tap

export class ARManager {
  constructor(scene, scatterPlot) {
    this.scene       = scene;
    this.scatterPlot = scatterPlot;
    this._xrHelper   = null;
    this._reticle    = null;
    this._placed     = false;
    this._hitTest    = null;

    this._tapTimes   = [];   // timestamps of recent taps
    this._lastHitPos = null; // most recent hit-test position
  }

  static async isSupported() {
    return navigator.xr?.isSessionSupported?.('immersive-ar') ?? false;
  }

  async enter() {
    const xr = await this.scene.createDefaultXRExperienceAsync({
      uiOptions:        { sessionMode: 'immersive-ar' },
      optionalFeatures: ['plane-detection', 'hit-test'],
    });
    this._xrHelper = xr;
    this._reticle  = this._makeReticle();

    xr.baseExperience.onStateChangedObservable.add(state => {
      if (state === BABYLON.WebXRState.IN_XR) this._setupHitTest(xr);
    });
  }

  _setupHitTest(xr) {
    const featMgr = xr.baseExperience.featuresManager;
    const hitTest = featMgr.enableFeature(
      BABYLON.WebXRHitTest.Name, 'latest',
      { testOnPointerDownOnly: false },
    );
    if (!hitTest) return;

    // Track latest hit-test position for reticle + placement
    hitTest.onHitTestResultObservable.add(results => {
      if (results.length === 0) {
        this._reticle.isVisible = false;
        this._lastHitPos = null;
        return;
      }
      const pos = new BABYLON.Vector3();
      const rot = new BABYLON.Quaternion();
      results[0].transformationMatrix.decompose(undefined, rot, pos);
      this._lastHitPos = { pos, rot };

      // Always show reticle while not placed (or after reset)
      if (!this._placed) {
        this._reticle.isVisible = true;
        this._reticle.position.copyFrom(pos);
        this._reticle.rotationQuaternion = rot.clone();
      }
    });

    this.scene.onPointerObservable.add(evt => {
      if (evt.type !== BABYLON.PointerEventTypes.POINTERDOWN) return;

      const now = Date.now();
      // Keep only taps within the time window
      this._tapTimes = this._tapTimes.filter(t => now - t < TRIPLE_TAP_MS);
      this._tapTimes.push(now);

      if (this._tapTimes.length >= 3) {
        // Triple-tap → reset placement, re-show reticle
        this._tapTimes = [];
        this._reset();
        this._showToast('Tap once to place');
        return;
      }

      // Single tap → place if reticle visible and not yet placed
      if (!this._placed && this._reticle.isVisible && this._lastHitPos) {
        this._place(this._lastHitPos.pos, this._lastHitPos.rot);
      }
    });
  }

  _place(pos, rot) {
    this.scatterPlot.setPosition(pos.clone());
    this.scatterPlot.setScaling(0.05);
    this._placed = true;
    this._reticle.isVisible = false;
  }

  _reset() {
    this._placed = false;
    this.scatterPlot.setScaling(0);   // hide plot until re-placed
    if (this._lastHitPos) {
      this._reticle.isVisible = true;
    }
  }

  _makeReticle() {
    const reticle = BABYLON.MeshBuilder.CreateTorus('reticle', {
      diameter: 0.3, thickness: 0.02, tessellation: 36,
    }, this.scene);
    reticle.rotationQuaternion = new BABYLON.Quaternion();
    reticle.isVisible = false;

    const mat = new BABYLON.StandardMaterial('reticleMat', this.scene);
    mat.diffuseColor    = new BABYLON.Color3(1, 1, 1);
    mat.emissiveColor   = new BABYLON.Color3(0.5, 1, 0.5);
    mat.disableLighting = true;
    reticle.material    = mat;
    return reticle;
  }

  // Brief on-screen toast so the user gets feedback
  _showToast(msg) {
    let el = document.getElementById('ar-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ar-toast';
      Object.assign(el.style, {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        background: 'rgba(0,0,0,0.75)',
        color: '#fff', padding: '0.6rem 1.2rem',
        borderRadius: '8px', fontSize: '1rem',
        pointerEvents: 'none', zIndex: '999',
        transition: 'opacity 0.4s',
      });
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._hide);
    el._hide = setTimeout(() => { el.style.opacity = '0'; }, 1800);
  }

  async exit() {
    await this._xrHelper?.baseExperience?.exitXRAsync();
    this._reticle?.dispose();
    this._placed = false;
    this.scatterPlot.setScaling(1);
    this.scatterPlot.setPosition(BABYLON.Vector3.Zero());
  }
}
