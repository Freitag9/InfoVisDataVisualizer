/**
 * Short German descriptions of the Spotify audio features used as axes/filters.
 * Based on the official Spotify Web API audio-feature definitions, which this
 * Kaggle dataset adopts verbatim.
 */
export const FEATURE_INFO = [
  { key: 'danceability', label: 'Danceability',
    range: '0.0 – 1.0',
    desc: 'Wie gut sich ein Track zum Tanzen eignet (Tempo, Rhythmus-Stabilität, Beat-Stärke). 0 = ungeeignet, 1 = sehr tanzbar.' },
  { key: 'energy', label: 'Energy',
    range: '0.0 – 1.0',
    desc: 'Empfundene Intensität und Aktivität. Energiereiche Tracks wirken schnell, laut und kraftvoll (z. B. Metal). Ruhige Stücke liegen niedrig.' },
  { key: 'valence', label: 'Valence',
    range: '0.0 – 1.0',
    desc: 'Musikalische „Stimmung“. Hoch = fröhlich, positiv, euphorisch; niedrig = traurig, düster, wütend.' },
  { key: 'acousticness', label: 'Acousticness',
    range: '0.0 – 1.0',
    desc: 'Wahrscheinlichkeit, dass der Track akustisch ist (keine elektronische Verstärkung). 1 = mit hoher Sicherheit akustisch.' },
  { key: 'instrumentalness', label: 'Instrumentalness',
    range: '0.0 – 1.0',
    desc: 'Wahrscheinlichkeit, dass der Track keinen Gesang enthält. Werte > 0.5 deuten auf Instrumental­stücke hin („Ooh“/„Aah“ gilt als instrumental).' },
  { key: 'speechiness', label: 'Speechiness',
    range: '0.0 – 1.0',
    desc: 'Anteil gesprochener Wörter. > 0.66 = überwiegend Sprache (Podcast/Spoken Word), 0.33–0.66 = Mix (z. B. Rap), < 0.33 = Musik.' },
  { key: 'liveness', label: 'Liveness',
    range: '0.0 – 1.0',
    desc: 'Wahrscheinlichkeit einer Live-Aufnahme (hörbares Publikum). Werte > 0.8 deuten stark auf eine Live-Performance hin.' },
  { key: 'tempo', label: 'Tempo',
    range: '≈ 40 – 220 BPM',
    desc: 'Geschätztes Tempo in Schlägen pro Minute (BPM) – die Geschwindigkeit des Stücks.' },
  { key: 'loudness', label: 'Loudness',
    range: '≈ -60 – 0 dB',
    desc: 'Durchschnittliche Lautstärke des gesamten Tracks in Dezibel. Näher an 0 = lauter.' },
  { key: 'popularity', label: 'Popularity',
    range: '0 – 100',
    desc: 'Beliebtheit bei Spotify (basierend auf Abspielzahlen & Aktualität). 100 = aktuell sehr populär. Bestimmt auch die Kugelgröße.' },
  { key: 'duration_min', label: 'Duration',
    range: 'Minuten',
    desc: 'Länge des Tracks (im Datensatz als duration_ms, hier in Minuten dargestellt).' },
];

/** Concept descriptions for the non-axis filters / encodings. */
export const ENCODING_INFO = [
  { label: 'Kugelfarbe = Genre',
    desc: 'Jedes der ~114 Genres erhält eine eigene Farbe.' },
  { label: 'Kugelgröße = Popularity',
    desc: 'Größere Kugeln = populärere Tracks.' },
  { label: 'Vocals-Filter',
    desc: '„Instrumental“ zeigt nur Tracks mit instrumentalness ≥ 0.5, „Vocal“ den Rest.' },
  { label: 'Explicit',
    desc: 'Markiert Tracks mit explizitem Inhalt (Jugendschutz-Flag von Spotify).' },
];
