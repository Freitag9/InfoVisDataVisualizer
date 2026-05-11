# Unity Scene Setup Guide

> Unity 6 (6000.x LTS) · URP · XR Interaction Toolkit 3.x · AR Foundation 6.x

## 1 — Create Project

1. Unity Hub → New Project → **3D (URP)** template, name `InfoVisDataVisualizer`
2. Open the project from the `Unity/` folder (or point Hub at it)
3. Wait for package imports (manifest.json will auto-download all packages)

## 2 — Import Dataset

Copy `dataset.csv` into:
```
Assets/StreamingAssets/dataset.csv
```

## 3 — XR Plugin Management

`Edit → Project Settings → XR Plug-in Management`

| Build Target | Plugin |
|---|---|
| PC / Standalone | OpenXR |
| Android (VR) | OpenXR |
| Android (AR) | ARCore XR Plugin |
| iOS (AR) | ARKit XR Plugin |

Under OpenXR → **Interaction Profiles**, add:
- Meta Quest Touch Controller Profile
- HTC Vive Controller Profile
- (any other target headset profile)

## 4 — Scene Hierarchy

```
MainScene
├── [Managers]
│   ├── FilterState          ← FilterState.cs
│   ├── SpotifyDataLoader    ← SpotifyDataLoader.cs
│   └── XRPlatformManager   ← XRPlatformManager.cs
│
├── [Visualization]
│   ├── ScatterPlotRoot      ← DataVisualizer.cs, ProjectionRay.cs
│   │   └── AxisRoot         ← AxisRenderer.cs
│   └── TrackPointPrefab     (prefab – see step 6)
│
├── [Desktop Camera Rig]
│   └── Main Camera          ← standard Unity camera + mouse orbit script
│
├── [VR Camera Rig]          ← XROrigin (from XRI sample)
│   ├── Camera Offset
│   │   └── Main Camera (XR)
│   ├── LeftHand Controller  ← VRWristMenuActivator.cs
│   │   └── WristMenuCanvas  ← WorldSpace Canvas + FilterPanelUI.cs
│   └── RightHand Controller ← VRPointSelector.cs (XRRayInteractor)
│
├── [AR Camera Rig]          ← XROrigin (AR Foundation)
│   ├── ARSessionOrigin
│   │   ├── ARPlaneManager
│   │   ├── ARRaycastManager ← ARPlacementHandler.cs
│   │   └── AR Camera
│   └── ARSession
│
└── [UI - Desktop]
    └── Canvas (Screen Space)
        ├── FilterPanel      ← FilterPanelUI.cs
        └── TrackInfoPanel   ← TrackInfoPanel.cs
```

## 5 — Wire Up References

### FilterState GameObject
- No extra references needed (singleton)

### SpotifyDataLoader GameObject
- `OnDataLoaded` → drag DataVisualizer → `OnTracksLoaded`
- `OnDataLoaded` → drag FilterPanelUI → `PopulateGenreDropdown`

### DataVisualizer
- `dataLoader` → SpotifyDataLoader
- `axisRenderer` → AxisRoot/AxisRenderer
- `projectionRay` → ScatterPlotRoot/ProjectionRay
- `trackPointPrefab` → TrackPointPrefab (see step 6)
- `OnTrackSelected` → TrackInfoPanel → `Show`

### XRPlatformManager
- `desktopCameraRig` → Desktop Camera Rig
- `vrCameraRig`      → VR Camera Rig
- `arCameraRig`      → AR Camera Rig
- `desktopCanvas`    → Desktop UI Canvas
- `vrWristMenu`      → WristMenuCanvas

### VRWristMenuActivator (on LeftHand Controller)
- `hmdTransform`   → VR Camera Rig / Main Camera (XR)
- `wristMenuRoot`  → WristMenuCanvas

## 6 — TrackPoint Prefab

1. Create → 3D Object → Sphere
2. Remove default Collider, add **Sphere Collider** (Is Trigger: off)
3. Add **XRSimpleInteractable** component (for VR ray hover/select)
4. Add **TrackPoint.cs** component
5. Set Sphere's material to URP/Lit with **Emission** keyword enabled
6. Save as Prefab in `Assets/Prefabs/TrackPointPrefab.prefab`
7. Assign to DataVisualizer → trackPointPrefab

## 7 — AxisRenderer Labels

1. Create → 3D Object → Empty, name it `AxisRoot`
2. Add **AxisRenderer.cs**
3. Create a **TextMeshPro 3D Text** GameObject, strip everything, save as prefab
4. Assign to `labelPrefab` in AxisRenderer
5. Create 3 URP/Unlit materials (red, green, blue) → assign to xAxisMat, yAxisMat, zAxisMat

## 8 — VR Wrist Menu Canvas

1. Create → UI → Canvas → set Render Mode: **World Space**
2. Scale to ~0.001 (1mm per pixel at 512px = 50cm panel)
3. Add **FilterPanelUI.cs**
4. Wire all slider/dropdown fields via Inspector
5. Set as child of LeftHand Controller (position: ~0, 0.1, 0 above grip)
6. Initially disabled (VRWristMenuActivator activates it)

## 9 — AR Reticle Prefab

1. Create → 3D Object → Cylinder, scale (0.3, 0.005, 0.3)
2. URP/Unlit material, white with 50% alpha
3. Save as prefab → assign to ARPlacementHandler → reticlePrefab

## 10 — Build Settings

### VR (PC / Quest via Link)
- Platform: Windows / Android
- XR: OpenXR enabled

### AR (Android)
- Platform: Android
- Minimum API: 26 (ARCore requirement)
- XR: ARCore XR Plugin enabled
- Player Settings → Graphics: Vulkan first

### AR (iOS)
- Platform: iOS
- XR: ARKit XR Plugin enabled
- Player Settings → Camera Usage Description: "AR visualization"
