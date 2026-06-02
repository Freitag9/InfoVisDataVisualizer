# Architecture

## Data Flow

```
dataset.csv (cleaned, ~114k rows)
  │
  ▼
DataLoader ──────────────► filterState (singleton)
  │                             │  axisX/Y/Z + coupled rangeX/Y/Z (normalized),
  │                             │  genre, popularity, mode, vocal, explicit,
  │                             │  trackCount
  │                             │
  ▼                             ▼
SpotifyTrack[]  ────────► ScatterPlot
                                │  (shuffled once → stable sampling)
                                ├── sphere × N      (size=popularity, color=genre)
                                ├── AxisRenderer     (3 axes + tick labels)
                                └── ProjectionRay    (shown on sphere select)

filterState emits a `type` hint: 'axis' (reposition only) | 'count' (resample) | 'filter' (rebuild).
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

Plot space: `[0, plotSize]` where `plotSize = 10` Babylon units.

## Filters
| Filter | Control | Type |
|---|---|---|
| X / Y / Z range | Dual slider per axis | normalized [0,1], **follows the active axis field** (resets on axis change) |
| Genre | Dropdown | exact match |
| Popularity | Dual slider | range [0,100] |
| Mode | Segmented | all / major / minor |
| Vocals | Segmented | all / instrumental / vocal (instrumentalness ≷ 0.5) |
| Explicit | Toggle | boolean |
| Track count | Slider | 50–2000 (stable sample, reshuffled only on change) |

The three axis range filters are the fix for the old axis↔filter mismatch: whatever field is mapped to an axis is exactly what its range filter controls.

## Selection & Projection Ray
When a sphere is selected:
1. Vertical line from sphere position down to XZ plane (Y=0)
2. Two floor lines: sphere_pos.xz → X-axis edge and → Z-axis edge
3. Number labels on the axis edges showing the exact value
4. Info panel: track_name, artists, genre, popularity stars, all numeric values

## VR Interaction
- **Left thumbstick** → locomotion in the horizontal plane.
- **Squeeze** (either controller) → grab & move the whole plot (offset locked on grab).
- **Right trigger** → ray-pick a sphere (ray built from the controller pointer transform, +Z).
- **Left Y-button** → toggles the wrist menu. A small `Y ☰ Menu` indicator floats over the left controller when the menu is closed. The menu plane is world-positioned above the grip, billboards to the camera, and is pickable so the right-hand ray can click its buttons/sliders.

## AR Placement
1. WebXR hit-test detects horizontal planes.
2. Reticle shown on plane surface (raycast from screen center).
3. **Single tap** → scatter plot spawns at the reticle (scaled to ~5 cm/unit).
4. **Triple tap** → reset placement and re-place at a new position.

## Web Stack
- **Babylon.js 7.x** — 3D engine, WebXR, scene management
- **PapaParse** — streaming CSV parse (avoids blocking main thread)
- **Vite** — dev server + bundler
- No build-time framework (vanilla JS modules)

