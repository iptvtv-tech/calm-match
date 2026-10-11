/*
 * Calm Match — Sing Along song library
 *
 * Adding a song = one object below + one SVG in images/. No other changes.
 *
 * Song object:
 *   id       URL slug: player.html?song=<id>
 *   title    { en, ga }
 *   energy   "calm" | "lively"
 *   type     "lullaby" | "action" | "counting" | "trad"
 *   image    "file.svg" (both languages) or { en: "a.svg", ga: "b.svg" }
 *   alt      { en, ga } — describes the illustration for screen readers
 *   bpm      default tempo (the speed slider scales this)
 *   notes    [ [note, beats], ... ]  e.g. ["C4", 1] = crotchet, ["G4", 2] = minim,
 *            ["rest", 1] = silence
 *   lyrics   { en: [lines], ga: [lines] }
 *            One line per sung phrase. Split words into syllables with "|".
 *            Every syllable takes the next note, in order, so each language
 *            must have exactly as many syllables as there are notes
 *            (the player warns in the console if not). No timestamps needed:
 *            the highlight follows the music at any tempo.
 */
window.CALM_SONGS = [
  {
    id: 'twinkle-twinkle',
    title: { en: 'Twinkle Twinkle Little Star', ga: 'Bá Bá Caora Bhán' },
    energy: 'calm',
    type: 'lullaby',
    image: { en: 'twinkle.svg', ga: 'baa-baa.svg' },
    alt: {
      en: 'A smiling yellow star shining in the night sky above quiet hills',
      ga: 'Caora bhán ina codladh ar chnoc faoi na réaltaí'
    },
    bpm: 96,
    notes: [
      // Twin-kle twin-kle lit-tle star / Bá bá bá, a chao-ra bhán
      ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
      // How I won-der what you are / An bhfuil o-lann a-gat? Tá!
      ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
      // Up a-bove the world so high / Tá mo mhá-la ol-la lán
      ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
      // Like a dia-mond in the sky / Ceann don bhua-chaill beag sa ghleann
      ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
      // Twin-kle twin-kle lit-tle star / Bá bá bá, a chao-ra bhán
      ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
      // How I won-der what you are / Cod-ladh sámh a-nois go lá
      ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2]
    ],
    lyrics: {
      // Jane Taylor, 1806 — public domain
      en: [
        'Twin|kle, twin|kle, lit|tle star,',
        'How I won|der what you are!',
        'Up a|bove the world so high,',
        'Like a dia|mond in the sky.',
        'Twin|kle, twin|kle, lit|tle star,',
        'How I won|der what you are!'
      ],
      // Written for Calm Match (Oct 2026) to fit this melody — original, no third-party rights.
      //   Bá, bá, bá, little white sheep,
      //   Do you have wool? I do!
      //   My bag of wool is full,
      //   One for the little boy in the glen.
      //   Bá, bá, bá, little white sheep,
      //   Sleep soundly now until morning.
      ga: [
        'Bá, bá, bá, a chao|ra bhán,',
        'An bhfuil o|lann a|gat? Tá!',
        'Tá mo mhá|la ol|la lán,',
        'Ceann don bhua|chaill beag sa ghleann.',
        'Bá, bá, bá, a chao|ra bhán,',
        'Cod|ladh sámh a|nois go lá.'
      ]
    }
  }
];
