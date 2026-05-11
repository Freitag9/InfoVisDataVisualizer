# Architecture

## Data Flow (both platforms)

```
dataset.csv (114k rows)
  │
  ▼
DataLoader ──────────────► FilterState (singleton)
  │                             │  genre, popularity, energy,
  │                             │  danceability, valence, tempo,
  │                             │  axisX/Y/Z, trackCount
  │                             │
  ▼                             ▼
SpotifyTrack[]  ────────► DataVisualizer / ScatterPlot
                                │
                                ├── TrackSphere × N  (size=popularity, color=genre)
                                ├── AxisRenderer     (3 axes + tick labels)
                                └── ProjectionRay    (shown on sphere select)
```

## Dataset Fields Used

| Field | Type | Range | Use |
|---|---|---|---|
| `track_name` | string | — | Label |
| `artists` | string | — | Label |
| `album_name` | string | — | Label |
| `track_genre` | string | ~100 genres | Color coding |
| `popularity` | 0–100 | int | Sphere size |
| `danceability` | 0–1 | float | Axis / Filter |
| `energy` | 0–1 | float | Axis / Filter |
| `valence` | 0–1 | float | Axis / Filter |
| `tempo` | ~40–220 BPM | float | Axis / Filter |
| `loudness` | -60–0 dB | float | Axis (normalized) |
| `acousticness` | 0–1 | float | Axis / Filter |
| `instrumentalness` | 0–1 | float | Axis |
| `speechiness` | 0–1 | float | Axis |
| `liveness` | 0–1 | float | Axis |
| `duration_ms` | ms | float | Axis (→ min) |
| `explicit` | bool | — | Filter toggle |

## Axis Normalization
All axis values are normalized to [0, 1] before mapping to plot space.
- `loudness`: `(value + 60) / 60`
- `tempo`: `value / 250`
- `duration`: `value / 600_000`
- All others: already [0,1]

Plot space: `[0, plotSize]` where `plotSize = 10` Unity units / Babylon units.

## Filters
| Filter | Control | Type |
|---|---|---|
| Genre | Dropdown | exact match |
| Popularity | Min/Max slider | range [0,100] |
| Energy | Min/Max slider | range [0,1] |
| Danceability | Min/Max slider | range [0,1] |
| Valence | Min/Max slider | range [0,1] |
| Tempo | Min/Max slider | range [40,220] |
| Explicit | Toggle | boolean |
| Track count | Slider | 50–2000 (random sample) |

## Selection & Projection Ray
When a sphere is selected:
1. Vertical line from sphere position down to XZ plane (Y=0)
2. Two floor lines: sphere_pos.xz → X-axis edge and → Z-axis edge
3. Number labels on the axis edges showing the exact value
4. Info panel: track_name, artists, genre, popularity stars, all numeric values

## VR Wrist Menu Logic
```
Every frame (VR mode):
  palmForward = leftController.transform.up  (palm normal in controller space)
  headDir     = normalize(camera.position - leftController.position)
  dot         = dot(palmForward, headDir)

  if dot > 0.7  → show wrist menu (world-anchored to left controller)
  else          → hide wrist menu
```
Right controller ray interactor pokes at the wrist menu buttons.

## AR Placement
1. WebXR / AR Foundation detects horizontal planes
2. Reticle shown on plane surface (raycasted from screen center)
3. User taps → scatter plot spawns anchored to that plane
4. Pinch (AR) / thumbstick (VR) to scale / rotate visualization

## Web Stack
- **Babylon.js 7.x** — 3D engine, WebXR, scene management
- **PapaParse** — streaming CSV parse (avoids blocking main thread)
- **Vite** — dev server + bundler
- No build-time framework (vanilla JS modules)

## Unity Stack
- **Unity 6** (6000.x LTS)
- **Universal Render Pipeline (URP)** 17.x
- **XR Interaction Toolkit** 3.x (ray interactors, locomotion)
- **XR Hands** 1.x (optional, for future hand tracking)
- **AR Foundation** 6.x (plane detection, anchors)
- **OpenXR** 1.x (VR headset support)
- **TextMeshPro** (axis labels, UI)
