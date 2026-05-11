# Tasks & Progress

## Legend
- ✅ Done  
- 🔧 In Progress  
- ⬜ Pending  
- ❌ Blocked

---

## Phase 1 — Project Scaffold
- ✅ Folder structure created (Web/, Unity/)
- ✅ README, ARCHITECTURE, TASKS docs
- ⬜ GitHub repo `InfoVisDataVisualizer` created (needs `gh` CLI install)
- ✅ Dataset CSV placed in Web/public/ and Unity/Assets/StreamingAssets/

## Phase 2 — Web: Data Layer
- ✅ `src/data/DataLoader.js` — CSV parse + stream (PapaParse)
- ✅ `src/data/FilterState.js` — reactive filter singleton
- ✅ `src/utils/ColorMapper.js` — genre → color mapping
- ✅ `src/utils/DataUtils.js` — normalization helpers

## Phase 3 — Web: Visualization
- ✅ `src/visualization/ScatterPlot.js` — 3D axes + sphere instances
- ✅ `src/visualization/TrackSphere.js` — individual sphere + hover/select
- ✅ `src/visualization/AxisRenderer.js` — axis lines + tick labels
- ✅ `src/visualization/ProjectionRay.js` — selection crosshair on XZ plane

## Phase 4 — Web: UI
- ✅ `src/ui/MenuPanel.js` — axis selectors + filters popup (desktop)
- ✅ `src/ui/VRMenuPanel.js` — 3D wrist panel (VR, attaches to left controller)

## Phase 5 — Web: XR
- ✅ `src/xr/ARManager.js` — WebXR immersive-ar + plane detection + placement
- ✅ `src/xr/VRManager.js` — WebXR immersive-vr + controller events + wrist menu logic

## Phase 6 — Unity: Data Layer
- ✅ `Scripts/Data/SpotifyTrack.cs`
- ✅ `Scripts/Data/SpotifyDataLoader.cs`
- ✅ `Scripts/Data/FilterState.cs`

## Phase 7 — Unity: Visualization
- ✅ `Scripts/Visualization/DataVisualizer.cs`
- ✅ `Scripts/Visualization/TrackPoint.cs`
- ✅ `Scripts/Visualization/AxisRenderer.cs`
- ✅ `Scripts/Visualization/ProjectionRay.cs`
- ✅ `Scripts/Visualization/ColorMapper.cs`

## Phase 8 — Unity: UI
- ✅ `Scripts/UI/MenuController.cs` — desktop popup + VR wrist activation logic
- ✅ `Scripts/UI/FilterPanelUI.cs` — UGUI sliders + dropdowns bound to FilterState

## Phase 9 — Unity: XR
- ✅ `Scripts/XR/XRPlatformManager.cs` — detects AR/VR/Desktop at runtime
- ✅ `Scripts/XR/ARPlacementHandler.cs` — AR Foundation plane detection + tap to place
- ✅ `Scripts/XR/VRWristMenuActivator.cs` — palm-toward-head detection
- ✅ `Scripts/XR/VRPointSelector.cs` — ray interactor → TrackPoint selection

## Phase 10 — Unity: Scene Setup
- ✅ SCENE_SETUP.md written

## Phase 11 — GitHub
- ⬜ Install gh CLI (`winget install GitHub.cli`)
- ⬜ `gh auth login`
- ⬜ `gh repo create Freitag9/InfoVisDataVisualizer --public`
- ⬜ `git init && git push`

---

## Open Questions / Decisions
- [ ] Web build: deploy target? (GitHub Pages, Vercel, local only?)
- [ ] Unity: Android AR build target? (ARCore) or iOS (ARKit) or both?
- [ ] Web AR: iOS support needed? (limited WebXR AR on Safari)
