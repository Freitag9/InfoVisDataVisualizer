// Genre → family → distinct color.
// 114 fine genres are grouped into 14 families, each with a perceptually
// distinct color (humans can't reliably tell apart more than ~14–20 colors).
// The genre filter still uses all 114 genres; only the COLOR is by family.

export const FAMILY_COLORS = {
  'Rock':            '#e6194B',
  'Metal':           '#911eb4',
  'Punk / Emo':      '#f032e6',
  'Electronic':      '#42d4f4',
  'Pop':             '#f58231',
  'HipHop / R&B':    '#ffe119',
  'Latin':           '#3cb44b',
  'Jazz / Blues':    '#9A6324',
  'Classical':       '#469990',
  'Folk / Country':  '#bfef45',
  'World':           '#800000',
  'Asian Pop':       '#4363d8',
  'Chill / Mood':    '#fabed4',
  'Other':           '#9a9a9a',
};

const GENRE_FAMILY = {
  // Rock
  'alt-rock':'Rock','alternative':'Rock','british':'Rock','grunge':'Rock','hard-rock':'Rock',
  'indie':'Rock','psych-rock':'Rock','rock':'Rock','rock-n-roll':'Rock','rockabilly':'Rock',
  'power-pop':'Rock','garage':'Rock',
  // Metal
  'black-metal':'Metal','death-metal':'Metal','grindcore':'Metal','heavy-metal':'Metal',
  'metal':'Metal','metalcore':'Metal','industrial':'Metal','goth':'Metal',
  // Punk / Emo
  'emo':'Punk / Emo','punk':'Punk / Emo','punk-rock':'Punk / Emo','hardcore':'Punk / Emo','ska':'Punk / Emo',
  // Electronic
  'breakbeat':'Electronic','chicago-house':'Electronic','club':'Electronic','dance':'Electronic',
  'deep-house':'Electronic','detroit-techno':'Electronic','drum-and-bass':'Electronic','dub':'Electronic',
  'dubstep':'Electronic','edm':'Electronic','electro':'Electronic','electronic':'Electronic',
  'hardstyle':'Electronic','house':'Electronic','idm':'Electronic','minimal-techno':'Electronic',
  'progressive-house':'Electronic','techno':'Electronic','trance':'Electronic','trip-hop':'Electronic',
  // Pop
  'pop':'Pop','pop-film':'Pop','indie-pop':'Pop','party':'Pop','happy':'Pop',
  'synth-pop':'Pop','disco':'Pop','romance':'Pop',
  // HipHop / R&B / Soul / Funk
  'hip-hop':'HipHop / R&B','r-n-b':'HipHop / R&B','soul':'HipHop / R&B','funk':'HipHop / R&B',
  'groove':'HipHop / R&B','gospel':'HipHop / R&B',
  // Latin
  'brazil':'Latin','forro':'Latin','latin':'Latin','latino':'Latin','mpb':'Latin','pagode':'Latin',
  'reggaeton':'Latin','salsa':'Latin','samba':'Latin','sertanejo':'Latin','spanish':'Latin','tango':'Latin',
  // Jazz / Blues
  'blues':'Jazz / Blues','jazz':'Jazz / Blues',
  // Classical / Instrumental
  'classical':'Classical','opera':'Classical','piano':'Classical','guitar':'Classical',
  // Folk / Country
  'acoustic':'Folk / Country','bluegrass':'Folk / Country','country':'Folk / Country','folk':'Folk / Country',
  'honky-tonk':'Folk / Country','singer-songwriter':'Folk / Country','songwriter':'Folk / Country',
  // World
  'afrobeat':'World','indian':'World','iranian':'World','turkish':'World','french':'World',
  'german':'World','swedish':'World','malay':'World','world-music':'World','reggae':'World','dancehall':'World',
  // Asian Pop
  'anime':'Asian Pop','cantopop':'Asian Pop','j-dance':'Asian Pop','j-idol':'Asian Pop',
  'j-pop':'Asian Pop','j-rock':'Asian Pop','k-pop':'Asian Pop','mandopop':'Asian Pop',
  // Chill / Mood
  'ambient':'Chill / Mood','chill':'Chill / Mood','sleep':'Chill / Mood','study':'Chill / Mood',
  'new-age':'Chill / Mood','sad':'Chill / Mood',
  // Other
  'comedy':'Other','children':'Other','kids':'Other','disney':'Other','show-tunes':'Other',
};

export function familyForGenre(genre) {
  return GENRE_FAMILY[genre] ?? 'Other';
}

export function colorForGenre(genre) {
  return FAMILY_COLORS[familyForGenre(genre)] ?? FAMILY_COLORS['Other'];
}

export function hexToRGB01(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

/** Legend entries: [{ family, color }] in palette order. */
export function getLegend() {
  return Object.entries(FAMILY_COLORS).map(([family, color]) => ({ family, color }));
}

// Kept for API compatibility (mapping is now deterministic, nothing to reset).
export function reset() {}
