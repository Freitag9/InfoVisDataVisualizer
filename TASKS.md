# Tasks & Progress

## Legend
✅ Done · 🔧 In Progress · ⬜ Pending

---

## Done
- ✅ Project scaffold (Web/, tools/, docs/)
- ✅ GitHub repo `Freitag9/InfoVisDataVisualizer` (private)
- ✅ Dataset cleaned (`tools/clean_dataset.py`) → `Web/public/dataset.csv`
- ✅ Data layer: `DataLoader`, `FilterState`, `ColorMapper`, `DataUtils`, `RecentlyViewed`
- ✅ Visualization: `ScatterPlot`, `AxisRenderer`, `ProjectionRay` (stable sampling)
- ✅ UI: collapsible side panel, search bar, recently viewed, segmented controls
- ✅ XR: `ARManager` (plane detect, tap/triple-tap), `VRManager` (Rift: locomotion, grab, Y-menu, ray pick), `VRMenuPanel`, `VRTrackInfoPanel`
- ✅ Axis-coupled range filters + Mode/Vocal filters (fixed axis↔filter mismatch)
- ✅ EEG user-test protocol → `docs/EEG_Testprotokoll_SpotifyViz.docx`
- ✅ Removed Unity (no longer needed)

## Open / Ideas
- ⬜ Event-logging in the app (task_start/end, success/error, interactions → CSV for EEG sync)
- ⬜ LSL marker bridge (browser → EEG) for the protocol
- ⬜ Deploy target (GitHub Pages / Vercel) + persistent HTTPS for phone/VR
- ⬜ Genre legend overlay + color-by alternatives (mode/key/popularity)
- ⬜ iOS AR support investigation (WebXR limited on Safari)
