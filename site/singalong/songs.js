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
    title: { en: 'Twinkle Twinkle Little Star', ga: 'Réaltín, Réaltín' },
    energy: 'calm',
    type: 'lullaby',
    image: 'twinkle.svg',
    alt: {
      en: 'A smiling yellow star shining in the night sky above quiet hills',
      ga: 'Réaltín buí ag soilsiú sa spéir os cionn na gcnoc'
    },
    bpm: 96,
    notes: [
      // Twin-kle twin-kle lit-tle star / Réal-tín réal-tín thuas sa spéir
      ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
      // How I won-der what you are / Lon-raíonn tú go ciúin, go séimh
      ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
      // Up a-bove the world so high / Ard os cionn an domh-ain mhóir
      ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
      // Like a dia-mond in the sky / Mar sheoid bheag ar dhath an óir
      ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
      // Twin-kle twin-kle lit-tle star / Réal-tín réal-tín thuas sa spéir
      ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
      // How I won-der what you are / Lon-raíonn tú go ciúin, go séimh
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
      // Irish words for Twinkle, written for Calm Match (Oct 2026) — original, no third-party rights.
      //   Little star, little star, up in the sky,
      //   You shine quietly, gently.
      //   High above the great world,
      //   Like a little jewel the colour of gold.
      //   Little star, little star, up in the sky,
      //   You shine quietly, gently.
      ga: [
        'Réal|tín, réal|tín, thuas sa spéir,',
        'Lon|raíonn tú go ciúin, go séimh.',
        'Ard os cionn an domh|ain mhóir,',
        'Mar sheoid bheag ar dhath an óir.',
        'Réal|tín, réal|tín, thuas sa spéir,',
        'Lon|raíonn tú go ciúin, go séimh.'
      ]
    }
  }
];
