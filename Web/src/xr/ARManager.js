import * as BABYLON from '@babylonjs/core';

/**
 * Manages WebXR immersive-ar session.
 * - Plane detection
 * - Reticle on detected surface
 * - Tap to place scatter plot
 */
export class ARManager {
  constructor(scene, scatterPlot) {
    this.scene       = scene;
    this.scatterPlot = scatterPlot;
    this._xrHelper   = null;
    this._reticle    = null;
    this._placed     = false;
    this._hitTest    = null;
  }

  static async isSupported() {
    return navigator.xr?.isSessionSupported?.('immersive-ar') ?? false;
  }

  async enter() {
    const xr = await this.scene.createDefaultXRExperienceAsync({
      uiOptions:  { sessionMode: 'immersive-ar' },
      optionalFeatures: ['plane-detection', 'hit-test'],
    });
    this._xrHelper = xr;

    this._reticle = this._makeReticle();

    xr.baseExperience.onStateChangedObservable.add(state => {
      if (state === BABYLON.WebXRState.IN_XR) {
        this._setupHitTest(xr);
      }
    });
  }

  _setupHitTest(xr) {
    const featMgr = xr.baseExperience.featuresManager;
    const hitTest = featMgr.enableFeature(
      BABYLON.WebXRHitTest.Name,
      'latest',
      { testOnPointerDownOnly: false },
    );
    if (!hitTest) return;

    hitTest.onHitTestResultObservable.add(results => {
      if (results.length === 0) {
        this._reticle.isVisible = false;
        return;
      }
      this._reticle.isVisible = true;
      results[0].transformationMatrix.decompose(
        this._reticle.scaling,
        this._reticle.rotationQuaternion,
        this._reticle.position,
      );
    });

    // Tap to place
    this.scene.onPointerObservable.add(evt => {
      if (evt.type !== BABYLON.PointerEventTypes.POINTERDOWN) return;
      if (!this._reticle.isVisible) return;
      if (!this._placed) {
        this.scatterPlot.setPosition(this._reticle.position.clone());
        this.scatterPlot.setScaling(0.05); // 5cm per unit
        this._placed = true;
        this._reticle.isVisible = false;
      }
    });
  }

  _makeReticle() {
    const reticle = BABYLON.MeshBuilder.CreateTorus('reticle', {
      diameter: 0.3, thickness: 0.02, tessellation: 36,
    }, this.scene);
    reticle.rotationQuaternion = new BABYLON.Quaternion();
    reticle.isVisible = false;

    const mat = new BABYLON.StandardMaterial('reticleMat', this.scene);
    mat.diffuseColor  = new BABYLON.Color3(1, 1, 1);
    mat.emissiveColor = new BABYLON.Color3(0.5, 1, 0.5);
    mat.disableLighting = true;
    reticle.material = mat;
    return reticle;
  }

  async exit() {
    await this._xrHelper?.baseExperience?.exitXRAsync();
    this._reticle?.dispose();
    this._placed = false;
    this.scatterPlot.setScaling(1);
    this.scatterPlot.setPosition(BABYLON.Vector3.Zero());
  }
}
