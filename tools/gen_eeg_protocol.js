/**
 * Generates docs/EEG_Testprotokoll_SpotifyViz.docx
 * A user-test + EEG protocol specialized for the InfoVis Spotify 3D Visualizer
 * (Web / AR / VR). Run from the Web/ folder:  node ../tools/gen_eeg_protocol.js
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  LevelFormat, PageBreak,
} = require('docx');

const GREEN = '1DB954';
const DARK  = '0A0A14';
const GREY  = '666666';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, ...opts })] });
}
function bullet(text) {
  return new Paragraph({ numbering: { reference: 'bullets', level: 0 },
    children: [new TextRun(text)] });
}
function numbered(text) {
  return new Paragraph({ numbering: { reference: 'steps', level: 0 },
    children: [new TextRun(text)] });
}
function cell(text, { w, head = false, bold = false } = {}) {
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: head ? { fill: GREEN, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({
      text, bold: head || bold, color: head ? DARK : undefined, size: 19,
    })] })],
  });
}
function mono(text) {
  return new Paragraph({ spacing: { after: 80 },
    children: [new TextRun({ text, font: 'Consolas', size: 18 })] });
}

// ── Task definitions specialized for the Spotify 3D Visualizer ──────────────
const tasks = [
  {
    id: 'T1', title: 'Übersicht / Big-Picture',
    instr: 'Betrachten Sie die 3D-Punktwolke und beschreiben Sie in einem Satz, welche Genres (Farben) den Raum dominieren und ob es erkennbare Cluster gibt.',
    crit: 'Nennung mindestens eines korrekten dominanten Genre-Clusters oder einer plausiblen räumlichen Struktur.',
    inter: 'Orbit/Zoom (Maus bzw. linker Stick), Genre-Farbcodierung lesen, Legende.',
    dur: '60–120 s', marker: 'TASK1',
  },
  {
    id: 'T2', title: 'Achsen umstellen & Vergleich',
    instr: 'Stellen Sie über das Menü die X-Achse auf "Tempo" und die Y-Achse auf "Energy" um. Vergleichen Sie, ob energiereiche Songs tendenziell schneller sind.',
    crit: 'Korrekte Achsenumstellung + plausible Aussage zur Korrelation (positiv/keine/negativ).',
    inter: 'Menü öffnen, Achsen-Dropdown (Web) bzw. Wrist-Menu ◀▶ (VR), Punktwolke neu lesen.',
    dur: '90–180 s', marker: 'TASK2',
  },
  {
    id: 'T3', title: 'Filter & Drill-Down',
    instr: 'Filtern Sie auf ein Genre Ihrer Wahl und begrenzen Sie die Popularity auf 70–100. Nennen Sie, wie sich die Anzahl/Dichte der Kugeln verändert.',
    crit: 'Filter korrekt gesetzt; nachvollziehbare Beschreibung der Reduktion der Punktmenge.',
    inter: 'Genre-Dropdown, Popularity-Dual-Slider, Track-Count.',
    dur: '60–120 s', marker: 'TASK3',
  },
  {
    id: 'T4', title: 'Einzelpunkt-Analyse (Projektionsstrahl)',
    instr: 'Wählen Sie eine große Kugel (hohe Popularity) aus und lesen Sie über den Projektionsstrahl die X-/Y-/Z-Werte ab. Nennen Sie Track + die drei Achsenwerte.',
    crit: 'Korrekter Track im Info-Panel; ungefähr korrekte Achsenwerte vom Projektionsstrahl abgelesen.',
    inter: 'Kugel anklicken/Trigger, Projektionslinien + Achsenlabels lesen, Info-Panel.',
    dur: '90–180 s', marker: 'TASK4',
  },
  {
    id: 'T5', title: 'Suche & Wiederfinden',
    instr: 'Nutzen Sie die Suchleiste, um einen konkreten Track (vom Versuchsleiter vorgegeben) zu finden und auszuwählen.',
    crit: 'Track über Suche gefunden, Kamera/Selektion auf der richtigen Kugel.',
    inter: 'Suchfeld tippen, Vorschlag wählen, Highlight beobachten.',
    dur: '45–90 s', marker: 'TASK5',
  },
  {
    id: 'T6', title: 'Mood-Exploration',
    instr: 'Finden Sie über Achsen Valence (X) und Energy (Y) den Quadranten "fröhlich + energiegeladen" und nennen Sie 1–2 Tracks daraus.',
    crit: 'Korrekte Verortung des high-valence/high-energy-Quadranten; plausible Track-Nennung.',
    inter: 'Achsen setzen, räumliche Navigation, Selektion, Info-Panel.',
    dur: '2–4 Min', marker: 'TASK6',
  },
  {
    id: 'T7', title: 'Freie Exploration (Think-aloud)',
    instr: 'Erkunden Sie die Visualisierung 5 Minuten frei und sprechen Sie laut, welche Fragen Sie stellen und welche Interaktionen Sie ausführen.',
    crit: 'Qualitativ: Anzahl sinnvoller Interaktionen, entdeckte Insights/Probleme.',
    inter: 'Beliebig (Suche, Filter, Achsen, AR/VR-Navigation, Grab).',
    dur: '5 Min', marker: 'TASK7',
  },
];

function taskBlock(t) {
  return [
    new Paragraph({ spacing: { before: 160, after: 60 },
      children: [new TextRun({ text: `${t.id} — ${t.title}`, bold: true, size: 24, color: GREEN })] }),
    p('Instruktion: ' + t.instr),
    p('Erfolgskriterium: ' + t.crit),
    p('Erwartete Interaktion: ' + t.inter),
    new Paragraph({ children: [
      new TextRun({ text: 'Dauer: ', bold: true }), new TextRun(t.dur),
      new TextRun({ text: '   ·   EEG-Marker: ', bold: true }),
      new TextRun({ text: `${t.marker}_START / ${t.marker}_END`, font: 'Consolas' }),
    ]}),
  ];
}

// ── Event-log mapping table ─────────────────────────────────────────────────
const events = [
  ['app_start',      '100', '—',     'App geladen, Datensatz fertig geparst'],
  ['task_start',     '2xx', 'Tn',    'Versuchsleiter startet Task n'],
  ['task_end',       '3xx', 'Tn',    'Task n beendet'],
  ['success',        '4xx', 'Tn',    'Erfolgskriterium erfüllt'],
  ['error',          '5xx', 'Tn',    'Fehlversuch / falsche Antwort'],
  ['axis_change',    '601', 'Tn',    'Achse umgestellt (Detail: dim,field)'],
  ['filter_change',  '602', 'Tn',    'Filter verändert (Detail: key,value)'],
  ['sphere_select',  '603', 'Tn',    'Kugel ausgewählt (Detail: track_id)'],
  ['search_use',     '604', 'Tn',    'Suche genutzt (Detail: query)'],
  ['xr_enter',       '610', 'Tn',    'AR/VR-Modus betreten (Detail: ar|vr)'],
  ['xr_place',       '611', 'Tn',    'AR-Plot platziert / VR-Grab'],
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, color: GREEN },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, color: DARK },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
      { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, // A4
      margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } } },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [new TextRun({ text: 'Testprotokoll — Nutzertest mit EEG', bold: true, size: 40, color: GREEN })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 },
        children: [new TextRun({ text: 'InfoVisDataVisualizer · Spotify 3D Scatter Plot (Web / AR / VR)', size: 24, color: GREY })] }),
      p('Spezialisiertes Protokoll für die Evaluierung der 3D-Informationsvisualisierung des Spotify-Tracks-Datensatzes. Felder in [ ] vor dem Versuch ausfüllen.', { italics: true }),

      h1('1 · Studienübersicht'),
      bullet('Studienleiter: [Name]'),
      bullet('Projekt/Titel: InfoVisDataVisualizer — 3D-Musikdaten-Exploration'),
      bullet('Datum: [YYYY-MM-DD]'),
      bullet('Ort / Raum: [Ort]'),
      bullet('Bedingung (eine pro Sitzung): [ ] Web-Desktop   [ ] AR (Tablet/Phone)   [ ] VR (Oculus Rift)'),
      bullet('Kontakt: [E-Mail / Tel]'),

      h1('2 · Ziele'),
      h2('Primär'),
      bullet('Usability & Informationsverständnis der 3D-Scatter-Visualisierung (Achsen, Filter, Selektion).'),
      bullet('Vergleich der Interaktionsmodalitäten Desktop vs. AR vs. VR.'),
      h2('Sekundär (EEG)'),
      bullet('Kognitive Last pro Task (Theta-Power frontal, Fz) — insb. beim Achsen-Umstellen (T2) und Mehrfachfilter (T3).'),
      bullet('ERP / Aufmerksamkeit bei Selektion und Projektionsstrahl-Ablesen (T4).'),
      bullet('Vergleich der mentalen Beanspruchung zwischen den Modalitäten.'),

      h1('3 · Teilnehmer'),
      bullet('Einschluss: [Alter 18–45, Normalsicht/korrigiert, DE/EN-Sprache]'),
      bullet('Ausschluss: [neurologische Erkrankungen, Epilepsie (VR!), starke Sehschwäche]'),
      bullet('VR-spezifisch: Anfälligkeit für Motion Sickness abfragen.'),
      bullet('Empfohlene Stichprobe: 5–12 pro Bedingung.'),

      h1('4 · Materialien & Geräte'),
      bullet('Web: [Laptop, Chrome/Edge-Version], Auflösung [ ]'),
      bullet('AR: [Android-Phone/Tablet, Chrome, WebXR], über HTTPS-Tunnel (ngrok)'),
      bullet('VR: Oculus Rift (oculus-touch-v2 Controller), SteamVR/Oculus-Runtime [Version]'),
      bullet('EEG-System: [Hersteller/Modell, Kanäle, Samplingrate]'),
      bullet('Sync: LSL-Marker-Stream + App-Event-Log (CSV, ISO8601)'),
      bullet('Software: InfoVisDataVisualizer [Git-Commit-Hash], Logging aktiv'),

      h1('5 · Versuchsaufbau (Kurzablauf)'),
      numbered('Begrüßung, Einverständnis & Demografie (5 min)'),
      numbered('EEG anlegen, Impedanzcheck (10–20 min)'),
      numbered('Ruhe-Baseline 2 × 60 s (Augen offen / geschlossen)'),
      numbered('Einweisung in Steuerung der gewählten Bedingung + Probeaufgabe (3–5 min)'),
      numbered('Aufgabenblock T1–T6 (mit Marker-Logging)'),
      numbered('Kurze Pause'),
      numbered('Freie Exploration T7 (Think-aloud)'),
      numbered('Nachbefragung (SUS, NASA-TLX, Interview) (10–15 min)'),
      numbered('EEG entfernen, Verabschiedung'),

      new Paragraph({ children: [new PageBreak()] }),
      h1('6 · Aufgaben (spezialisiert für die 3D-Visualisierung)'),
      p('Pro Task werden im Event-Log task_start, task_end und success/error mit der Task-ID geloggt; parallel sendet die App den passenden LSL-Marker an das EEG.', { italics: true }),
      ...tasks.flatMap(taskBlock),

      new Paragraph({ children: [new PageBreak()] }),
      h1('7 · Event-Logging (App → CSV)'),
      p('Format: CSV, ISO8601-Timestamp. Header:'),
      mono('timestamp,event_id,event_type,task_id,participant_id,details'),
      p('Beispielzeilen:'),
      mono('2026-02-12T10:23:12.456Z,201,task_start,T1,P01,"overview"'),
      mono('2026-02-12T10:23:40.012Z,601,axis_change,T2,P01,"x=tempo"'),
      mono('2026-02-12T10:24:05.778Z,603,sphere_select,T4,P01,"track_id=5SuOik..."'),
      mono('2026-02-12T10:24:30.900Z,401,success,T4,P01,"values_read"'),
      new Paragraph({ spacing: { before: 120, after: 80 },
        children: [new TextRun({ text: 'Event-Typ → EEG-Marker-Mapping', bold: true })] }),
      new Table({
        width: { size: 9638, type: WidthType.DXA },
        columnWidths: [2100, 1300, 1300, 4938],
        rows: [
          new TableRow({ tableHeader: true, children: [
            cell('event_type', { w: 2100, head: true }),
            cell('event_id', { w: 1300, head: true }),
            cell('task_id', { w: 1300, head: true }),
            cell('Bedeutung', { w: 4938, head: true }),
          ]}),
          ...events.map(e => new TableRow({ children: [
            cell(e[0], { w: 2100 }), cell(e[1], { w: 1300 }),
            cell(e[2], { w: 1300 }), cell(e[3], { w: 4938 }),
          ]})),
        ],
      }),
      p(''),
      p('Dokumentation: event_mapping.json ordnet Event-IDs den EEG-Markernummern zu; marker_map.md beschreibt die TASKn_START/END-Labels.', { italics: true }),

      h1('8 · EEG-Messparameter (zum Ausfüllen)'),
      bullet('Samplingrate: [Hz]'),
      bullet('Referenz: [z. B. Cz / Linked Mastoids]'),
      bullet('Filter (vorläufig): Hochpass [Hz], Tiefpass [Hz], Notch [50 Hz]'),
      bullet('Impedanz-Grenzwert: [< 10 kΩ]'),
      bullet('Interessante Elektroden: Fz/FCz (Theta/Last), Pz/POz (visuell), O1/O2'),
      bullet('Marker-Kanal / LSL-Stream-Name: [marker_stream_01]'),

      h1('9 · LSL / Marker-Protokoll'),
      p('Die App sendet bei jedem Task-Event ein konsistentes Marker-Label (z. B. TASK2_START). Beispiel-Sender:'),
      mono("from pylsl import StreamInfo, StreamOutlet"),
      mono("info = StreamInfo('Markers','Markers',1,0,'string','marker_stream_01')"),
      mono("outlet = StreamOutlet(info)"),
      mono("outlet.push_sample(['TASK2_START'])"),

      h1('10 · Checklisten'),
      h2('Pre-Test'),
      bullet('Raum ruhig, Beleuchtung ok'),
      bullet('Consent & Demografie abgeschlossen'),
      bullet('EEG aufgelegt, Impedanzen dokumentiert'),
      bullet('Marker-Test: mind. 5 Marker im EEG sichtbar'),
      bullet('App-Logging aktiv, CSV-Pfad gesetzt; Backup-Pfad definiert'),
      bullet('AR: HTTPS-Tunnel läuft / VR: Controller verbunden & getrackt'),
      h2('Post-Processing'),
      bullet('Rohdaten an 2 Orten gesichert'),
      bullet('App-Events mit EEG synchronisiert geprüft (Marker-Latenz)'),
      bullet('Preprocessing (Filter, ICA) im Notebook vorhanden'),
      bullet('Ergebnisse reproduzierbar aus Notebook'),

      h1('11 · Nachbefragung'),
      bullet('SUS-Score: [ ]'),
      bullet('NASA-TLX (mentale Last 0–100): [ ]'),
      bullet('Subjektive Belastung (0–10): [ ]'),
      bullet('Freie Kommentare: [Was fiel auf? Was fehlte? Orientierung im 3D-Raum?]'),

      h1('12 · Troubleshooting'),
      bullet('Keine Marker im EEG: LSL-Stream & marker_map prüfen, Latenz testen'),
      bullet('VR: Controller nicht erkannt → Konsole prüfen ([VR] controller added)'),
      bullet('AR: Plot platziert nicht → Plane-Detection / 3×-Tap-Reset nutzen'),
      bullet('Hohe Impedanzen / Artefakte: Elektroden neu setzen, EOG prüfen'),

      new Paragraph({ spacing: { before: 240 },
        children: [new TextRun({ text: 'Dateiname-Vorschlag: sub-<ID>_ses-<N>_testprotocol_spotifyviz.md', italics: true, color: GREY })] }),
    ],
  }],
});

const outDir = path.join(__dirname, '..', 'docs');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'EEG_Testprotokoll_SpotifyViz.docx');
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(outPath, buf); console.log('Wrote', outPath); });
