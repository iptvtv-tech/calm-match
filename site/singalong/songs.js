/*
 * Calm Match — Sing Along song library
 *
 * Adding a song = one object below + one SVG in images/. No other changes.
 * Every song starts from a public-domain English song; the Irish words are
 * written for Calm Match to fit the same melody, syllable for syllable.
 *
 * Song object:
 *   id       URL slug: player.html?song=<id>
 *   title    { en, ga }
 *   energy   "calm" | "lively"            (the picker's filter)
 *   type     "lullaby" | "action" | "counting" | "trad"
 *   image    "file.svg" (both languages) or { en: "a.svg", ga: "b.svg" }
 *   alt      { en, ga } — describes the illustration for screen readers
 *   bpm      default tempo in crotchets per minute (the speed slider scales it)
 *   source   where the words and tune come from, and why they're free to use
 *   notes    ONE verse: [ [note, beats], ... ]  e.g. ["C4", 1] = crotchet,
 *            ["G4", 2] = minim, ["E4", .5] = quaver, ["rest", 1] = silence
 *   lyrics   { en: [lines], ga: [lines] } — every verse, one string per line.
 *            Split words into syllables with "|". Each syllable takes the next
 *            note. "_" holds the previous word over one more note (shows nothing).
 *            Syllables must be a whole number of verses, the same in both
 *            languages (the player warns in the console if not), and the tune
 *            repeats once per verse. No timestamps: the highlight follows the
 *            music at any tempo.
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
    source: 'Words: Jane Taylor, 1806. Tune: French folk melody, 18th century. Public domain.',
    notes: [
      ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
      ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
      ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
      ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
      ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
      ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2]
    ],
    lyrics: {
      en: [
        'Twin|kle, twin|kle, lit|tle star,',
        'How I won|der what you are!',
        'Up a|bove the world so high,',
        'Like a dia|mond in the sky.',
        'Twin|kle, twin|kle, lit|tle star,',
        'How I won|der what you are!'
      ],
      // Little star, little star, up in the sky, / You shine quietly, gently. /
      // High above the great world, / Like a little jewel the colour of gold.
      ga: [
        'Réal|tín, réal|tín, thuas sa spéir,',
        'Lon|raíonn tú go ciúin, go séimh.',
        'Ard os cionn an domh|ain mhóir,',
        'Mar sheoid bheag ar dhath an óir.',
        'Réal|tín, réal|tín, thuas sa spéir,',
        'Lon|raíonn tú go ciúin, go séimh.'
      ]
    }
  },

  {
    id: 'baa-baa-black-sheep',
    title: { en: 'Baa, Baa, Black Sheep', ga: 'A Chaora Dhubh' },
    energy: 'calm',
    type: 'trad',
    image: 'baa-baa.svg',
    alt: {
      en: 'A black sheep in a green field beside three bags of wool',
      ga: 'Caora dhubh i bpáirc ghlas in aice le trí mhála olla'
    },
    bpm: 100,
    source: 'Words: traditional, first printed 1744. Tune: the Twinkle Twinkle melody. Public domain.',
    notes: [
      ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', .5], ['A4', .5], ['A4', .5], ['A4', .5], ['G4', 2],
      ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
      ['G4', 1], ['G4', .5], ['G4', .5], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', .5], ['E4', .5], ['D4', 2],
      ['G4', .5], ['G4', .5], ['G4', .5], ['G4', .5], ['F4', .5], ['F4', .5], ['F4', 1],
      ['E4', .5], ['E4', .5], ['E4', .5], ['E4', .5], ['D4', 2],
      ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', .5], ['A4', .5], ['A4', .5], ['A4', .5], ['G4', 2],
      ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2]
    ],
    lyrics: {
      en: [
        'Baa, baa, black sheep, have you a|ny wool?',
        'Yes, sir, yes, sir, three bags full!',
        'One for the mas|ter, one for the dame,',
        'and one for the lit|tle boy who lives down the lane.',
        'Baa, baa, black sheep, have you a|ny wool?',
        'Yes, sir, yes, sir, three bags full!'
      ],
      // Black sheep, have you wool on you? / Yes, yes, my bag is full! /
      // One for Daddy and one for Mammy, / and one for the little boy who lives in the glen.
      ga: [
        'A chao|ra dhubh, an bhfuil o|lann ort?',
        'Tá, tá, tá mo mhá|la lán!',
        'Ceann do Dhai|dí is ceann do Mham|aí,',
        'is ceann don bhuach|aill beag a chón|aí|onn sa ghleann.',
        'A chao|ra dhubh, an bhfuil o|lann ort?',
        'Tá, tá, tá mo mhá|la lán!'
      ]
    }
  },

  {
    id: 'mary-had-a-little-lamb',
    title: { en: 'Mary Had a Little Lamb', ga: 'Máire agus an tUan' },
    energy: 'calm',
    type: 'trad',
    image: 'mary-lamb.svg',
    alt: {
      en: 'A little white lamb with a red bow among daisies',
      ga: 'Uan beag bán le ribín dearg i measc nóiníní'
    },
    bpm: 104,
    source: 'Words: Sarah Josepha Hale, 1830. Tune: traditional, arranged by Lowell Mason in the 1830s. Public domain.',
    notes: [
      ['E4', 1], ['D4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['E4', 1], ['E4', 2],
      ['D4', 1], ['D4', 1], ['D4', 2],
      ['E4', 1], ['G4', 1], ['G4', 2],
      ['E4', 1], ['D4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['E4', 1], ['E4', 1],
      ['E4', 1], ['D4', 1], ['D4', 1], ['E4', 1], ['D4', 1], ['C4', 4]
    ],
    lyrics: {
      en: [
        'Ma|ry had a lit|tle lamb,',
        'lit|tle lamb, lit|tle lamb,',
        'Ma|ry had a lit|tle lamb,',
        'its fleece was white as snow.',
        'Ev|ery|where that Ma|ry went,',
        'Ma|ry went, Ma|ry went,',
        'ev|ery|where that Ma|ry went',
        'the lamb was sure to go.'
      ],
      // Máire and a little white lamb, / little white lamb, little white lamb, /
      // Máire and a little white lamb, / its wool bright and white.
      // The lamb followed her down and up, ... everywhere she went.
      ga: [
        'Má|ire a|gus uan beag bán,',
        'uan beag bán, uan beag bán,',
        'Má|ire a|gus uan beag bán,',
        'a o|lann gheal is bán.',
        'Lean an t-uan í síos is suas,',
        'síos is suas, síos is suas,',
        'lean an t-uan í síos is suas',
        'gach áit a ndeach|aigh sí.'
      ]
    }
  },

  {
    id: 'row-row-row-your-boat',
    title: { en: 'Row, Row, Row Your Boat', ga: 'Seol do Bhád' },
    energy: 'calm',
    type: 'trad',
    image: 'row-boat.svg',
    alt: {
      en: 'A little wooden rowing boat on a calm river at sunset',
      ga: 'Bád beag adhmaid ar abhainn chiúin le luí na gréine'
    },
    bpm: 120,
    source: 'Words and tune: traditional, first printed 1852. Public domain.',
    notes: [
      ['C4', 1.5], ['C4', 1.5], ['C4', 1], ['D4', .5], ['E4', 1.5],
      ['E4', 1], ['D4', .5], ['E4', 1], ['F4', .5], ['G4', 3],
      ['C5', .5], ['C5', .5], ['C5', .5], ['G4', .5], ['G4', .5], ['G4', .5],
      ['E4', .5], ['E4', .5], ['E4', .5], ['C4', .5], ['C4', .5], ['C4', .5],
      ['G4', 1], ['F4', .5], ['E4', 1], ['D4', .5], ['C4', 3]
    ],
    lyrics: {
      en: [
        'Row, row, row your boat',
        'gent|ly down the stream.',
        'Mer|ri|ly, mer|ri|ly, mer|ri|ly, mer|ri|ly,',
        'life is but a dream.'
      ],
      // Sail, sail, sail your boat / gently down the stream. /
      // Joyful, joyful, joyful, joyful, / it's only a dream.
      ga: [
        'Seol, seol, seol do bhád',
        'go réidh síos an sruth.',
        'Lú|cháir|each, lú|cháir|each, lú|cháir|each, lú|cháir|each,',
        'níl ann ach ais|ling.'
      ]
    }
  },

  {
    id: 'are-you-sleeping',
    title: { en: 'Are You Sleeping?', ga: 'A Sheáin Bhig' },
    energy: 'calm',
    type: 'lullaby',
    image: 'are-you-sleeping.svg',
    alt: {
      en: 'A sleepy moon and a little bell ringing at sunrise',
      ga: 'Gealach chodlatach agus clog beag ag bualadh le héirí na gréine'
    },
    bpm: 100,
    source: 'Tune: Frère Jacques, French traditional, 18th century. English words: traditional. Public domain.',
    notes: [
      ['C4', 1], ['D4', 1], ['E4', 1], ['C4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['C4', 1],
      ['E4', 1], ['F4', 1], ['G4', 2], ['E4', 1], ['F4', 1], ['G4', 2],
      ['G4', .5], ['A4', .5], ['G4', .5], ['F4', .5], ['E4', 1], ['C4', 1],
      ['G4', .5], ['A4', .5], ['G4', .5], ['F4', .5], ['E4', 1], ['C4', 1],
      ['C4', 1], ['G3', 1], ['C4', 2], ['C4', 1], ['G3', 1], ['C4', 2]
    ],
    lyrics: {
      en: [
        'Are you sleep|ing, are you sleep|ing,',
        'Broth|er John, Broth|er John?',
        'Morn|ing bells are ring|ing, morn|ing bells are ring|ing,',
        'ding, dang, dong, ding, dang, dong.'
      ],
      // Still asleep? Still asleep? / Little Seán, little Seán? /
      // The morning bell is ringing, the morning bell is ringing, / ding, dang, dong.
      ga: [
        "Id' chod|ladh fós? Id' chod|ladh fós?",
        'A Sheáin bhig, a Sheáin bhig?',
        'Buail|eann clog na maid|ne, buail|eann clog na maid|ne,',
        'ding, dang, dong, ding, dang, dong.'
      ]
    }
  },

  {
    id: 'hot-cross-buns',
    title: { en: 'Hot Cross Buns', ga: 'Cístí Te' },
    energy: 'calm',
    type: 'counting',
    image: 'hot-cross-buns.svg',
    alt: {
      en: 'Three warm buns with crosses on a blue plate',
      ga: 'Trí chíste te le crosa orthu ar phláta gorm'
    },
    bpm: 96,
    source: 'Words and tune: English street cry, 18th century. Public domain.',
    notes: [
      ['E4', 1], ['D4', 1], ['C4', 2],
      ['E4', 1], ['D4', 1], ['C4', 2],
      ['C4', .5], ['C4', .5], ['C4', .5], ['C4', .5], ['D4', .5], ['D4', .5], ['D4', .5], ['D4', .5],
      ['E4', 1], ['D4', 1], ['C4', 2]
    ],
    lyrics: {
      en: [
        'Hot cross buns!',
        'Hot cross buns!',
        'One a pen|ny, two a pen|ny,',
        'hot cross buns!'
      ],
      // Hot cakes! Hot cakes! / One for Mammy, one for Daddy, / hot cakes!
      ga: [
        'Cís|tí te!',
        'Cís|tí te!',
        'Ceann do Mham|aí, ceann do Dhai|dí,',
        'cís|tí te!'
      ]
    }
  },

  {
    id: 'rain-rain-go-away',
    title: { en: 'Rain, Rain, Go Away', ga: 'Báisteach, Imigh Uainn' },
    energy: 'calm',
    type: 'trad',
    image: 'rain-rain.svg',
    alt: {
      en: 'A grey rain cloud over a yellow umbrella and puddles',
      ga: 'Scamall báistí liath agus scáth fearthainne buí faoi'
    },
    bpm: 96,
    source: 'Words: traditional, 17th century. Tune: traditional playground chant. Public domain.',
    notes: [
      ['G4', 1], ['E4', 1], ['G4', .5], ['G4', .5], ['E4', 1],
      ['G4', .5], ['G4', .5], ['E4', .5], ['E4', .5], ['G4', .5], ['G4', .5], ['E4', 1],
      ['G4', .5], ['G4', .5], ['A4', .5], ['A4', .5], ['G4', .5], ['G4', .5], ['E4', 1],
      ['G4', 1], ['E4', 1], ['A4', .5], ['G4', .5], ['E4', 2]
    ],
    lyrics: {
      en: [
        'Rain, rain, go a|way,',
        'come a|gain an|oth|er day;',
        'all the chil|dren want to play.',
        'Rain, rain, go a|way!'
      ],
      // Rain, go away from us, / come again on another day; /
      // the children would like to play. / Rain, go away from us!
      ga: [
        'Báis|teach, im|igh uainn,',
        'tar a|rís ar lá ei|le;',
        'ba mhaith leis na páis|tí spraoi.',
        'Báis|teach, im|igh uainn!'
      ]
    }
  },

  {
    id: 'happy-birthday',
    title: { en: 'Happy Birthday', ga: 'Lá Breithe Sona' },
    energy: 'lively',
    type: 'trad',
    image: 'happy-birthday.svg',
    alt: {
      en: 'A birthday cake with three candles and colourful bunting',
      ga: 'Cáca lá breithe le trí choinneal agus bratacha daite'
    },
    bpm: 92,
    source: 'Tune and words: Mildred and Patty Hill (Good Morning to All, 1893). Public domain in Ireland and the EU since 1 January 2017, 70 years after Patty Hill died.',
    notes: [
      ['G3', .75], ['G3', .25], ['A3', 1], ['G3', 1], ['C4', 1], ['B3', 2],
      ['G3', .75], ['G3', .25], ['A3', 1], ['G3', 1], ['D4', 1], ['C4', 2],
      ['G3', .75], ['G3', .25], ['G4', 1], ['E4', 1], ['C4', 1], ['B3', 1], ['A3', 2],
      ['F4', .75], ['F4', .25], ['E4', 1], ['C4', 1], ['D4', 1], ['C4', 2]
    ],
    lyrics: {
      en: [
        'Hap|py birth|day to you,',
        'hap|py birth|day to you,',
        'hap|py birth|day, dear friend, _',
        'hap|py birth|day to you!'
      ],
      // Happy birthday to you (x2), / happy birthday, darling, / happy birthday to you!
      ga: [
        'Lá brei|the so|na duit,',
        'lá brei|the so|na duit,',
        'lá brei|the so|na, a stór,',
        'lá brei|the so|na duit!'
      ]
    }
  },

  {
    id: 'london-bridge',
    title: { en: 'London Bridge Is Falling Down', ga: 'Droichead Mór' },
    energy: 'lively',
    type: 'action',
    image: 'london-bridge.svg',
    alt: {
      en: 'A stone bridge with arches over a blue river',
      ga: 'Droichead cloiche le háirsí thar abhainn ghorm'
    },
    bpm: 112,
    source: 'Words and tune: traditional, first printed 1744. Public domain.',
    notes: [
      ['G4', 1.5], ['A4', .5], ['G4', 1], ['F4', 1], ['E4', 1], ['F4', 1], ['G4', 2],
      ['D4', 1], ['E4', 1], ['F4', 2], ['E4', 1], ['F4', 1], ['G4', 2],
      ['G4', 1.5], ['A4', .5], ['G4', 1], ['F4', 1], ['E4', 1], ['F4', 1], ['G4', 2],
      ['D4', 2], ['G4', 2], ['E4', 1], ['C4', 3]
    ],
    lyrics: {
      en: [
        'Lon|don Bridge is fall|ing down,',
        'fall|ing down, fall|ing down,',
        'Lon|don Bridge is fall|ing down,',
        'my fair la|dy.',
        'Build it up with sticks and stones,',
        'sticks and stones, sticks and stones,',
        'build it up with sticks and stones,',
        'my fair la|dy.'
      ],
      // A big bridge falling down, / falling down, falling down, ... young girl.
      // Build it up with stone and wood, / stone and wood, stone and wood, ... young girl.
      ga: [
        'Droich|ead mór ag tit|im síos,',
        'tit|im síos, tit|im síos,',
        'droich|ead mór ag tit|im síos,',
        'a chail|ín óig.',
        'Tóg é suas le cloch is crann,',
        'cloch is crann, cloch is crann,',
        'tóg é suas le cloch is crann,',
        'a chail|ín óig.'
      ]
    }
  },

  {
    id: 'old-macdonald',
    title: { en: 'Old MacDonald Had a Farm', ga: 'Bhí Feirm ag Seán' },
    energy: 'lively',
    type: 'trad',
    image: 'old-macdonald.svg',
    alt: {
      en: 'A red barn with a cow, a pig and a hen in the farmyard',
      ga: 'Scioból dearg le bó, muc agus cearc sa chlós'
    },
    bpm: 116,
    source: 'Words and tune: traditional folk song, in its modern form by 1917. Public domain.',
    notes: [
      ['G4', 1], ['G4', 1], ['G4', 1], ['D4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
      ['B4', 1], ['B4', 1], ['A4', 1], ['A4', 1], ['G4', 3],
      ['D4', 1], ['G4', 1], ['G4', 1], ['G4', 1], ['D4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
      ['B4', 1], ['B4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
      ['D4', .5], ['D4', .5], ['G4', 1], ['G4', 1], ['G4', 1],
      ['D4', .5], ['D4', .5], ['G4', 1], ['G4', 1], ['G4', 1],
      ['G4', .5], ['G4', .5], ['G4', 1], ['G4', .5], ['G4', .5], ['G4', 1],
      ['G4', .5], ['G4', .5], ['G4', .5], ['G4', .5], ['G4', 1], ['G4', 1],
      ['G4', 1], ['G4', 1], ['G4', 1], ['D4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
      ['B4', 1], ['B4', 1], ['A4', 1], ['A4', 1], ['G4', 4]
    ],
    lyrics: {
      en: [
        'Old Mac|Don|ald had a farm,', 'E, I, E, I, O!',
        'And on that farm he had a cow,', 'E, I, E, I, O!',
        'With a moo moo here and a moo moo there,',
        'here a moo, there a moo, ev|ery|where a moo moo.',
        'Old Mac|Don|ald had a farm,', 'E, I, E, I, O!',

        'Old Mac|Don|ald had a farm,', 'E, I, E, I, O!',
        'And on that farm he had a pig,', 'E, I, E, I, O!',
        'With an oink oink here and an oink oink there,',
        'here an oink, there an oink, ev|ery|where an oink oink.',
        'Old Mac|Don|ald had a farm,', 'E, I, E, I, O!',

        'Old Mac|Don|ald had a farm,', 'E, I, E, I, O!',
        'And on that farm he had a hen,', 'E, I, E, I, O!',
        'With a cluck cluck here and a cluck cluck there,',
        'here a cluck, there a cluck, ev|ery|where a cluck cluck.',
        'Old Mac|Don|ald had a farm,', 'E, I, E, I, O!'
      ],
      // Seán had a farm long ago, / and on that farm there was a cow (a pig, a hen), /
      // with a moo moo here and a moo moo there, / here moo, there moo, and every place moo moo.
      ga: [
        'Bhí fei|rm ag Seán fa|dó,', 'Í, a, í, a, ó!',
        'is ar an bhfei|rm sin bhí bó,', 'Í, a, í, a, ó!',
        'le mú mú an|seo is mú mú an|siúd,',
        'an|seo mú, an|siúd mú, is gach aon áit mú mú.',
        'Bhí fei|rm ag Seán fa|dó,', 'Í, a, í, a, ó!',

        'Bhí fei|rm ag Seán fa|dó,', 'Í, a, í, a, ó!',
        'is ar an bhfei|rm sin bhí muc,', 'Í, a, í, a, ó!',
        'le hoinc oinc an|seo is oinc oinc an|siúd,',
        'an|seo oinc, an|siúd oinc, is gach aon áit oinc oinc.',
        'Bhí fei|rm ag Seán fa|dó,', 'Í, a, í, a, ó!',

        'Bhí fei|rm ag Seán fa|dó,', 'Í, a, í, a, ó!',
        'is ar an bhfei|rm sin bhí cearc,', 'Í, a, í, a, ó!',
        'le gog gog an|seo is gog gog an|siúd,',
        'an|seo gog, an|siúd gog, is gach aon áit gog gog.',
        'Bhí fei|rm ag Seán fa|dó,', 'Í, a, í, a, ó!'
      ]
    }
  },

  {
    id: 'this-old-man',
    title: { en: 'This Old Man', ga: 'An Seanfhear Beag' },
    energy: 'lively',
    type: 'counting',
    image: 'this-old-man.svg',
    alt: {
      en: 'A happy dog with a bone next to a little drum',
      ga: 'Madra sona le cnámh in aice le druma beag'
    },
    bpm: 112,
    source: 'Words and tune: English traditional counting song, printed by 1906. Public domain.',
    notes: [
      ['G4', 1], ['E4', 1], ['G4', 2], ['G4', 1], ['E4', 1], ['G4', 2],
      ['A4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1], ['E4', 1], ['F4', 2],
      ['E4', .5], ['F4', .5], ['G4', 1], ['C4', 1], ['C4', .5], ['C4', .5], ['C4', 1],
      ['C4', .5], ['D4', .5], ['E4', .5], ['F4', .5], ['G4', 1],
      ['G4', 1], ['D4', 1], ['D4', 1], ['F4', .5], ['E4', .5], ['D4', 1], ['C4', 3]
    ],
    lyrics: {
      en: [
        'This old man, he played one,', 'he played knick|knack on my thumb,',
        'with a knick|knack pad|dy|whack, give the dog a bone,', 'this old man came roll|ing home.',
        'This old man, he played two,', 'he played knick|knack on my shoe,',
        'with a knick|knack pad|dy|whack, give the dog a bone,', 'this old man came roll|ing home.',
        'This old man, he played three,', 'he played knick|knack on my knee,',
        'with a knick|knack pad|dy|whack, give the dog a bone,', 'this old man came roll|ing home.',
        'This old man, he played four,', 'he played knick|knack on my door,',
        'with a knick|knack pad|dy|whack, give the dog a bone,', 'this old man came roll|ing home.',
        'This old man, he played five,', 'he played knick|knack on my hive,',
        'with a knick|knack pad|dy|whack, give the dog a bone,', 'this old man came roll|ing home.'
      ],
      // Little old man, that's one, / he knocked a knock on my little thumb (shoe, knee, the door, a beehive), /
      // with a knick knock and a pat-a-pat, a bone for the white dog, / he ran home lively.
      ga: [
        'Sean|fhear beag, sin a haon,', "chnag sé cnag ar m'or|dóg bheag,",
        'le cnig cnag is pat|a|pat, cnámh don mhad|ra bán,', 'rith sé a|bhai|le go beo.',
        'Sean|fhear beag, sin a dó,', 'chnag sé cnag ar mo bhróg bheag,',
        'le cnig cnag is pat|a|pat, cnámh don mhad|ra bán,', 'rith sé a|bhai|le go beo.',
        'Sean|fhear beag, sin a trí,', 'chnag sé cnag ar mo ghlúin bheag,',
        'le cnig cnag is pat|a|pat, cnámh don mhad|ra bán,', 'rith sé a|bhai|le go beo.',
        'Sean|fhear beag, a ceath|air,', 'chnag sé cnag ar an do|ras,',
        'le cnig cnag is pat|a|pat, cnámh don mhad|ra bán,', 'rith sé a|bhai|le go beo.',
        'Sean|fhear beag, sin a cúig,', 'chnag sé cnag ar choir|ceog bheach,',
        'le cnig cnag is pat|a|pat, cnámh don mhad|ra bán,', 'rith sé a|bhai|le go beo.'
      ]
    }
  },

  {
    id: 'incy-wincy-spider',
    title: { en: 'Incy Wincy Spider', ga: 'An Damhán Alla' },
    energy: 'lively',
    type: 'action',
    image: 'incy-wincy.svg',
    alt: {
      en: 'A small friendly spider on a drainpipe with raindrops and a smiling sun',
      ga: 'Damhán alla beag cairdiúil ar phíobán, le braonta báistí agus grian gheal'
    },
    bpm: 108,
    source: 'Words and tune: traditional, printed by 1910. Public domain.',
    notes: [
      ['C4', 1], ['C4', .5], ['C4', 1], ['D4', .5], ['E4', 1], ['E4', .5],
      ['E4', 1], ['D4', .5], ['C4', 1], ['D4', .5], ['E4', 1], ['C4', 2],
      ['E4', 1.5], ['E4', 1], ['F4', .5], ['G4', 2],
      ['G4', 1], ['F4', .5], ['E4', 1], ['F4', .5], ['G4', 1], ['E4', 2],
      ['C4', 1.5], ['C4', 1], ['D4', .5], ['E4', 2],
      ['E4', 1], ['D4', .5], ['C4', 1], ['D4', .5], ['E4', 1], ['C4', 2],
      ['G3', .5], ['C4', 1], ['C4', .5], ['C4', 1], ['D4', .5], ['E4', 1], ['E4', .5],
      ['E4', 1], ['D4', .5], ['C4', 1], ['D4', .5], ['E4', 1], ['C4', 2]
    ],
    lyrics: {
      en: [
        'In|cy Win|cy spi|der climbed up the wa|ter spout.',
        'Down came the rain and washed poor In|cy out.',
        'Out came the sun and dried up all the rain,',
        'so In|cy Win|cy spi|der climbed up the spout a|gain.'
      ],
      // The spider climbed up the water pipe. / The rain fell, and down with the spider. /
      // The sun came and dried everything, / and the spider climbed up the pipe again.
      ga: [
        'Dhreap an damh|án al|la suas an píob|án uis|ce.',
        'Thit an bháis|teach is síos leis an damh|án.',
        'Tháin|ig an ghrian is thrio|maigh sí gach rud,',
        'is dhreap an damh|án al|la suas an píob|án a|rís.'
      ]
    }
  },

  {
    id: 'hickory-dickory-dock',
    title: { en: 'Hickory Dickory Dock', ga: 'Tic Toc, an Clog' },
    energy: 'lively',
    type: 'counting',
    image: 'hickory-dickory.svg',
    alt: {
      en: 'A tall wooden clock with a little grey mouse climbing up it',
      ga: 'Clog ard adhmaid agus luchóg bheag liath ag dreapadh suas air'
    },
    bpm: 120,
    source: "Words: traditional, first printed 1744. Tune: as printed in Walter Crane's The Baby's Opera (1877). Public domain.",
    notes: [
      ['E4', .5], ['F4', .5], ['G4', .5], ['G4', .5], ['A4', .5], ['B4', .5], ['C5', 2.5],
      ['E4', .5], ['E4', .5], ['F4', .5], ['G4', .5], ['G4', .5], ['A4', .5], ['B4', .5], ['C5', 2.5],
      ['G4', .5], ['C5', 1], ['C5', .5], ['B4', 1], ['B4', .5], ['A4', 1], ['A4', .5], ['G4', 1.5],
      ['G4', .5], ['A4', .5], ['G4', .5], ['F4', .5], ['E4', .5], ['D4', .5], ['C4', 3]
    ],
    lyrics: {
      en: [
        'Hick|o|ry, dick|o|ry, dock,',
        'the mouse _ ran up the _ clock.',
        'The clock struck one, the mouse ran down,',
        'hick|o|ry, dick|o|ry, dock.'
      ],
      // Tick tock, tick tock, tick tock, tock! / The little mouse ran up the clock, /
      // the clock struck one, and down she goes, / tick tock, tick tock, tick tock, tock!
      ga: [
        'Tic toc, tic toc, tic toc, toc!',
        'Rith an luch|óg bheag suas an clog,',
        'bhuail an clog a haon, is síos léi,',
        'tic toc, tic toc, tic toc, toc!'
      ]
    }
  },

  {
    id: 'jack-and-jill',
    title: { en: 'Jack and Jill', ga: 'Seán agus Síle' },
    energy: 'lively',
    type: 'trad',
    image: 'jack-and-jill.svg',
    alt: {
      en: 'A green hill with a well and a wooden bucket at the top',
      ga: 'Cnoc glas le tobar agus buicéad adhmaid ar a bharr'
    },
    bpm: 132,
    source: "Words: traditional, 18th century. Tune: as printed in Walter Crane's The Baby's Opera (1877). Public domain.",
    notes: [
      ['G4', 1], ['G4', .5], ['G4', 1], ['G4', .5], ['C5', 1], ['C5', .5], ['C5', 1], ['C5', .5],
      ['D5', 1], ['D5', .5], ['D5', 1], ['D5', .5], ['E5', 1.5], ['C5', 1.5],
      ['G4', 1], ['G4', .5], ['G4', 1], ['G4', .5], ['A4', 1], ['A4', .5], ['A4', 1], ['A4', .5],
      ['G4', 1], ['F4', .5], ['E4', 1], ['D4', .5], ['C4', 1.5], ['C4', 1.5]
    ],
    lyrics: {
      en: [
        'Jack and Jill went up the hill to fetch a pail of wa|ter;',
        'Jack fell down and broke his crown, and Jill came tum|bling af|ter.'
      ],
      // Seán and Síle up the hill, looking for a bucket of water; /
      // Seán fell down with a big bang, and Síle after him.
      ga: [
        'Seán is Sí|le suas an cnoc ag iarr|aidh buic|éad uis|ce;',
        'thit Seán síos le tor|ann mór, is Sí|le i|na dhiaidh sin.'
      ]
    }
  },

  {
    id: 'yankee-doodle',
    title: { en: 'Yankee Doodle', ga: 'Dúdlí Beag' },
    energy: 'lively',
    type: 'trad',
    image: 'yankee-doodle.svg',
    alt: {
      en: 'A small brown pony and a hat with a feather in it',
      ga: 'Capaillín donn agus hata le cleite ann'
    },
    bpm: 100,
    source: 'Words and tune: traditional, 1750s. Public domain.',
    notes: [
      ['C4', .5], ['C4', .5], ['D4', .5], ['E4', .5], ['C4', .5], ['E4', .5], ['D4', .5], ['G3', .5],
      ['C4', .5], ['C4', .5], ['D4', .5], ['E4', .5], ['C4', 1], ['B3', 1],
      ['C4', .5], ['C4', .5], ['D4', .5], ['E4', .5], ['F4', .5], ['E4', .5], ['D4', .5], ['C4', .5],
      ['B3', .5], ['G3', .5], ['A3', .5], ['B3', .5], ['C4', 1], ['C4', 1]
    ],
    lyrics: {
      en: [
        'Yan|kee Doo|dle went to town a-|rid|ing on a po|ny,',
        'stuck a feath|er in his cap and called it mac|a|ro|ni.'
      ],
      // Little Dúdlí on a white horse, going to the town, /
      // a nice feather in his big hat, and him playing music.
      ga: [
        'Dúd|lí Beag ar chap|all bán, ag dul go dtí an bail|e,',
        'clei|te deas i|na ha|ta mór, is é ag sei|nm ceoil.'
      ]
    }
  },

  {
    id: 'jingle-bells',
    title: { en: 'Jingle Bells', ga: 'Cloigín Beag' },
    energy: 'lively',
    type: 'trad',
    image: 'jingle-bells.svg',
    alt: {
      en: 'Two golden jingle bells tied with a red ribbon, with snowflakes',
      ga: 'Dhá chloigín órga ceangailte le ribín dearg, le calóga sneachta'
    },
    bpm: 120,
    source: 'Words and tune: James Lord Pierpont, 1857 (chorus). Public domain.',
    notes: [
      ['E4', 1], ['E4', 1], ['E4', 2], ['E4', 1], ['E4', 1], ['E4', 2],
      ['E4', 1], ['G4', 1], ['C4', 1.5], ['D4', .5], ['E4', 4],
      ['F4', 1], ['F4', 1], ['F4', 1.5], ['F4', .5], ['F4', 1], ['E4', 1], ['E4', 1], ['E4', .5], ['E4', .5],
      ['E4', 1], ['D4', 1], ['D4', 1], ['E4', 1], ['D4', 2], ['G4', 2],
      ['E4', 1], ['E4', 1], ['E4', 2], ['E4', 1], ['E4', 1], ['E4', 2],
      ['E4', 1], ['G4', 1], ['C4', 1.5], ['D4', .5], ['E4', 4],
      ['F4', 1], ['F4', 1], ['F4', 1.5], ['F4', .5], ['F4', 1], ['E4', 1], ['E4', 1], ['E4', .5], ['E4', .5],
      ['G4', 1], ['G4', 1], ['F4', 1], ['D4', 1], ['C4', 4]
    ],
    lyrics: {
      en: [
        'Jin|gle bells, jin|gle bells, jin|gle all the way!',
        'Oh, what fun it is to ride in a one-|horse o|pen sleigh, hey!',
        'Jin|gle bells, jin|gle bells, jin|gle all the way!',
        'Oh, what fun it is to ride in a one-|horse o|pen sleigh!'
      ],
      // Little bell, little bell, little bell on the road! /
      // Oh, isn't it great fun to be travelling in the sleigh, hey!
      ga: [
        'Cloig|ín beag, cloig|ín beag, cloig|ín ar an ród!',
        'Ó, nach deas an spórt é bheith ag tais|teal sa charr sleamh|náin, hé!',
        'Cloig|ín beag, cloig|ín beag, cloig|ín ar an ród!',
        'Ó, nach deas an spórt é bheith ag tais|teal sa charr sleamh|náin!'
      ]
    }
  }
];
