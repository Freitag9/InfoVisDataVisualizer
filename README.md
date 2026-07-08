# InfoVisDataVisualizer

Interaktive **3D-Informationsvisualisierung** des Spotify-Tracks-Datensatzes als Scatter-Plot im Raum — lauffähig im **Web (Desktop)**, in **AR** (Handykamera, Projektion auf den Tisch) und in **VR** (WebXR-Headset, z. B. Oculus Rift). Gebaut mit **Babylon.js + WebXR**.

## 🌍 Live-Version
**https://freitag9.github.io/InfoVisDataVisualizer/**

Läuft direkt im Browser (Desktop, Handy, VR-Headset). Über HTTPS ausgeliefert → AR/VR funktionieren ohne weitere Einrichtung. Automatisches Deployment über GitHub Pages bei jedem Push (`.github/workflows/deploy.yml`).

---

## 1 · Welche Daten werden visualisiert? (+ Quelle)

**Datensatz:** [Spotify Tracks Dataset (Kaggle, maharshipandya)](https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset)
114.000 Tracks aus ~114 Genres mit den von Spotify berechneten **Audio-Features**.

Pro Track u. a.: `track_name`, `artists`, `track_genre`, `popularity`, `danceability`, `energy`, `valence`, `acousticness`, `instrumentalness`, `speechiness`, `liveness`, `tempo`, `loudness`, `duration_ms`, `explicit`, `key`, `mode`, `time_signature`.

**Aufbereitung:** `tools/clean_dataset.py` entfernt ungültige Zeilen (tempo = 0, time_signature = 0, duration = 0, leerer Trackname → 164 Zeilen) → **113.836 Tracks**. Duplikate (derselbe Song unter mehreren Genres) bleiben bewusst erhalten, um Genre-Vergleiche zu ermöglichen. Ergebnis liegt als `Web/public/dataset.csv`.

## 2 · Warum diese Visualisierung?

Spotify-Audio-Features spannen einen **hochdimensionalen Merkmalsraum** auf. Klassische 2D-Diagramme zeigen immer nur zwei Merkmale gleichzeitig und verdecken Zusammenhänge. Ziele dieses Projekts:

- **Drei Merkmale gleichzeitig** räumlich erfahrbar machen und frei gegeneinander austauschen.
- **Muster & Cluster** zwischen Genres sichtbar machen (z. B. „Metal = hohe Energy/niedrige Valence", „Acoustic/Folk = hohe Acousticness").
- **Immersion nutzen:** In AR/VR kann man sich *in* der Punktwolke bewegen, was räumliche Strukturen besser begreifbar macht als eine 2D-Projektion.
- Ein exploratives Werkzeug bauen, das typische InfoVis-Aufgaben unterstützt (Überblick, Vergleich, Filtern, Ausreißer finden, Detailanalyse).

## 3 · Wie sind die Daten gemappt?

| Kanal | Datenfeld | Bemerkung |
|---|---|---|
| **X / Y / Z-Position** | je ein wählbares Feature | Standard: Danceability / Energy / Valence. Jede Achse frei aus 11 Features umstellbar |
| **Kugelgröße** | `popularity` | größer = populärer |
| **Kugelfarbe** | `track_genre` → **Genre-Familie** | 114 Genres in 14 gut unterscheidbare Farbfamilien gruppiert (siehe unten) |
| **Projektionsstrahl** | Position der gewählten Kugel | senkrechte Linie auf die XZ-Ebene + Bodenkreuz + Achsenwerte zum Ablesen |

**Normalisierung:** Alle Achsenwerte werden vor dem Mapping auf `[0,1]` normalisiert (z. B. `tempo → (BPM−40)/180`, `loudness → (dB+60)/60`), damit unterschiedliche Wertebereiche vergleichbar im Plot-Würfel liegen.

**Farb-Kodierung / Legende:** Da Menschen kaum mehr als ~14–20 Farben zuverlässig auseinanderhalten, werden die 114 Genres zu **14 Familien** zusammengefasst (Rock, Metal, Punk/Emo, Electronic, Pop, HipHop/R&B, Latin, Jazz/Blues, Classical, Folk/Country, World, Asian Pop, Chill/Mood, Other) — jede mit einer perzeptuell distinkten Farbe. Eine **Legende** im Menü ordnet Farbe ↔ Familie eindeutig zu. Der Genre-*Filter* arbeitet weiterhin auf allen 114 Einzelgenres.

## 4 · Interaktion

**Navigation (Desktop):** Orbit = linke Maustaste, Pan = rechte Maustaste, Zoom = Mausrad.

**Suche:** Suchleiste oben durchsucht **Trackname und Künstler** (Präfix-Treffer zuerst, dann Teiltreffer) — schlägt nur aktuell **gezeichnete** Tracks vor. Auswahl fliegt zur Kugel und öffnet das Detail-Panel.

**Filter** (Seitenmenü, ein- und ausklappbar):
- **Achsen-gekoppelte Range-Filter** (X/Y/Z): je ein Doppel-Schieberegler, der genau das Feature filtert, das gerade auf der Achse liegt — beim Achsenwechsel wird der Bereich zurückgesetzt.
- **Genre** (Dropdown, alle 114), **Popularity** (Doppel-Slider), **Vocals** (All / Instrumental / Vocal), **Explicit** (Toggle).
- **Track-Anzahl** (50–2000): bei Änderung wird die angezeigte Stichprobe **neu gewürfelt**; Filter- und Achsenänderungen lassen die Auswahl dagegen stabil (kein zufälliges Umspringen).

**Selektion:** Klick/Trigger auf eine Kugel → **Projektionsstrahl** (X/Z-Ablesung auf dem Boden, Y-Marker) + **Detail-Panel** (alle Werte). Ausgewählte Tracks landen in **Recently Viewed** (bleibt via localStorage erhalten).

**Legende (ⓘ-Button):** Ein Glossar-Overlay erklärt jedes Feature knapp (nach den offiziellen Spotify-Definitionen) — Tap-basiert, damit es auch auf dem Handy funktioniert.

## 5 · XR (AR & VR)

**AR (Handy, Chrome/Android):**
- „Enter AR" → Kamera erkennt eine Fläche (Plane Detection), ein Reticle erscheint.
- **1× tippen** platziert den Plot auf dem Tisch; **3× schnell tippen** setzt ihn zurück und platziert neu.

**VR (WebXR-Headset, getestet mit Oculus Rift):**
- **Linker Stick** = Fortbewegung, **Squeeze/Greifen** (beide Controller) = Plot packen & verschieben.
- **Rechter Trigger** = Kugel per Strahl auswählen.
- **Y-Taste (links)** blendet ein **Handmenü** ein (Indikator schwebt über dem Controller); Bedienung mit dem rechten Controller-Strahl.

> Web/Handy nutzen für AR/VR HTTPS — die Live-Version erfüllt das bereits. Für lokale XR-Tests siehe [CHEATSHEET.md](CHEATSHEET.md) (ngrok-Tunnel).

## 6 · EEG-Nutzertest

Zur Evaluierung wurde die Visualisierung in einer **Nutzertest-Session mit EEG** (biosignalsplux, 1000 Hz, Kanäle CH1/CH2 = EEG) getestet, synchronisiert mit einer Bildschirmaufnahme.

- **Testprotokoll (Template):** [`docs/EEG_Testprotokoll_SpotifyViz.docx`](docs/EEG_Testprotokoll_SpotifyViz.docx) — Tasks T1–T7, Erfolgskriterien, Event-Log→EEG-Marker-Mapping, LSL-Beispiel.
- **Auswertungs-Report (PDF):** [`docs/EEG_Report.pdf`](docs/EEG_Report.pdf)

### Interpretation der Test-Session

*(Session „Gruppe 3 – Spotify", 2026-06-03)*

- **Synchronisation:** Das EEG (`opensignals_…_10-37-13.txt`, Start 10:37:18.68) wurde per Skript (`tools/crop_eeg_to_video.py`) exakt auf den Start der Bildschirmaufnahme (10:38:04.000, per ffprobe verifiziert) zugeschnitten und auf die Videolänge (469,9 s) begrenzt → deckungsgleiche EEG-/Video-Zeitachse für die Desktop-Bedingung.
- **Abdeckung:** Die **Desktop**-Bedingung ist vollständig mit EEG abgedeckt. Die **AR**-Aufnahme fiel in eine Lücke zwischen zwei EEG-Sessions und hat **kein** zugehöriges EEG — sie ist daher nicht neurophysiologisch auswertbar (dokumentierte Limitation).
- **Quantitative Ergebnisse:** siehe PDF-Report / `eeg_tests/gen_report.ipynb` — u. a. Frontal-Theta (mentale Last) pro Task und Alpha-Aktivität als Entspannungs-/Aufmerksamkeitsmaß.

> **Kurzfazit (aus der Session abzuleiten):** _[hier die zentralen Beobachtungen aus dem Report eintragen — z. B. „erhöhte Frontal-Theta-Power beim Achsen-Umstellen (T2) und beim Mehrfach-Filtern (T3) deutet auf höhere kognitive Last hin; Selektion/Ablesen (T4) wurde als am wenigsten belastend erlebt."]_

## Projektstruktur
```
InfoVisDataVisualizer/
├── Web/       # Babylon.js + WebXR App (Vite)
│   ├── src/   # data / visualization / ui / xr / utils
│   └── public/dataset.csv
├── tools/     # Datensatz-Cleaning, EEG-Crop & -Konvertierung, Report-Generator
├── docs/      # EEG-Testprotokoll (.docx) + Report (.pdf)
└── .github/   # Pages-Deploy-Workflow
```

## Lokale Entwicklung
```bash
cd Web
npm install
npm run dev        # http://localhost:5173
```
Für Handy/AR/VR lokal per HTTPS-Tunnel: siehe [CHEATSHEET.md](CHEATSHEET.md).

## Status
Fortschritt & offene Punkte: [TASKS.md](TASKS.md) · Architektur: [ARCHITECTURE.md](ARCHITECTURE.md)
