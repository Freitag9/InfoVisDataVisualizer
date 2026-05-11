import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF'; // needed for VR controller models
import { loadDataset, extractGenres } from './data/DataLoader.js';
import { filterState } from './data/FilterState.js';
import { ScatterPlot } from './visualization/ScatterPlot.js';
import { MenuPanel } from './ui/MenuPanel.js';
import { ARManager } from './xr/ARManager.js';
import { VRManager } from './xr/VRManager.js';

// ── Engine & Scene ──────────────────────────────────────────────────────────
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
const scene  = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.04, 0.04, 0.07, 1);

// Camera (desktop ArcRotate)
const camera = new BABYLON.ArcRotateCamera('cam', -Math.PI / 4, Math.PI / 3.5, 20, new BABYLON.Vector3(5, 5, 5), scene);
camera.attachControl(canvas, true);
camera.lowerRadiusLimit = 3;
camera.upperRadiusLimit = 40;

// Lighting
const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
hemi.intensity = 0.6;
const point = new BABYLON.PointLight('point', new BABYLON.Vector3(5, 10, 5), scene);
point.intensity = 0.5;

// ── Core Objects ────────────────────────────────────────────────────────────
const scatterPlot = new ScatterPlot(scene);
const menuPanel   = new MenuPanel(scatterPlot);

// Let ScatterPlot notify the desktop UI when a track is selected
scene.metadata = {
  onTrackSelected: (track) => menuPanel.showTrackInfo(track),
};

// ── Loading ─────────────────────────────────────────────────────────────────
const loadingScreen = document.getElementById('loading-screen');
const loadingBar    = document.getElementById('loading-bar');
const loadingText   = document.getElementById('loading-text');

(async () => {
  try {
    loadingText.textContent = 'Parsing 114k tracks…';

    const tracks = await loadDataset('/dataset.csv', (count) => {
      const pct = Math.min(95, (count / 114000) * 100);
      loadingBar.style.width = `${pct}%`;
      loadingText.textContent = `Loaded ${count.toLocaleString()} tracks…`;
    });

    loadingBar.style.width = '100%';
    loadingText.textContent = `${tracks.length.toLocaleString()} tracks ready — building scene…`;

    const genres = extractGenres(tracks);
    filterState.availableGenres = genres;
    menuPanel.populateGenres(genres);

    scatterPlot.setTracks(tracks);

    // Short fade-out
    await new Promise(r => setTimeout(r, 400));
    loadingScreen.style.transition = 'opacity 0.5s';
    loadingScreen.style.opacity    = '0';
    await new Promise(r => setTimeout(r, 500));
    loadingScreen.style.display = 'none';

    menuPanel.showForDesktop();
  } catch (e) {
    loadingText.textContent = `Error: ${e.message}`;
    console.error(e);
  }
})();

// ── XR Buttons ──────────────────────────────────────────────────────────────
const btnAR = document.getElementById('btn-ar');
const btnVR = document.getElementById('btn-vr');
let arManager = null;
let vrManager = null;

(async () => {
  if (await ARManager.isSupported()) btnAR.disabled = false;
  if (await VRManager.isSupported()) btnVR.disabled = false;
})();

btnAR.addEventListener('click', async () => {
  if (!arManager) {
    arManager = new ARManager(scene, scatterPlot);
    await arManager.enter();
    menuPanel.hideForXR();
    btnAR.textContent = 'Exit AR';
  } else {
    await arManager.exit();
    arManager = null;
    menuPanel.showForDesktop();
    btnAR.textContent = 'Enter AR';
  }
});

btnVR.addEventListener('click', async () => {
  if (!vrManager) {
    vrManager = new VRManager(scene, scatterPlot);
    await vrManager.enter();
    menuPanel.hideForXR();
    btnVR.textContent = 'Exit VR';
  } else {
    await vrManager.exit();
    vrManager = null;
    menuPanel.showForDesktop();
    btnVR.textContent = 'Enter VR';
  }
});

// ── Render Loop ─────────────────────────────────────────────────────────────
engine.runRenderLoop(() => scene.render());
window.addEventListener('resize', () => engine.resize());
