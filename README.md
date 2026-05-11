# InfoVisDataVisualizer

3D Information Visualization of the Spotify Tracks Dataset (~114k tracks).  
Supports **Web 3D**, **AR** (phone camera, table projection via plane detection), and **VR** (any OpenXR headset with controllers).

## Dataset
[Spotify Tracks Dataset – Kaggle](https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset)  
CSV placed at `Web/public/dataset.csv` and `Unity/Assets/StreamingAssets/dataset.csv`.

## Platforms

| Feature | Web (Babylon.js) | Unity |
|---|---|---|
| Desktop 3D | ✅ | ✅ |
| AR (phone, table) | ✅ WebXR immersive-ar | ✅ AR Foundation |
| VR (any headset) | ✅ WebXR immersive-vr | ✅ OpenXR |
| VR Wrist Menu | ✅ Controller palm-up | ✅ Controller palm-up |

## Visualization Features
- **3 axes** (default: Danceability / Energy / Valence) — changeable via menu
- **Sphere size** = Popularity
- **Sphere color** = Genre (color-coded legend)
- **Selection**: clicking/triggering a sphere projects vertical + floor crosshair lines so the user can read off X/Z values and a horizontal marker for Y
- **Filters**: Genre, Popularity range, Energy range, Danceability range, Valence range, Tempo range, Track count, Explicit toggle

## Controls

### Desktop (Web)
- Orbit: Left mouse drag
- Pan: Right mouse drag / Middle mouse
- Zoom: Scroll wheel
- Select sphere: Left click

### VR
- Locomotion: Right thumbstick
- Select sphere: Right trigger
- **Wrist Menu**: Turn left controller palm toward your face → menu appears; interact with right controller ray

### AR
- Tap detected plane to place visualization
- Pinch to scale / rotate

## Structure
```
InfoVisDataVisualizer/
├── Web/          # Babylon.js + WebXR
└── Unity/        # Unity 6 + XR Interaction Toolkit 3 + AR Foundation
```

## Quick Start

### Web
```bash
cd Web
npm install
npm run dev
# Open http://localhost:5173
```

### Unity
1. Open Unity Hub → Add project → select the `Unity/` folder
2. Unity 6.x (6000.x LTS) recommended
3. Open `Assets/Scenes/MainScene.unity`
4. See `Unity/SCENE_SETUP.md` for full scene wiring guide

## Status
See [TASKS.md](TASKS.md) for current progress and open TODOs.
