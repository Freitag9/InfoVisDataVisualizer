# InfoVisDataVisualizer

Interaktive **3D-Informationsvisualisierung** des Spotify-Tracks-Datensatzes als Scatter-Plot im Raum — lauffähig im **Web (Desktop)**, in **AR** (Handykamera, Projektion auf den Tisch) und in **VR** (WebXR-Headset, z. B. Oculus Rift).

## Live-Version
**https://freitag9.github.io/InfoVisDataVisualizer/**

Läuft direkt im Browser (Desktop, Handy, VR-Headset). Über HTTPS ausgeliefert → AR/VR funktionieren ohne weitere Einrichtung. Automatisches Deployment über GitHub Pages.

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

**Selektion:** Klick/Trigger auf eine Kugel → **Projektionsstrahl** (X/Z-Ablesung auf dem Boden, Y-Marker) + **Detail-Panel** (alle Werte). Ausgewählte Tracks landen in **Recently Viewed**.

**Legende (ⓘ-Button):** Ein Glossar-Overlay erklärt jedes Feature knapp (nach den offiziellen Spotify-Definitionen), damit es auch auf dem Handy funktioniert.

## 5 · XR (AR & VR)

**AR (Handy, Chrome/Android):**
- „Enter AR" → Kamera erkennt eine Fläche (Plane Detection), ein Reticle erscheint.
- **1× tippen** platziert den Plot auf dem Tisch; **3× schnell tippen** setzt ihn zurück und platziert neu.

**VR (WebXR-Headset, getestet mit Oculus Rift):**
- **Linker Stick** = Fortbewegung, **Squeeze/Greifen** (beide Controller) = Plot packen & verschieben.
- **Rechter Trigger** = Kugel per Strahl auswählen.
- **Y-Taste (links)** blendet ein **Handmenü** ein (Indikator schwebt über dem Controller); Bedienung mit dem rechten Controller-Strahl.


## 6 · EEG-Nutzertest

Zur Evaluierung wurde die Visualisierung in einer **Nutzertest-Session mit EEG** (biosignalsplux, 1000 Hz, Kanäle CH1/CH2 = EEG) getestet, synchronisiert mit einer Bildschirmaufnahme.

- **Testprotokoll (Template):** [`docs/EEG_Testprotokoll_SpotifyViz.docx`](docs/EEG_Testprotokoll_SpotifyViz.docx) — Tasks T1–T7, Erfolgskriterien, Event-Log→EEG-Marker-Mapping, LSL-Beispiel.
- **Auswertungs-Report (PDF):** [`docs/EEG_Output.pdf`](docs/EEG_Output.pdf)

### Interpretation der Test-Session

*(Session „Gruppe 3 – Spotify", 2026-06-03)*

- **Synchronisation:** Das EEG (`opensignals_…_10-37-13.txt`, Start 10:37:18.68) wurde per Skript (`tools/crop_eeg_to_video.py`) exakt auf den Start der Bildschirmaufnahme (10:38:04.000, per ffprobe verifiziert) zugeschnitten und auf die Videolänge (469,9 s) begrenzt → deckungsgleiche EEG-/Video-Zeitachse für die Desktop-Bedingung.
- **Abdeckung:** Die **Desktop**-Bedingung ist vollständig mit EEG abgedeckt. Die **AR**-Aufnahme fiel in eine Lücke zwischen zwei EEG-Sessions und hat **kein** zugehöriges EEG. Sie ist daher nicht neurophysiologisch auswertbar (dokumentierte Limitation).

**Beobachtungen (erste, auswertbare Session-Hälfte):**
- **Aussagekraft:** Nur die **erste Hälfte** der Aufnahme ist interpretierbar. Danach dominieren zunehmend nicht klar zuzuordnende („sonstige") Wellenanteile — vermutlich nachlassende Signalqualität / Artefakte —, sodass eine neurophysiologische Interpretation der zweiten Hälfte nicht mehr sinnvoll ist.
- **Lesen & Finden:** Sobald der Proband Informationen **lesen** oder gezielt etwas **finden** will, verschiebt sich das Bild deutlich in den „roten" Bereich der Bandanzeige → sichtbar erhöhte kognitive **Anstrengung**.
- **T2 – gezieltes Umstellen:** Beim Wechsel/Umstellen konkreter Achsenwerte ist die Anstrengung besonders deutlich, sobald eine bestimmte Einstellung gefordert wird.
- **Schlussfolgern/Interpretieren:** Auch bei den Schlussfolgerungs-Aufgaben wird der Verlauf klar rot → erhöhte Beanspruchung.
- Danach überwiegen die „sonstigen" Anteile so stark, dass keine weitere Aussage möglich ist.

**Abgeleitete Verbesserung:** Die beobachteten Anstrengungsspitzen beim Umstellen/Filtern führten zu einer konkreten Fehlerbehebung — es lassen sich nun **nicht mehr zwei gleiche Features auf zwei verschiedenen Achsen** wählen (die Achsen tauschen ihre Werte statt zu duplizieren). Das verhindert eine widersprüchliche, redundante Darstellung und reduziert unnötige Fehlbedienung/Last beim Konfigurieren der Achsen.

## 7 · Verbesserungsideen (aus dem EEG-Test abgeleitet)

*Geplante Ansätze, um die im EEG sichtbaren Anstrengungs-Spitzen gezielt zu reduzieren.*

**Ablesen von Werten erleichtern** (rote Last beim Lesen/Finden):
- Deutlichere **Achsen-Ticks** und dauerhaft sichtbare **Gitterlinien**, damit Werte schneller eingeordnet werden können.
- **Hover-Tooltip** direkt an der Kugel, statt den Blick zum seitlichen Detail-Panel wandern zu lassen.
- **Projektionsstrahl-Labels** größer und kontrastreicher darstellen.

**Achsen-Konfiguration vereinfachen** (rote Last bei T2 / gezieltem Umstellen):
- **Mood-Presets** („Happy", „Chill", „Energetic") setzen Achsen + Filter mit einem Klick.
- Achsen-Dropdowns **gruppieren / mit Icons** versehen, um die Auswahl schneller zu machen.
