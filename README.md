# InfoVisDataVisualizer

3D Information Visualization of the Spotify Tracks Dataset (~114k tracks).
Built with **Babylon.js + WebXR** — runs as **Web 3D**, **AR** (phone camera, table projection via plane detection), and **VR** (any WebXR headset with controllers).

## Dataset
[Spotify Tracks Dataset – Kaggle](https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset)
Cleaned CSV at `Web/public/dataset.csv` (see `tools/clean_dataset.py`).

## Platforms

| Feature | Status |
|---|---|
| Desktop 3D | ✅ |
| AR (phone, table) | ✅ WebXR immersive-ar + plane detection |
| VR (Rift / any WebXR headset) | ✅ WebXR immersive-vr |
| VR Wrist Menu | ✅ Y-button toggle, right-hand ray interaction |

## Visualization Features
- **3 axes** (default: Danceability / Energy / Valence) — changeable via menu
- **Sphere size** = Popularity
- **Sphere color** = Genre (color-coded)
- **Selection**: a sphere projects a vertical drop line + floor crosshair so you can read off X/Z values, plus a Y marker
- **Search** track names + **Recently Viewed** list (localStorage)
- **Axis-coupled range filters** (X/Y/Z always match the active axes) + Genre, Popularity, Mode (major/minor), Vocals (instrumental/vocal), Explicit, Track count

## Controls

### Desktop
- Orbit: left-mouse drag · Pan: right-mouse drag · Zoom: scroll · Select: left click

### VR (Oculus Rift / WebXR)
- Locomotion: **left** thumbstick
- Grab & move the plot: **squeeze** (either controller)
- Select sphere: **right trigger** (ray)
- Wrist Menu: **Y-button** (left) toggles it; interact with the **right** controller ray

### AR
- Point at a surface → reticle appears → **single tap** to place
- **Triple-tap** to reset and re-place at a new position

## Structure
```
InfoVisDataVisualizer/
├── Web/      # Babylon.js + WebXR app
├── tools/    # dataset cleaning + docx generator
└── docs/     # EEG user-test protocol
```

## Quick Start
```bash
cd Web
npm install
npm run dev
# Desktop:  http://localhost:5173
# Phone/VR: expose via HTTPS tunnel (ngrok http 5173) — WebXR requires HTTPS
```

## Status
See [TASKS.md](TASKS.md) for progress and open TODOs.
