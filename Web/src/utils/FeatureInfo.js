/**
 * German descriptions of the Spotify audio features used as axes/filters.
 * Wording follows the official Kaggle dataset column descriptions
 * (maharshipandya/-spotify-tracks-dataset), condensed.
 */
export const FEATURE_INFO = [
  { key: 'danceability', label: 'Danceability',
    range: '0.0 – 1.0',
    desc: 'Wie gut sich ein Track zum Tanzen eignet – kombiniert aus Tempo, Rhythmus-Stabilität, Beat-Stärke und Regelmäßigkeit. 0.0 = am wenigsten, 1.0 = am tanzbarsten.' },
  { key: 'energy', label: 'Energy',
    range: '0.0 – 1.0',
    desc: 'Empfundene Intensität und Aktivität. Energiereiche Tracks wirken schnell, laut und „noisy“ (z. B. Death Metal); ein Bach-Präludium liegt niedrig.' },
  { key: 'valence', label: 'Valence',
    range: '0.0 – 1.0',
    desc: 'Musikalische Positivität. Hoch = positiv (fröhlich, euphorisch), niedrig = negativ (traurig, deprimiert, wütend).' },
  { key: 'acousticness', label: 'Acousticness',
    range: '0.0 – 1.0',
    desc: 'Konfidenzmaß, ob der Track akustisch ist. 1.0 = mit hoher Sicherheit akustisch.' },
  { key: 'instrumentalness', label: 'Instrumentalness',
    range: '0.0 – 1.0',
    desc: 'Vorhersage, ob ein Track keinen Gesang enthält („Ooh“/„Aah“ gilt als instrumental). Je näher an 1.0, desto wahrscheinlicher ohne Vocals. Rap/Spoken Word sind klar „vocal“.' },
  { key: 'speechiness', label: 'Speechiness',
    range: '0.0 – 1.0',
    desc: 'Anteil gesprochener Wörter. > 0.66 = vermutlich reine Sprache (Talk, Hörbuch); 0.33–0.66 = Mix aus Musik und Sprache (z. B. Rap); < 0.33 = überwiegend Musik.' },
  { key: 'liveness', label: 'Liveness',
    range: '0.0 – 1.0',
    desc: 'Erkennt ein Publikum in der Aufnahme. Höhere Werte = wahrscheinlicher live; > 0.8 = sehr wahrscheinlich eine Live-Aufnahme.' },
  { key: 'tempo', label: 'Tempo',
    range: '≈ 40 – 220 BPM',
    desc: 'Geschätztes Tempo in Schlägen pro Minute (BPM) – die Geschwindigkeit/das Pace des Stücks.' },
  { key: 'loudness', label: 'Loudness',
    range: '≈ -60 – 0 dB',
    desc: 'Gesamtlautstärke des Tracks in Dezibel (dB). Näher an 0 = lauter.' },
  { key: 'popularity', label: 'Popularity',
    range: '0 – 100',
    desc: 'Algorithmisch berechnete Beliebtheit (v. a. Anzahl & Aktualität der Abspielungen). 100 = aktuell am populärsten; ältere Hits liegen niedriger. Bestimmt auch die Kugelgröße.' },
  { key: 'duration_min', label: 'Duration',
    range: 'Minuten',
    desc: 'Länge des Tracks. Im Datensatz als duration_ms (Millisekunden), hier in Minuten dargestellt.' },
];

/** Concept descriptions for the non-axis filters / encodings. */
export const ENCODING_INFO = [
  { label: 'Kugelfarbe = Genre-Familie',
    desc: 'Die 114 Genres sind in 14 Familien gruppiert (Rock, Metal, Electronic, Pop, …), jede mit eigener Farbe. Siehe Genre-Legende im Menü. Der Genre-Filter erlaubt weiterhin die Auswahl jedes einzelnen Genres.' },
  { label: 'Kugelgröße = Popularity',
    desc: 'Größere Kugeln stehen für populärere Tracks.' },
  { label: 'Vocals-Filter',
    desc: '„Instrumental“ zeigt nur Tracks mit instrumentalness ≥ 0.5, „Vocal“ den Rest.' },
  { label: 'Explicit',
    desc: 'Track mit explizitem Text (true = ja; false = nein oder unbekannt).' },
];
