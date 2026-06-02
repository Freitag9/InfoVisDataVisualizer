# Cheatsheet — InfoVisDataVisualizer starten

Alle Befehle in **PowerShell** ausführen. Projektordner:
`D:\Calude Working Folder\InfoVis\InfoVisDataVisualizer`

---

## 0 · Einmalige Einrichtung (nur beim ersten Mal)

```powershell
# Node-Pakete installieren
cd "D:\Calude Working Folder\InfoVis\InfoVisDataVisualizer\Web"
npm install
```

ngrok einmalig mit Account verknüpfen (für Handy/VR mit HTTPS):
```powershell
# Token von https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken DEIN_TOKEN
```

---

## 1 · Lokal am PC (Desktop 3D)

```powershell
cd "D:\Calude Working Folder\InfoVis\InfoVisDataVisualizer\Web"
npm run dev
```

Browser öffnen: **http://localhost:5173**
> Falls Opera GX auf https umleitet → URL manuell mit `http://` eintippen.

Stoppen: im Terminal `Strg + C`

---

## 2 · Am Handy (gleiches WLAN, 3D ohne AR)

Funktioniert ohne HTTPS, solange du **kein AR** brauchst.

```powershell
# 1. Server starten (zeigt am Ende eine "Network:"-URL)
cd "D:\Calude Working Folder\InfoVis\InfoVisDataVisualizer\Web"
npm run dev

# 2. (falls IP nicht angezeigt) PC-IP herausfinden:
ipconfig
#    → bei "WLAN-Adapter" die IPv4-Adresse nehmen, z.B. 192.168.1.42
```

Am Handy in **Chrome** öffnen: `http://<PC-IP>:5173`  (z.B. `http://192.168.1.42:5173`)

---

## 3 · AR am Handy + VR (braucht HTTPS via ngrok)

Zwei Terminals nötig.

**Terminal A — Dev-Server:**
```powershell
cd "D:\Calude Working Folder\InfoVis\InfoVisDataVisualizer\Web"
npm run dev
```

**Terminal B — HTTPS-Tunnel:**
```powershell
ngrok http 5173
```
ngrok zeigt eine Zeile wie:
```
Forwarding  https://xxxx-xx-xx.ngrok-free.dev -> http://localhost:5173
```

> **Wichtig:** Die ngrok-Domain muss in `Web/vite.config.js` unter `allowedHosts`
> stehen. Aktuell sind `.ngrok-free.app` / `.ngrok-free.dev` / `.ngrok.app`
> als Wildcard erlaubt — neue Subdomains funktionieren also automatisch.
> Falls doch ein "host not allowed"-Fehler kommt: exakte Domain dort eintragen
> und Dev-Server neu starten.

### AR (Handy)
- Diese `https://...ngrok...`-URL am Handy in **Chrome (Android)** öffnen
- Button **"Enter AR"** wird aktiv
- Auf flache Fläche (Tisch) zeigen → Ring erscheint → **1× tippen** = platzieren
- **3× schnell tippen** = zurücksetzen und neu platzieren
- iOS Safari: AR funktioniert dort **nicht** (WebXR-Einschränkung)

### VR (Oculus Rift / WebXR-Headset)
- SteamVR / Oculus-Runtime läuft, Headset verbunden
- ngrok-URL im **PC-Browser** (Chrome/Edge) öffnen → **"Enter VR"**
- Steuerung:
  - **Linker Stick** = bewegen
  - **Squeeze (Greifen)** = Plot packen & verschieben
  - **Rechter Trigger** = Kugel auswählen
  - **Y-Taste (links)** = Menü ein/aus (Indikator schwebt über dem Controller)
  - Menü mit dem **rechten Controller-Strahl** bedienen

---

## 4 · Datensatz neu bereinigen (nur bei neuen Rohdaten)

Nicht nötig im Normalbetrieb — die App lädt die fertige `Web/public/dataset.csv`.
Nur falls du eine neue Kaggle-CSV einspielst:

```powershell
cd "D:\Calude Working Folder\InfoVis\InfoVisDataVisualizer"
python tools/clean_dataset.py "PFAD\zur\rohdaten.csv" "Web\public\dataset.csv"
```

---

## 5 · EEG-Testprotokoll neu generieren (optional)

```powershell
cd "D:\Calude Working Folder\InfoVis\InfoVisDataVisualizer\Web"
$env:NODE_PATH="D:\Calude Working Folder\InfoVis\InfoVisDataVisualizer\Web\node_modules"
node ..\tools\gen_eeg_protocol.js
# → docs/EEG_Testprotokoll_SpotifyViz.docx
```

---

## 6 · Änderungen zu GitHub pushen

```powershell
cd "D:\Calude Working Folder\InfoVis\InfoVisDataVisualizer"
git add -A
git commit -m "Beschreibung der Änderung"
git push
```

---

## Schnell-Referenz

| Ziel | Befehl(e) | URL |
|------|-----------|-----|
| Desktop 3D | `npm run dev` | http://localhost:5173 |
| Handy 3D | `npm run dev` + `ipconfig` | http://<PC-IP>:5173 |
| Handy AR | `npm run dev` + `ngrok http 5173` | https://<ngrok>.ngrok-free.dev |
| VR | `npm run dev` + `ngrok http 5173` | https://<ngrok> im PC-Browser |
| Server stoppen | `Strg + C` | — |

**Faustregel:** Alles ohne AR/VR → `http` reicht. Sobald AR oder VR → `ngrok` (HTTPS) nötig.
