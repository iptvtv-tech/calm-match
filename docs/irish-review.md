# Calm Match — Irish (Gaeilge) review sheet

_Made 2026-10-26 by `node tools/irish-review.js`. Everything Irish on the site, beside its English._

**For the checker.** Calm Match is a free site of calm learning games for neurodivergent children (about 3 to 9), used by a child with a parent or teacher. The Irish was written by the site's maker, who is not a fluent speaker, and is read aloud to children, so natural, simple, spoken Irish matters more than literal translation. Short is good: these show on buttons and cards. Please write a correction in the last column, or just mark ✓. Where a word sits in a gap like `{name}` or `{n}`, the site fills it in (a picture name, a number), so please say if the words around the gap need to change with it (for example a number before a noun). If something should simply not be said in Irish the way it is in English, say so.

**Dialect.** One consistent dialect across the site, your own. Please tell us which, so it can be credited and so the voice recordings (later) match.


## 1. Phrases the games say and show (site/js/i18n.js)

Spoken aloud to the child and shown on the screen. `{name}` = a picture or word, `{game}`/`{next}` = a game name, `{n}`/`{m}`/`{s}` = a number, `{l}` = a letter, `{x}`/`{reward}` = a Talk board word or activity, `{list}` = game names joined by "then", `{does}` = a game's one-line description.

| English | Irish | OK? / correction |
|---|---|---|
| Today, {name} | Inniu, {name} |  |
| {n} games, then all done | Cluichí inniu: {n} |  |
| You can tap Break any time. | Is féidir leat Sos a bhrú am ar bith. |  |
| First {list}. Then we're all done. | Inniu: {list}. Ansin, críochnaithe. |  |
| then | ansin |  |
| All done | Críochnaithe |  |
| Now | Anois |  |
| Go | Ar aghaidh |  |
| Start | Tosaigh |  |
| Next is {game}. {does} | Anois: {game}. {does} |  |
| Next | Ar aghaidh |  |
| Finish | Críochnaigh |  |
| Find the same one | Aimsigh an ceann céanna |  |
| Find this | Aimsigh é seo |  |
| Find the {name} | Aimsigh: {name} |  |
| Big or small? | Mór nó beag? |  |
| Which group? | Cén grúpa? |  |
| Put it with the same one | Cuir leis an gceann céanna é |  |
| Where does it go? | Cá dtéann sé? |  |
| Big | Mór |  |
| Small | Beag |  |
| Is this {name} big or small? | Mór nó beag? |  |
| Which group does the {name} go in? | Cén grúpa? {name} |  |
| Put the {name} with the same picture | Cuir leis an gceann céanna é: {name} |  |
| What comes next? | Cad a thagann ina dhiaidh? |  |
| What comes next? | Cad a thagann ina dhiaidh? |  |
| How many? | Cé mhéad? |  |
| Count the {name} pictures. How many? | Comhair na pictiúir. Cé mhéad? |  |
| Find the pairs | Aimsigh na péirí |  |
| Find the pairs. Tap a card, then another card. | Aimsigh na péirí. Brúigh cárta, ansin cárta eile. |  |
| Tap a card, then tap another. | Brúigh cárta, ansin cárta eile. |  |
| Look carefully. The cards will turn over. | Féach go cúramach. Iompóidh na cártaí. |  |
| A pair! Two {name} cards. | Péire! {name}. |  |
| Not the same. They will turn back over. | Ní hionann iad. Iompóidh siad ar ais. |  |
| All pairs found! | Fuair tú na péirí ar fad! |  |
| Card {n}, face down | Cárta {n}, bunoscionn |  |
| Find the same face | Aimsigh an aghaidh chéanna |  |
| Find another face that feels the same | Aimsigh aghaidh eile leis an mothúchán céanna |  |
| Same feeling | An mothúchán céanna |  |
| Not that one. Look again. | Ní hé sin é. Féach arís. |  |
| Look again | Féach arís |  |
| Look for the dashed outline. | Féach ar an gceann leis an imlíne. |  |
| Tap the one with the bright outline. | Brúigh an ceann leis an imlíne gheal. |  |
| Say it again | Abair arís é |  |
| Brilliant! {name}! | Iontach! {name}! |  |
| Yes! {name}. | Maith thú! {name}. |  |
| Yes! That's the {name}. | Maith thú! {name}. |  |
| That's right. {name}. | Sin é. {name}. |  |
| Brilliant! | Iontach! |  |
| Yes! | Maith thú! |  |
| That's right. | Sin é. |  |
| {game} finished | {game}: críochnaithe |  |
| You earned a sticker | Fuair tú greamán |  |
| Finished | Críochnaithe |  |
| Next: {game}. | Ar aghaidh: {game}. |  |
| That was the last game. | B'shin an cluiche deireanach. |  |
| Something new is open: {skill} | Rud nua le triail! |  |
| This is the last one. Then {next}. | Seo an ceann deireanach. Ansin: {next}. |  |
| {n} more, then {next}. | {n} eile, ansin: {next}. |  |
| Finished. Next: {next}. | Críochnaithe. Ar aghaidh: {next}. |  |
| all done | críochnaithe |  |
| Great work, {name} | Obair iontach, {name} |  |
| All done, {name} | Críochnaithe, {name} |  |
| You played {n} games. Your sticker book has {s} stickers. | Cluichí a d'imir tú: {n}. Greamáin i do leabhar: {s}. |  |
| You played {n} games. | Cluichí a d'imir tú: {n}. |  |
| Play again | Imir arís |  |
| Stop for now | Stop anois |  |
| See you next time | Feicfidh mé arís thú |  |
| Come back whenever you are ready. | Fill nuair a bheidh tú réidh. |  |
| Back to start | Ar ais go dtí an tús |  |
| Break | Sos |  |
| Breathe in. Breathe out. | Anáil isteach. Anáil amach. |  |
| Take as long as you need. Your game will wait. | Tóg do chuid ama. Fanfaidh do chluiche leat. |  |
| I'm ready | Táim réidh |  |
| First | Ar dtús |  |
| Then | Ansin |  |
| Done | Déanta |  |
| Time is up | Tá an t-am istigh |  |
| OK | Ceart go leor |  |
| {n} min | {n} nóim. |  |
| Less than a minute | Níos lú ná nóiméad |  |
| All done. Great work. | Críochnaithe. Obair iontach. |  |
| All done. | Críochnaithe. |  |
| My day | Mo lá |  |
| Done | Déanta |  |
| All done for now | Críochnaithe go fóill |  |
| Whose shadow is this? | Cé leis an scáth seo? |  |
| Find the shadow | Aimsigh an scáth |  |
| This shadow | An scáth seo |  |
| A shadow | Scáth |  |
| Shadow of {n} | Scáth: {n} |  |
| Find the shadow of the {name} | Aimsigh an scáth: {name} |  |
| Which one is different? | Cé acu atá difriúil? |  |
| Which one is different? | Cé acu atá difriúil? |  |
| What goes with the {name}? | Cad a théann leis seo: {name}? |  |
| What goes with this? | Cad a théann leis seo? |  |
| Which has more? | Cé acu a bhfuil níos mó ann? |  |
| {n} pictures | Pictiúir: {n} |  |
| Find {n} | Aimsigh {n} |  |
| Size {n} | Méid {n} |  |
| Small to big | Ó bheag go mór |  |
| Tap the smallest first, then the next, up to the biggest. | Brúigh an ceann is lú ar dtús, ansin an chéad cheann eile, suas go dtí an ceann is mó. |  |
| Smallest | Is lú |  |
| Biggest | Is mó |  |
| What's missing? | Cad atá in easnamh? |  |
| Look and remember | Féach agus cuimhnigh |  |
| Which piece finishes the picture? | Cén píosa a chríochnaíonn an pictiúr? |  |
| Piece of {n} | Píosa: {n} |  |
| Trace the letter {l} | Rianaigh an litir {l} |  |
| Which letter does it start with? | Cén litir atá ar dtús? |  |
| Which letter does {name} start with? | Cén litir atá ar dtús? {name} |  |
| Find the small letter | Aimsigh an litir bheag |  |
| Tap the pictures in order. | Brúigh na pictiúir in ord. |  |
| Last | Ar deireadh |  |
| How do they feel? | Conas a mhothaíonn siad? |  |
| Not that one yet. Look again. | Ní hé sin fós. Féach arís. |  |
| Start again | Tosaigh arís |  |
| Use your finger to go over the letter. | Lean an litir le do mhéar. |  |
| Working for | Ag obair i gcomhair |  |
| {n} more, then {reward} | {n} eile, ansin: {reward} |  |
| You did it! | Rinne tú é! |  |
| Time for: {reward} | Am do: {reward} |  |
| My stickers | Mo ghreamáin |  |
| No stickers yet. You get one for each game you finish. | Níl greamán ar bith fós. Faigheann tú ceann i ndiaidh gach cluiche. |  |
| What kind of break? | Cén sórt sosa? |  |
| Breathing | Análú |  |
| Bubbles | Boilgeoga |  |
| Music | Ceol |  |
| Quiet | Ciúnas |  |
| 1 minute, then back to the game. | Nóiméad amháin, ansin ar ais go dtí an cluiche. |  |
| Break time is over. Ready? | Tá an sos thart. An bhfuil tú réidh? |  |
| Time for a break | Am sosa |  |
| Pop the bubbles | Pléasc na boilgeoga |  |
| Breathe in. The balloon gets bigger. | Anáil isteach. Éiríonn an balún níos mó. |  |
| Breathe out. The balloon gets smaller. | Anáil amach. Éiríonn an balún níos lú. |  |
| Quiet time. Rest your eyes. | Am ciúin. Lig do scíth. |  |
| Calm corner | Cúinne ciúin |  |
| Balloon breathing | Análú balúin |  |
| Breathe in | Anáil isteach |  |
| Breathe out | Anáil amach |  |
| Choose an answer | Roghnaigh freagra |  |
| Cards | Cártaí |  |
| Show me how | Taispeáin dom |  |
| Read our story | Léigh ár scéal |  |
| Pause | Cuir ar sos |  |
| Carry on | Lean ar aghaidh |  |
| Close timer | Dún an t-amadóir |  |
| Close board | Dún an clár |  |
| Back a step | Céim siar |  |
| Close schedule | Dún an sceideal |  |
| A grown-up can add choices here. | Is féidir le duine fásta roghanna a chur anseo. |  |
| My choices | Mo roghanna |  |
| Food | Bia |  |
| Drinks | Deochanna |  |
| Play | Spraoi |  |
| Places | Áiteanna |  |
| Calm | Suaimhneas |  |
| Core | Croífhocail |  |
| Chat | Comhrá |  |
| Feelings | Mothúcháin |  |
| Body | Corp |  |
| Describe | Cur síos |  |
| People | Daoine |  |
| Delete the last word | Scrios an focal deireanach |  |
| Back | Siar |  |
| A grown-up can add words here. | Is féidir le duine fásta focail a chur anseo. |  |
| 1 minute left | Nóiméad amháin fágtha |  |
| {n} minutes left | {n} nóiméad fágtha |  |
| Change | Athrú |  |
| Change: {new} instead of {old} | Athrú: {new} in áit {old} |  |
| Talk | Labhair |  |
| I want | Ba mhaith liom |  |
| I want {x} | Ba mhaith liom {x} |  |
| Words | Focail |  |
| My words | Mo chuid focal |  |
| Clear | Glan |  |
| Say it | Abair é |  |
| Close | Dún |  |
| The end | Críoch |  |
| Back | Siar |  |
| Step {n} of {m} | Céim {n} as {m} |  |
| Who is playing? | Cé atá ag imirt? |  |
| My stories | Mo scéalta |  |
| Pick a story | Roghnaigh scéal |  |
| How to | Conas |  |
| All the steps | Na céimeanna ar fad |  |
| {a} and {b} go together | Téann {a} agus {b} le chéile |  |
| Sing along | Amhráin |  |
| Alphabet | Aibítir |  |
| Home | Abhaile |  |
| More to do | Tuilleadh le déanamh |  |


## 2. Games: names and what they do (site/js/engine.js `CM.GAMES`)

| English | Irish | OK? / correction |
|---|---|---|
| Match — Find the picture that's the same. | Meaitseáil — Aimsigh an pictiúr atá mar an gcéanna. |  |
| Pairs — Turn over two cards. Find the ones that are the same. | Péirí — Iompaigh dhá chárta. Aimsigh na cinn atá mar an gcéanna. |  |
| Shadows — Find the picture that makes this shadow. | Scáthanna — Aimsigh an pictiúr a dhéanann an scáth seo. |  |
| What's missing? — Look at the pictures. One goes away. Which one? | Cad atá in easnamh? — Féach ar na pictiúir. Imíonn ceann amháin. Cé acu? |  |
| Puzzle — Find the piece that finishes the picture. | Mír mhearaí — Aimsigh an píosa a chríochnaíonn an pictiúr. |  |
| Find it — Listen to the word. Find that picture. | Aimsigh é — Éist leis an bhfocal. Aimsigh an pictiúr sin. |  |
| Sort — Put each picture in the right basket. | Sórtáil — Cuir gach pictiúr sa chiseán ceart. |  |
| Odd one out — Find the one that is different. | An ceann corr — Aimsigh an ceann atá difriúil. |  |
| Goes together — Find what goes with this picture. | Le chéile — Aimsigh cad a théann leis an bpictiúr seo. |  |
| Count — Count the pictures. Tap the number. | Comhair — Comhair na pictiúir. Brúigh an uimhir. |  |
| Numbers — Match numbers and groups. Find which has more. | Uimhreacha — Meaitseáil uimhreacha agus grúpaí. Aimsigh cé acu is mó. |  |
| Shapes and sizes — Find the shape. Put pictures from small to big. | Cruthanna agus méideanna — Aimsigh an cruth. Cuir na pictiúir ó bheag go mór. |  |
| Letters — Match letters, find first sounds and trace letters. | Litreacha — Meaitseáil litreacha, aimsigh an chéad fhuaim agus rianaigh litreacha. |  |
| Patterns — Look at the line of pictures. Find what comes next. | Patrúin — Féach ar líne na bpictiúr. Aimsigh cad a thagann ina dhiaidh. |  |
| Steps in order — Tap the pictures in order: first, next, last. | Céimeanna in ord — Brúigh na pictiúir in ord: ar dtús, ansin, ar deireadh. |  |
| Feelings — Look at the faces. Find the feeling. | Mothúcháin — Féach ar na haghaidheanna. Aimsigh an mothúchán. |  |


## 3. Picture names by theme (site/js/engine.js `CM.THEMES`)

Said on their own ("traein") and inside sentences ("Aimsigh an traein"). If a name needs an article or a mutation inside the sentences in section 1, please say which.

**Vehicles / Feithiclí**

| English | Irish | OK? / correction |
|---|---|---|
| 🚂 train | traein |  |
| 🚌 bus | bus |  |
| 🚗 car | carr |  |
| 🚲 bike | rothar |  |
| 🚁 helicopter | héileacaptar |  |
| 🚜 tractor | tarracóir |  |
| ⛵ boat | bád |  |
| 🚒 fire engine | inneall dóiteáin |  |

**Animals / Ainmhithe**

| English | Irish | OK? / correction |
|---|---|---|
| 🐶 dog | madra |  |
| 🐱 cat | cat |  |
| 🐰 rabbit | coinín |  |
| 🐸 frog | frog |  |
| 🐢 turtle | turtar |  |
| 🐘 elephant | eilifint |  |
| 🦁 lion | leon |  |
| 🐧 penguin | piongain |  |

**Space / Spás**

| English | Irish | OK? / correction |
|---|---|---|
| 🚀 rocket | roicéad |  |
| 🌙 moon | gealach |  |
| ⭐ star | réalta |  |
| 🪐 planet | pláinéad |  |
| ☀️ sun | grian |  |
| 🛸 spaceship | spásárthach |  |
| 🌍 Earth | an Domhan |  |
| 👩‍🚀 astronaut | spásaire |  |

**Dinosaurs / Díneasáir**

| English | Irish | OK? / correction |
|---|---|---|
| 🦕 long-neck dinosaur | díneasár |  |
| 🦖 T-rex | T-rex |  |
| 🥚 egg | ubh |  |
| 🌋 volcano | bolcán |  |
| 🌴 palm tree | crann pailme |  |
| 🦴 bone | cnámh |  |
| 🐊 crocodile | crogall |  |
| 🦎 lizard | laghairt |  |

**Colours / Dathanna**

| English | Irish | OK? / correction |
|---|---|---|
| 🔴 red | dearg |  |
| 🟢 green | glas |  |
| 🔵 blue | gorm |  |
| 🟡 yellow | buí |  |
| 🟣 purple | corcra |  |
| 🟠 orange | oráiste |  |
| ⚫ black | dubh |  |
| 🟤 brown | donn |  |

**Farm / Feirm**

| English | Irish | OK? / correction |
|---|---|---|
| 🐄 cow | bó |  |
| 🐖 pig | muc |  |
| 🐑 sheep | caora |  |
| 🐴 horse | capall |  |
| 🐔 hen | cearc |  |
| 🦆 duck | lacha |  |
| 🐐 goat | gabhar |  |
| 🌻 sunflower | lus na gréine |  |

**Sea / Farraige**

| English | Irish | OK? / correction |
|---|---|---|
| 🐟 fish | iasc |  |
| 🐙 octopus | ochtapas |  |
| 🦀 crab | portán |  |
| 🐳 whale | míol mór |  |
| 🐬 dolphin | deilf |  |
| 🦈 shark | siorc |  |
| 🦑 squid | scuid |  |
| 🐚 shell | sliogán |  |

**Music / Ceol**

| English | Irish | OK? / correction |
|---|---|---|
| 🥁 drum | druma |  |
| 🎸 guitar | giotár |  |
| 🎹 piano | pianó |  |
| 🎺 trumpet | trumpa |  |
| 🎻 violin | veidhlín |  |
| 🎷 saxophone | sacsafón |  |
| 🔔 bell | clog |  |
| 🎤 microphone | micreafón |  |

**Food / Bia**

| English | Irish | OK? / correction |
|---|---|---|
| 🍎 apple | úll |  |
| 🍌 banana | banana |  |
| 🍞 bread | arán |  |
| 🧀 cheese | cáis |  |
| 🥕 carrot | cairéad |  |
| 🍕 pizza | píotsa |  |
| 🍓 strawberry | sú talún |  |
| 🥛 milk | bainne |  |

**Clothes / Éadaí**

| English | Irish | OK? / correction |
|---|---|---|
| 👕 T-shirt | T-léine |  |
| 👖 trousers | bríste |  |
| 🧦 socks | stocaí |  |
| 👟 shoes | bróga |  |
| 🧥 coat | cóta |  |
| 🧢 cap | caipín |  |
| 🧤 gloves | lámhainní |  |
| 👗 dress | gúna |  |

**Home / Baile**

| English | Irish | OK? / correction |
|---|---|---|
| 🛏️ bed | leaba |  |
| 🪑 chair | cathaoir |  |
| 🚪 door | doras |  |
| 🛁 bath | folcadán |  |
| 🚽 toilet | leithreas |  |
| 📺 TV | teilifís |  |
| 🛋️ sofa | tolg |  |
| 💡 light | solas |  |

**Toys / Bréagáin**

| English | Irish | OK? / correction |
|---|---|---|
| 🧸 teddy | teidí |  |
| ⚽ ball | liathróid |  |
| 🪁 kite | eitleog |  |
| 🧩 jigsaw | míreanna mearaí |  |
| 🎈 balloon | balún |  |
| 🎲 dice | dísle |  |
| 🪀 yo-yo | yó-yó |  |
| 🛹 skateboard | clár scátála |  |

**Body / Corp**

| English | Irish | OK? / correction |
|---|---|---|
| 👁️ eye | súil |  |
| 👂 ear | cluas |  |
| 👃 nose | srón |  |
| 👄 mouth | béal |  |
| ✋ hand | lámh |  |
| 🦶 foot | troigh |  |
| 🦷 tooth | fiacail |  |
| 💪 arm | géag |  |

**Weather / Aimsir**

| English | Irish | OK? / correction |
|---|---|---|
| 🌧️ rain | báisteach |  |
| ☀️ sun | grian |  |
| ❄️ snow | sneachta |  |
| 🌈 rainbow | tuar ceatha |  |
| ☁️ cloud | scamall |  |
| ⚡ lightning | tintreach |  |
| 🌬️ wind | gaoth |  |
| ☂️ umbrella | scáth fearthainne |  |

**School / Scoil**

| English | Irish | OK? / correction |
|---|---|---|
| ✏️ pencil | peann luaidhe |  |
| 📚 books | leabhair |  |
| 🎒 school bag | mála scoile |  |
| ✂️ scissors | siosúr |  |
| 📏 ruler | rialóir |  |
| 🖍️ crayon | crián |  |
| 🧮 abacus | fráma comhairimh |  |
| 🏫 school | scoil |  |

**Shapes / Cruthanna**

| English | Irish | OK? / correction |
|---|---|---|
| 🔴 circle | ciorcal |  |
| 🟦 square | cearnóg |  |
| 🔺 triangle | triantán |  |
| ⭐ star | réalta |  |
| ❤️ heart | croí |  |
| 🔶 diamond | muileata |  |
| 🌙 crescent | corrán |  |
| ➕ cross | cros |  |


## 4. Feelings, "Why?" scenes and "Where?" words (site/js/engine.js, site/js/games.js)

| English | Irish | OK? / correction |
|---|---|---|
| happy — Which face is happy? | sásta — Cén aghaidh atá sásta? |  |
| sad — Which face is sad? | brónach — Cén aghaidh atá brónach? |  |
| angry — Which face is angry? | crosta — Cén aghaidh atá crosta? |  |
| scared — Which face is scared? | scanraithe — Cén aghaidh atá scanraithe? |  |
| surprised — Which face is surprised? | ionadh — Cén aghaidh a bhfuil ionadh uirthi? |  |
| sleepy — Which face is sleepy? | tuirseach — Cén aghaidh atá tuirseach? |  |
| calm — Which face is calm? | socair — Cén aghaidh atá socair? |  |
| silly — Which face is silly? | seafóideach — Cén aghaidh atá seafóideach? |  |
| worried — Which face is worried? | buartha — Cén aghaidh atá buartha? |  |
| loving — Which face is loving? | grámhar — Cén aghaidh atá grámhar? |  |

Goes together pairs:

| English | Irish | OK? / correction |
|---|---|---|
| socks + shoes | stocaí + bróga |  |
| bread + butter | arán + im |  |
| key + door | eochair + doras |  |
| umbrella + rain | scáth fearthainne + báisteach |  |
| bowl + spoon | babhla + spúnóg |  |
| pencil + paper | peann luaidhe + páipéar |  |
| bee + flower | beach + bláth |  |
| dog + bone | madra + cnámh |  |
| hen + egg | cearc + ubh |  |
| ball + goal | liathróid + cúl |  |
| gloves + snow | lámhainní + sneachta |  |
| biscuit + milk | briosca + bainne |  |
| rabbit + carrot | coinín + cairéad |  |
| monkey + banana | moncaí + banana |  |
| paintbrush + paints | scuab phéinte + péinteanna |  |
| teddy + bed | teidí + leaba |  |

How do they feel? scenes:

| English | Irish | OK? / correction |
|---|---|---|
| 🍦⬇️ The ice cream fell on the ground. | Thit an t-uachtar reoite ar an talamh. |  |
| 🎁 It's a present for you! | Seo bronntanas duit! |  |
| ⛈️🌙 A loud storm in the night. | Stoirm ard san oíche. |  |
| 🧱💥 Someone knocked over the tower. | Leag duine éigin an túr. |  |
| 🛏️🌙 It's very late. Time for bed. | Tá sé an-déanach. Am luí. |  |
| 🎉 Surprise! A party! | Ionadh! Cóisir! |  |
| 🎈💨 The balloon flew away. | D'imigh an balún. |  |
| 🐕🔊 A big dog is barking. | Tá madra mór ag tafann. |  |
| 🏖️☀️ A day at the beach. | Lá ag an trá. |  |
| 🧩❌ The puzzle piece won't fit. | Ní théann an píosa isteach. |  |

Where is it? (word, then the sentence said):

| English | Irish | OK? / correction |
|---|---|---|
| in — Find the ball in the box | sa bhosca — Aimsigh an liathróid sa bhosca |  |
| on — Find the ball on the box | ar an mbosca — Aimsigh an liathróid ar an mbosca |  |
| under — Find the ball under the box | faoin mbosca — Aimsigh an liathróid faoin mbosca |  |
| next to — Find the ball next to the box | in aice leis an mbosca — Aimsigh an liathróid in aice leis an mbosca |  |


## 5. Steps in order: routines and their steps (site/js/engine.js `CM.SEQUENCES`)

**Washing hands / Lámha a ní**

| English | Irish | OK? / correction |
|---|---|---|
| 🚰 turn on the tap | cas air an sconna |  |
| 🧼 soap | gallúnach |  |
| 🙌 rub your hands | cuimil do lámha |  |
| 🧻 dry your hands | triomaigh do lámha |  |

**Egg to hen / Ó ubh go cearc**

| English | Irish | OK? / correction |
|---|---|---|
| 🥚 egg | ubh |  |
| 🐣 hatching | ag teacht amach |  |
| 🐥 chick | sicín |  |
| 🐔 hen | cearc |  |

**A seed grows / Fásann síol**

| English | Irish | OK? / correction |
|---|---|---|
| 🌰 seed | síol |  |
| 🌱 shoot | péacán |  |
| 🌿 plant | planda |  |
| 🌻 flower | bláth |  |

**My day / Mo lá**

| English | Irish | OK? / correction |
|---|---|---|
| 🌅 morning | maidin |  |
| ☀️ daytime | lá |  |
| 🌇 evening | tráthnóna |  |
| 🌙 night | oíche |  |

**Snowman / Fear sneachta**

| English | Irish | OK? / correction |
|---|---|---|
| ❄️ snow falls | titeann sneachta |  |
| ⛄ make a snowman | déan fear sneachta |  |
| ☀️ the sun comes out | tagann an ghrian amach |  |
| 💧 it melts | leánn sé |  |

**Brushing teeth / Fiacla a scuabadh**

| English | Irish | OK? / correction |
|---|---|---|
| 🧴 toothpaste on the brush | taos fiacla ar an scuab |  |
| 😁 brush your teeth | scuab do chuid fiacla |  |
| 🚰 rinse | sruthlaigh |  |

**Making a sandwich / Ceapaire a dhéanamh**

| English | Irish | OK? / correction |
|---|---|---|
| 🍞 bread | arán |  |
| 🧈 butter | im |  |
| 🥪 sandwich | ceapaire |  |

**Caterpillar / Bolb**

| English | Irish | OK? / correction |
|---|---|---|
| 🥚 egg | ubh |  |
| 🐛 caterpillar | bolb |  |
| 🦋 butterfly | féileacán |  |


## 6. Alphabet book (site/js/alphabet.js, site/alphabet/book.js, site/js/speech.js)

Irish has 18 letters here: A B C D E F G H I L M N O P R S T U. Each card shows a picture and its word; tapping it says the letter, a pause, then the word ("B … bó"). Words were chosen for their first **sound**. Please check each word is natural, correctly spelled with its fadas, and starts with that letter's sound.

**A** — 🍞 arán · 👼 aingeal · 🐊 ailigéadar · 🏞️ abhainn

**B** — 🐄 bó · ⛵ bád · 🍌 banana · 🎈 balún · 🚌 bus

**C** — 🐱 cat · 🚗 carr · 🧀 cáis · 🐴 capall · ☕ cupán

**D** — 🚪 doras · 🐬 deilf · 🥁 druma · 🦕 díneasár

**E** — 🐘 eilifint · ✈️ eitleán · 🪁 eitleog · 🐦 éan

**F** — 🐸 frog · 🦋 féileacán · 💍 fáinne · 🦷 fiacail

**G** — 🐐 gabhar · 🌙 gealach · 🎸 giotár · 👗 gúna · ☀️ grian

**H** — 🎩 hata · 🚁 héileacaptar · 🍔 hamburgar

**I** — 🐟 iasc · 🌭 ispín · 🧈 im · 🦅 iolar

**L** — 🦁 leon · 🛏️ leaba · 🦆 lacha · ✋ lámh · 📖 leabhar

**M** — 🐶 madra · 🐖 muc · 🐒 moncaí · 👜 mála · 🍬 milseán

**N** — 🐍 nathair · 9️⃣ naoi · 🌼 nóinín · 📰 nuachtán

**O** — 🍊 oráiste · 🐙 ochtapas · 🚑 otharcharr · 🏥 ospidéal

**P** — 🐧 piongain · 🍕 píotsa · 🍐 piorra · 🐛 péist

**R** — 🚲 rothar · 🚀 roicéad · 🌹 rós · ⭐ réalta

**S** — 💡 solas · 🧦 stocaí · 🎷 sacsafón · 🍓 sú talún

**T** — 🚂 traein · 🚜 tarracóir · 🐢 turtar · 🛋️ tolg

**U** — 🍎 úll · 🥚 ubh · 💧 uisce · 🦉 ulchabhán


| Letter | Irish words | OK? / correction |
|---|---|---|
| A | arán, aingeal, ailigéadar, abhainn |  |
| B | bó, bád, banana, balún, bus |  |
| C | cat, carr, cáis, capall, cupán |  |
| D | doras, deilf, druma, díneasár |  |
| E | eilifint, eitleán, eitleog, éan |  |
| F | frog, féileacán, fáinne, fiacail |  |
| G | gabhar, gealach, giotár, gúna, grian |  |
| H | hata, héileacaptar, hamburgar |  |
| I | iasc, ispín, im, iolar |  |
| L | leon, leaba, lacha, lámh, leabhar |  |
| M | madra, muc, moncaí, mála, milseán |  |
| N | nathair, naoi, nóinín, nuachtán |  |
| O | oráiste, ochtapas, otharcharr, ospidéal |  |
| P | piongain, píotsa, piorra, péist |  |
| R | rothar, roicéad, rós, réalta |  |
| S | solas, stocaí, sacsafón, sú talún |  |
| T | traein, tarracóir, turtar, tolg |  |
| U | úll, ubh, uisce, ulchabhán |  |

Words on the Alphabet book's screens:

| English | Irish | OK? / correction |
|---|---|---|
| Alphabet | Aibítir |  |
| Pick a letter. Tap a picture to hear its word. | Roghnaigh litir. Brúigh ar phictiúr chun an focal a chloisteáil. |  |
| Letters | Litreacha |  |
| Back | Siar |  |
| Next | Ar aghaidh |  |
| 🔊 Read aloud: on | 🔊 Léigh os ard: ar siúl |  |
| 🔈 Read aloud: off | 🔈 Léigh os ard: múchta |  |
| ends with {l} |  |  |
| {w}. {w} ends with {l}. | {w}. |  |
| This device has no Irish voice, so words aren't read aloud in Irish. | Níl guth Gaeilge ar an ngléas seo, mar sin ní léitear na focail os ard as Gaeilge. Is féidir le duine fásta focail a thaifeadadh ina ghuth féin sa chuid do dhaoine fásta. |  |
| Grown-ups: you can add your own words and photos, like your child's dog or their favourite cup. Open <a href="../play.html">Play</a>, then Grown-ups, then Make > Alphabet. Photos stay on this device. | Daoine fásta: is féidir libh bhur bhfocail agus bhur ngrianghraif féin a chur leis. Oscail <a href="../play.html">Súgradh</a>, ansin an chuid do dhaoine fásta (Make > Alphabet). Fanann grianghraif ar an ngléas seo. |  |
| Letter {l} | Litir {l} |  |
| {w} | {w} |  |

The note shown when a device has no Irish voice:

| English | Irish | OK? / correction |
|---|---|---|
| This device has no reading voice, so words can't be read aloud here. To add one, open the device's Settings, search for "text-to-speech", then choose or download an English voice. If there's no voice to choose, install a free one, such as RHVoice. You can also record words in your own voice in the grown-ups area. | Níl guth léitheoireachta ar an ngléas seo, mar sin ní féidir focail a léamh os ard anseo. Chun ceann a chur leis, oscail Socruithe an ghléis, cuardaigh "text-to-speech", agus roghnaigh nó íoslódáil guth. Is féidir leat focail a thaifeadadh i do ghuth féin sa chuid do dhaoine fásta freisin. |  |


## 7. Talk board words (site/js/symbols.js, made by tools/build-symbols.py)

A child taps these to say "I want …" or to build a short sentence. Corrections go in `tools/build-symbols.py` (the Irish column), then run it again.

| English | Irish | OK? / correction |
|---|---|---|
| I | mé |  |
| you | tú |  |
| he | sé |  |
| she | sí |  |
| it | é |  |
| want | ba mhaith liom |  |
| like | is maith liom |  |
| not | ní |  |
| more | níos mó |  |
| help | cabhair |  |
| stop | stop |  |
| go | téigh |  |
| look | féach |  |
| get | faigh |  |
| make | déan |  |
| put | cuir |  |
| open | oscail |  |
| turn | cas |  |
| do | déan é |  |
| can | is féidir |  |
| good | go maith |  |
| same | mar an gcéanna |  |
| different | difriúil |  |
| all | gach |  |
| some | roinnt |  |
| finished | críochnaithe |  |
| in | isteach |  |
| on | ar |  |
| up | suas |  |
| here | anseo |  |
| that | sin |  |
| what | cad |  |
| where | cá |  |
| who | cé |  |
| when | cathain |  |
| why | cén fáth |  |
| yes | is ea |  |
| no | ní hea |  |
| break | sos |  |
| wait | fan |  |
| happy | sásta |  |
| sad | brónach |  |
| angry | crosta |  |
| worried | buartha |  |
| surprised | ionadh |  |
| excited | ar bís |  |
| scared | scanraithe |  |
| tired | tuirseach |  |
| thirsty | tart |  |
| feel | mothaigh |  |
| cold | fuar |  |
| hurt | gortaithe |  |
| hungry | ocras |  |
| hot | te |  |
| quiet | ciúin |  |
| loud | glórach |  |
| toilet | leithreas |  |
| flush the toilet | sruthlaigh |  |
| wash hands | nigh do lámha |  |
| soap | gallúnach |  |
| towel | tuáille |  |
| tap | sconna |  |
| brush teeth | scuab fiacla |  |
| teeth | fiacla |  |
| mirror | scáthán |  |
| toothbrush | scuab fiacla |  |
| toothpaste | taos fiacla |  |
| sink | doirteal |  |
| rinse | sruthlaigh |  |
| mouth | béal |  |
| wash your face | nigh d'aghaidh |  |
| get up | éirigh |  |
| get dressed | cuir ort |  |
| pyjamas | pitseámaí |  |
| jumper | geansaí |  |
| pants | fo-éadaí |  |
| shoes | bróga |  |
| coat | cóta |  |
| breakfast | bricfeasta |  |
| lunch | lón |  |
| lunch box | bosca lóin |  |
| dinner | dinnéar |  |
| eat | ith |  |
| drink | ól |  |
| water | uisce |  |
| bath | folcadh |  |
| bedtime | am luí |  |
| sleep | codladh |  |
| clock | clog |  |
| sit | suigh |  |
| stand | seas |  |
| line up | líne |  |
| walk | siúil |  |
| run | rith |  |
| jump | léim |  |
| hug | barróg |  |
| share | roinn |  |
| play | súgradh |  |
| read | léigh |  |
| draw | tarraing |  |
| music | ceol |  |
| swim | snámh |  |
| point | taispeáin |  |
| home | baile |  |
| school | scoil |  |
| classroom | seomra ranga |  |
| school bag | mála scoile |  |
| outside | amuigh |  |
| park | páirc |  |
| garden | gairdín |  |
| shop | siopa |  |
| beach | trá |  |
| car | carr |  |
| bus | bus |  |
| plane | eitleán |  |
| fire engine | inneall dóiteáin |  |
| Mum | Mam |  |
| Dad | Daid |  |
| brother | deartháir |  |
| sister | deirfiúr |  |
| baby | leanbh |  |
| teacher | múinteoir |  |
| doctor | dochtúir |  |
| dentist | fiaclóir |  |
| nurse | altra |  |
| Granny | Mamó |  |
| Grandad | Daideo |  |
| friend | cara |  |
| haircut | bearradh gruaige |  |
| dog | madra |  |
| cat | cat |  |
| hello | dia duit |  |
| goodbye | slán |  |
| please | le do thoil |  |
| thank you | go raibh maith agat |  |
| sorry | tá brón orm |  |
| my turn | mo sheal |  |
| your turn | do sheal |  |
| again | arís |  |
| come | tar |  |
| big | mór |  |
| little | beag |  |
| wet | fliuch |  |
| dirty | salach |  |
| broken | briste |  |
| down | síos |  |
| out | amach |  |
| off | as |  |
| under | faoi |  |
| head | ceann |  |
| ear | cluas |  |
| eyes | súile |  |
| tummy | bolg |  |
| arm | lámh |  |
| leg | cos |  |
| feet | cosa |  |
| plaster | plástar |  |
| apple | úll |  |
| banana | banana |  |
| grapes | fíonchaora |  |
| strawberry | sú talún |  |
| yogurt | iógart |  |
| cheese | cáis |  |
| toast | tósta |  |
| cereal | gránach |  |
| sandwich | ceapaire |  |
| pasta | pasta |  |
| pizza | píotsa |  |
| chips | sceallóga |  |
| crisps | criospaí |  |
| biscuit | briosca |  |
| ice cream | uachtar reoite |  |
| chocolate | seacláid |  |
| milk | bainne |  |
| orange juice | sú oráiste |  |
| apple juice | sú úll |  |
| squash | scuais |  |
| hot chocolate | seacláid the |  |
| ball | liathróid |  |
| bubbles | boilgeoga |  |
| blocks | bloic |  |
| teddy | teidí |  |
| toy car | carr bréagáin |  |
| doll | bábóg |  |
| puzzle | míreanna mearaí |  |
| crayons | criáin |  |
| play dough | márla |  |
| paint | péint |  |
| book | leabhar |  |
| TV | teilifís |  |
| computer game | cluiche ríomhaire |  |
| trampoline | trampailín |  |
| swing | luascán |  |
| slide | sleamhnán |  |
| sandpit | bosca gainimh |  |
| bike | rothar |  |
| blanket | pluid |  |
| headphones | cluasáin |  |
| squeeze | fáisc |  |
| tickle | cigilt |  |
| rock | luasc |  |
| lights off | múch an solas |  |


## 8. Schedule activities (site/js/i18n.js `CM.ACTIVITIES`)

Used on visual schedules, the First/Then board and the token board ("3 more, then {reward}").

| English | Irish | OK? / correction |
|---|---|---|
| 🎮 Calm Match | Calm Match |  |
| 🦷 Brush teeth | Scuab fiacla |  |
| 👟 Shoes on | Bróga ort |  |
| 🧥 Coat on | Cóta ort |  |
| 🍽️ Dinner | Dinnéar |  |
| 🍪 Snack | Sneaic |  |
| 🛁 Bath | Folcadh |  |
| 🛏️ Bed | Leaba |  |
| 📚 Reading | Léamh |  |
| ✏️ Homework | Obair bhaile |  |
| 🧸 Play | Súgradh |  |
| 🧩 Puzzle | Míreanna mearaí |  |
| 📺 TV | Teilifís |  |
| 🌳 Park | Páirc |  |
| 🚗 Car | Carr |  |
| 🏫 School | Scoil |  |
| 🎵 Music | Ceol |  |
| 🚽 Toilet | Leithreas |  |
| 🧹 Tidy up | Glan suas |  |
| 🤗 Hug | Barróg |  |
| 🥣 Breakfast | Bricfeasta |  |
| 🥪 Lunch | Lón |  |
| 👕 Get dressed | Éadaí ort |  |
| 🧼 Wash hands | Nigh do lámha |  |
| 🚶 Walk | Siúlóid |  |
| 🎨 Drawing | Líníocht |  |
| 🧘 Quiet time | Am ciúin |  |
| 🚌 Bus | Bus |  |


## 9. First-time setup screens (site/js/setup.js)

| English | Irish | OK? / correction |
|---|---|---|
| Welcome to Calm Match | Fáilte go Calm Match |  |
| A few quick choices for a grown-up. It takes about a minute. | Cúpla rogha thapa do dhuine fásta. Tógann sé thart ar nóiméad. |  |
| Step {n} of {m} | Céim {n} as {m} |  |
| Next | Ar aghaidh |  |
| Back | Siar |  |
| Skip for now | Ní anois |  |
| Which language should the games use? | Cén teanga a úsáidfidh na cluichí? |  |
| What should we call your child? | Cén t-ainm a thabharfaimid ar do pháiste? |  |
| A nickname is fine. Please don't add a full name, age or anything medical. It stays on this device. | Is leor leasainm. Ná cuir ainm iomlán, aois ná aon rud leighis leis. Fanann sé ar an ngléas seo. |  |
| Nickname | Leasainm |  |
| Pick a picture for them | Roghnaigh pictiúr dóibh |  |
| Type a nickname first. | Clóscríobh leasainm ar dtús. |  |
| What do they love? | Cad is breá leo? |  |
| The games use these pictures. You can add your own photos later. | Úsáideann na cluichí na pictiúir seo. Is féidir do ghrianghraif féin a chur leis níos déanaí. |  |
| How should it look and sound? | Cuma agus fuaim |  |
| [object Object] | [object Object] |  |
| All set | Sin é, réidh |  |
| You can change any of this in the Grown-ups area. There you can also make schedules, stories and a talk board, and record your child's name so the voice can say it. | Is féidir aon chuid de seo a athrú sa chuid do dhaoine fásta. Is féidir leat sceidil, scéalta agus clár cainte a dhéanamh ansin freisin, agus ainm do pháiste a thaifeadadh ionas gur féidir leis an nguth é a rá. |  |
| Start playing | Tosaigh ag imirt |  |


## 10. Grown-ups area (site/js/grown-ga.js)

Shown to parents and teachers when they switch the Grown-ups area to Gaeilge. Written, not spoken. Game and picture names inside it stay as in sections 2 and 3.

| English | Irish | OK? / correction |
|---|---|---|
| What's new — October 2026 | Cad atá nua — Deireadh Fómhair 2026 |  |
| Picture doors. | Doirse pictiúr. |  |
| Under Start, your child now has big picture doors to Sing along, the Alphabet book, Stories, Stickers, the Calm corner and My day. Turn any of them off in Settings › Home screen. | Faoi Tosaigh, tá doirse móra pictiúr ag do pháiste anois chuig Canaimis le chéile, an Leabhar Aibítre, Scéalta, Greamáin, an Cúinne Ciúin agus Mo Lá. Múch ceann ar bith díobh i Socruithe › Scáileán baile. |  |
| The Grown-ups area is in four sections: | Tá limistéar na nDaoine Fásta i gceithre chuid: |  |
| Progress, Make, Settings, and Children and device. Everything is still here; it's just grouped. | Dul chun cinn, Déan, Socruithe, agus Páistí agus gléas. Tá gach rud fós anseo; tá sé grúpáilte anois. |  |
| Emma, a built-in voice. | Emma, guth ionsuite. |  |
| English read-aloud now uses Emma on every device, even offline. Choose Slower, Normal or Faster in Settings › Senses and voice, or switch back to your device's own voice there. | Úsáideann léamh os ard an Bhéarla Emma anois ar gach gléas, fiú as líne. Roghnaigh Níos moille, Gnáth nó Níos tapúla i Socruithe › Céadfaí agus guth, nó athraigh ar ais go guth do ghléis féin ansin. |  |
| Your child's name. | Ainm do pháiste. |  |
| Record it once below and Emma will use it. Until then, she leaves the name out. | Taifead é uair amháin thíos agus úsáidfidh Emma é. Go dtí sin, fágann sí an t-ainm ar lár. |  |
| Quick presets. | Réamhshocruithe tapa. |  |
| Very calm, Standard and Bigger and clearer, at the top of Senses and voice. | An-chiúin, Caighdeánach agus Níos mó agus níos soiléire, ag barr Céadfaí agus guth. |  |
| Gaeilge for grown-ups. | Gaeilge do dhaoine fásta. |  |
| The switch at the top of this area shows it in Irish. The Irish is still being checked by a fluent speaker. | Taispeánann an lasc ag barr an limistéir seo i nGaeilge é. Tá an Ghaeilge fós á seiceáil ag cainteoir líofa. |  |
| Got it | Tuigim |  |
| Grown-ups | Daoine fásta |  |
| Grown-ups sections | Ranna do dhaoine fásta |  |
| Pages in this section | Leathanaigh sa rann seo |  |
| Home page | Leathanach baile |  |
| Back to the game | Ar ais chuig an gcluiche |  |
| Progress | Dul chun cinn |  |
| Make | Déan |  |
| Settings | Socruithe |  |
| Children and device | Páistí agus gléas |  |
| Summary | Achoimre |  |
| History | Stair |  |
| Why it chose | Cén fáth ar roghnaigh sé |  |
| Schedules and timer | Sceidil agus amadóir |  |
| Talk | Caint |  |
| Stories | Scéalta |  |
| Pictures | Pictiúir |  |
| Alphabet | Aibítir |  |
| Sing along | Amhráin |  |
| Senses and voice | Céadfaí agus guth |  |
| Games | Cluichí |  |
| Home screen | Scáileán baile |  |
| Rewards and breaks | Duaiseanna agus sosanna |  |
| Children | Páistí |  |
| Classroom | Seomra ranga |  |
| Backup | Cúltaca |  |
| Account | Cuntas |  |
| This device | An gléas seo |  |
| For grown-ups | Do dhaoine fásta |  |
| Cancel | Cealaigh |  |
| Not quite. Ask a grown-up to help. | Ní hea go díreach. Iarr cabhair ar dhuine fásta. |  |
| Grown-ups language | Teanga na ndaoine fásta |  |
| The Irish in this area still needs checking by a fluent speaker. Some names and longer notes are still in English. | Tá Gaeilge na coda seo fós le seiceáil ag cainteoir líofa. Tá roinnt ainmneacha agus nótaí fada fós i mBéarla. |  |
| In a sentence | In abairt |  |
| Skill map | Léarscáil scileanna |  |
| Next session | An chéad seisiún eile |  |
| How the engine decides | Conas a shocraíonn an t-inneall |  |
| Each circle is one skill. The ring fills as the engine becomes more sure the skill is learned. A tick means learned; a lock means it opens after the skill before it. ↩ means it was hard last time. | Scil amháin is ea gach ciorcal. Líonann an fáinne de réir mar a bhíonn an t-inneall níos cinntí go bhfuil an scil foghlamtha. Ciallaíonn tic go bhfuil sí foghlamtha; ciallaíonn glas go n-osclaíonn sí i ndiaidh na scile roimpi. Ciallaíonn ↩ go raibh sí deacair an uair dheireanach. |  |
| Tap a circle to see the details for that skill. | Tapáil ciorcal le sonraí na scile sin a fheiceáil. |  |
| Sessions this week | Seisiúin an tseachtain seo |  |
| Right first time | Ceart an chéad uair |  |
| Skills learned | Scileanna foghlamtha |  |
| Working on | Ag obair air |  |
| Learned | Foghlamtha |  |
| Ready to try | Réidh le triail |  |
| Still with help | Fós le cabhair |  |
| Right first time, last 5 sessions | Ceart an chéad uair, na 5 seisiún deireanacha |  |
| Independent turns only: turns with errorless help are not counted. | Babhtaí neamhspleácha amháin: ní áirítear babhtaí le cabhair gan earráid. |  |
| When | Cathain |  |
| Helped | Le cabhair |  |
| Hints | Leideanna |  |
| Minutes | Nóiméid |  |
| Breaks | Sosanna |  |
| Share with school or a therapist | Roinn leis an scoil nó le teiripeoir |  |
| Printable summary | Achoimre le priontáil |  |
| Download spreadsheet (CSV) | Íoslódáil scarbhileog (CSV) |  |
| Copy as text | Cóipeáil mar théacs |  |
| Download full backup (JSON) | Íoslódáil cúltaca iomlán (JSON) |  |
| The spreadsheet has one row per game played. The child's nickname is included, so check before sending it on. | Tá líne amháin sa scarbhileog do gach cluiche a imríodh. Tá leasainm an pháiste ann, mar sin seiceáil é sula gcuireann tú ar aghaidh é. |  |
| Every decision the engine makes on this visit, newest first. | Gach cinneadh a dhéanann an t-inneall ar an gcuairt seo, an ceann is nuaí ar dtús. |  |
| First / Then board | Clár Ar dtús / Ansin |  |
| Shows "First this, then that" full-size for your child. Pictures and words follow the game language. For more steps, use a schedule below. | Taispeánann sé "Ar dtús seo, ansin siúd" go mór do do pháiste. Leanann na pictiúir agus na focail teanga na gcluichí. Le haghaidh tuilleadh céimeanna, úsáid sceideal thíos. |  |
| First | Ar dtús |  |
| Then | Ansin |  |
| Timer for "First" | Amadóir do "Ar dtús" |  |
| Show board | Taispeáin an clár |  |
| Visual schedules | Sceidil phictiúr |  |
| Visual timer | Amadóir pictiúr |  |
| A coloured circle that shrinks as time passes, with a soft tone at the end. Numbers aren't needed to read it. | Ciorcal daite a éiríonn níos lú de réir mar a théann an t-am thart, le ton bog ag an deireadh. Níl gá le huimhreacha chun é a léamh. |  |
| Start timer | Tosaigh an t-amadóir |  |
| Timer sounds | Fuaimeanna an amadóra |  |
| For every timer: schedule steps, the First/Then board, the visual timer and breaks. Reminders are a soft tone, and the time left is read aloud if read-aloud is on. With "Off", timers are silent and only the circle shows the time. | Do gach amadóir: céimeanna sceidil, an clár Ar dtús/Ansin, an t-amadóir pictiúr agus sosanna. Is ton bog iad na meabhrúcháin, agus léitear an t-am atá fágtha os ard má tá léamh os ard ar siúl. Le "As", bíonn na hamadóirí ciúin agus ní thaispeánann ach an ciorcal an t-am. |  |
| Up to 20 steps in order. Your child sees every step with "Now" and "Next" marked, and taps Done to move on. Keep several schedules (morning, school, bedtime) and set the days each one is for. | Suas le 20 céim in ord. Feiceann do pháiste gach céim, le "Anois" agus "Ar aghaidh" marcáilte, agus tapálann sé Déanta le bogadh ar aghaidh. Coinnigh roinnt sceideal (maidin, scoil, am codlata) agus socraigh na laethanta do gach ceann. |  |
| + New schedule | + Sceideal nua |  |
| Schedule name | Ainm an sceidil |  |
| Days | Laethanta |  |
| Add a step | Cuir céim leis |  |
| Clear all steps | Glan na céimeanna ar fad |  |
| Show this schedule | Taispeáin an sceideal seo |  |
| Show today's schedule | Taispeáin sceideal an lae inniu |  |
| No steps yet. Add some below. | Níl aon chéim fós. Cuir cúpla ceann leis thíos. |  |
| Mon | Luan |  |
| Tue | Máirt |  |
| Wed | Céad |  |
| Thu | Déar |  |
| Fri | Aoine |  |
| Sat | Sath |  |
| Sun | Domh |  |
| Off | As |  |
| No timer | Gan amadóir |  |
| At the end | Ag an deireadh |  |
| 1 minute left + end | Nóiméad amháin fágtha + deireadh |  |
| Every minute + end | Gach nóiméad + deireadh |  |
| Talk board | Clár cainte |  |
| A simple board your child can tap to say what they want, or to build short sentences. It works offline and nothing tapped is saved or sent. It is a practice board: a child who relies on a communication aid should use the system their speech and language therapist sets up. | Clár simplí ar féidir le do pháiste é a thapáil chun a rá cad a theastaíonn uaidh, nó chun abairtí gearra a chumadh. Oibríonn sé as líne agus ní shábháiltear ná ní sheoltar aon rud a thapáiltear. Clár cleachtaidh atá ann: ba chóir do pháiste a bhíonn ag brath ar áis chumarsáide an córas a shocraíonn a theiripeoir urlabhra agus teanga a úsáid. |  |
| A 💬 Talk button appears at the top of the games, the schedule and the stories. | Bíonn cnaipe 💬 Caint ag barr na gcluichí, an sceidil agus na scéalta. |  |
| Open the board | Oscail an clár |  |
| Print the boards | Priontáil na cláir |  |
| "I want" choices | Roghanna "Teastaíonn uaim" |  |
| Up to 12 big buttons. A tap says "I want …". Help, break, more, stop, finished, yes and no are always there. | Suas le 12 chnaipe mhóra. Deir tapáil "Teastaíonn uaim …". Bíonn cabhair, sos, tuilleadh, stop, críochnaithe, tá agus níl ann i gcónaí. |  |
| Add a choice | Cuir rogha leis |  |
| Core words | Croífhocail |  |
| My words | Mo chuid focal |  |
| Up to 24 extra words for the third page: people, places, favourite things. Use Make > Pictures to add your own photos and words. | Suas le 24 fhocal breise don tríú leathanach: daoine, áiteanna, rudaí is fearr leo. Úsáid Déan > Pictiúir chun do ghrianghraif agus d'fhocail féin a chur leis. |  |
| Add a word | Cuir focal leis |  |
| Extra pages of pictures your child can switch between. Each page always keeps the same order. Untick any your child doesn't need yet: fewer pages can be easier to start with. | Leathanaigh bhreise pictiúr ar féidir le do pháiste aistriú eatarthu. Fanann an t-ord céanna ar gach leathanach i gcónaí. Bain an tic de cheann ar bith nach bhfuil de dhíth ar do pháiste fós: bíonn níos lú leathanach níos éasca ar dtús. |  |
| Stories and how-tos | Scéalta agus treoracha |  |
| Short picture stories read aloud, for things that are new or hard (the dentist, a new school), and step-by-step how-tos (washing hands). Your child finds them under "My stories" on the start screen, and any story or how-to can be added to a schedule step. Everything stays on this device. | Scéalta gearra pictiúr a léitear os ard, do rudaí atá nua nó deacair (an fiaclóir, scoil nua), agus treoracha céim ar chéim (lámha a ní). Aimsíonn do pháiste iad faoi "Mo scéalta" ar an scáileán tosaigh, agus is féidir aon scéal nó treoir a chur le céim sceidil. Fanann gach rud ar an ngléas seo. |  |
| Starter stories are in English. Change any words, including into Irish, and swap in names and your own photos. | Tá na scéalta tosaigh i mBéarla. Athraigh focal ar bith, go Gaeilge freisin, agus cuir ainmneacha agus do ghrianghraif féin isteach. |  |
| No stories yet. Start from one below. | Níl aon scéal fós. Tosaigh ó cheann thíos. |  |
| Start a story | Tosaigh scéal |  |
| Start a how-to | Tosaigh treoir |  |
| Blank story | Scéal bán |  |
| Blank how-to | Treoir bhán |  |
| Ready-made pages | Leathanaigh réamhdhéanta |  |
| My pictures | Mo phictiúir |  |
| Your own pictures with a word or two: your child's school, their teacher, the swimming pool, a favourite snack. Use them in schedules, the Talk board and stories. Photos are shrunk and kept on this device only. | Do phictiúir féin le focal nó dhó: scoil do pháiste, a múinteoir, an linn snámha, an sneaic is fearr leo. Úsáid iad i sceidil, ar an gclár cainte agus i scéalta. Laghdaítear grianghraif agus coinnítear ar an ngléas seo amháin iad. |  |
| Add a picture | Cuir pictiúr leis |  |
| Add photo | Cuir grianghraf leis |  |
| Choose a photo | Roghnaigh grianghraf |  |
| Words for the new picture | Focail don phictiúr nua |  |
| Words, for example Swimming pool | Focail, mar shampla Linn snámha |  |
| Then add a photo or choose a symbol for it. Please don't use photos that show a child's full name or school uniform crest. | Ansin cuir grianghraf leis nó roghnaigh siombail dó. Ná húsáid grianghraif a thaispeánann ainm iomlán páiste ná suaitheantas éide scoile, le do thoil. |  |
| Recorded voices | Guthanna taifeadta |  |
| Use the 🎙 Record buttons next to schedule steps, talk words, story pages and your pictures to record a word in your own voice (up to 8 seconds). It then plays instead of the device's voice, in the language the games are set to. Recordings stay on this device. The microphone is only on while you record. | Úsáid na cnaipí 🎙 Taifead in aice le céimeanna sceidil, focail chainte, leathanaigh scéil agus do phictiúir chun focal a thaifeadadh i do ghuth féin (suas le 8 soicind). Seinntear é ansin in áit ghuth an ghléis, sa teanga atá socraithe do na cluichí. Fanann taifeadtaí ar an ngléas seo. Ní bhíonn an micreafón ar siúl ach fad a bhíonn tú ag taifeadadh. |  |
| 🎙 Record | 🎙 Taifead |  |
| Space used on this device | Spás in úsáid ar an ngléas seo |  |
| Alphabet book | Leabhar aibítre |  |
| A calm picture book: one letter at a time, with things that start with it. Your child taps a picture to hear the letter and the word. It follows the language of the games and works in English and Irish. Nothing plays on its own. | Leabhar pictiúr ciúin: litir amháin ag an am, le rudaí a thosaíonn léi. Tapálann do pháiste pictiúr chun an litir agus an focal a chloisteáil. Leanann sé teanga na gcluichí agus oibríonn sé i mBéarla agus i nGaeilge. Ní sheinntear aon rud leis féin. |  |
| Open the Alphabet book | Oscail an leabhar aibítre |  |
| Alphabet language | Teanga na haibítre |  |
| Words and photos | Focail agus grianghraif |  |
| Change a picture to your own photo, hide a word your child doesn't like, or add words from your child's world, like Mam, their dog's name or their favourite cup. Your words also turn up in the Letters game. Words marked 🔊 have a built-in recording, so they are read aloud even on devices with no voice of their own. Words without 🔊, like the words you add, use the device's voice, so on a device with no voice they stay silent unless you record them. If you record a word yourself, your recording plays instead. Photos are shrunk and kept on this device only. They are never uploaded, even with an account. | Athraigh pictiúr go dtí do ghrianghraf féin, folaigh focal nach maith le do pháiste, nó cuir focail as saol do pháiste leis, mar Mam, ainm an mhadra nó an cupán is fearr leo. Tagann d'fhocail sa chluiche Litreacha freisin. Tá taifeadadh ionsuite ag focail le 🔊, mar sin léitear os ard iad fiú ar ghléasanna gan guth dá gcuid féin. Úsáideann focail gan 🔊, mar na focail a chuireann tú leis, guth an ghléis, mar sin ar ghléas gan guth fanann siad ciúin mura dtaifeadann tú iad. Má thaifeadann tú focal tú féin, seinntear do thaifeadadh ina áit. Laghdaítear grianghraif agus coinnítear ar an ngléas seo amháin iad. Ní uaslódáiltear riamh iad, fiú le cuntas. |  |
| Has a built-in recording | Tá taifeadadh ionsuite aige |  |
| Hide | Folaigh |  |
| Rename | Athainmnigh |  |
| Open Sing along | Oscail na hamhráin |  |
| 16 songs, from Twinkle Twinkle to Old MacDonald. A gentle tune plays and the words light up as it goes, so your child can join in at their own pace. The speed slider slows a song down, and the repeat button plays it again and again. | 16 amhrán, ó Twinkle Twinkle go Old MacDonald. Seinntear fonn séimh agus lasann na focail de réir a chéile, ionas gur féidir le do pháiste páirt a ghlacadh ar a luas féin. Moillíonn an sleamhnán luais amhrán, agus seinneann an cnaipe athuair arís agus arís é. |  |
| Nothing is recorded and the microphone is never used. Use your browser's back button to come back here. | Ní thaifeadtar aon rud agus ní úsáidtear an micreafón riamh. Úsáid cnaipe siar do bhrabhsálaí le teacht ar ais anseo. |  |
| Songs start in English, because the games are set to English for this child. You can switch to Irish on the song page. | Tosaíonn na hamhráin i mBéarla, mar tá na cluichí socraithe go Béarla don pháiste seo. Is féidir leat aistriú go Gaeilge ar leathanach an amhráin. |  |
| Quick set-up | Socrú tapa |  |
| Each choice sets several of the switches below at once. You can still change any of them afterwards. | Socraíonn gach rogha roinnt de na lasca thíos le chéile. Is féidir aon cheann acu a athrú ina dhiaidh sin fós. |  |
| Very calm | An-chiúin |  |
| Standard | Gnáth |  |
| Bigger and clearer | Níos mó agus níos soiléire |  |
| No motion, plain words and one quiet tone when an answer is right. | Gan ghluaiseacht, focail shimplí agus ton ciúin amháin nuair a bhíonn freagra ceart. |  |
| Soft sounds, gentle fades and a soft chime for a right answer. | Fuaimeanna boga, céimnithe séimhe agus cling bhog do fhreagra ceart. |  |
| Bigger buttons, high contrast and words read aloud in short, clear phrases. | Cnaipí níos mó, codarsnacht ard agus focail á léamh os ard i bhfrásaí gearra soiléire. |  |
| Your own mix of settings. Choose one above to start again from a set-up. | Do mheascán féin socruithe. Roghnaigh ceann thuas chun tosú arís ó shocrú. |  |
| Senses | Céadfaí |  |
| Soft sounds | Fuaimeanna boga |  |
| A gentle chime for a match. Never a sound for a miss. | Cling shéimh do mheaitseáil. Fuaim ar bith riamh do bhotún. |  |
| Read aloud | Léamh os ard |  |
| Says each instruction and picture name, using this device's voice. | Deir sé gach treoir agus ainm pictiúir, le guth an ghléis seo. |  |
| Clear speech | Caint shoiléir |  |
| Says words in short phrases with a pause between them, and the picture name on its own, a little slower. | Deir sé focail i bhfrásaí gearra le sos eatarthu, agus ainm an phictiúir leis féin, rud beag níos moille. |  |
| No motion | Gan ghluaiseacht |  |
| Turns off fades, transitions and the breathing animation. | Múchann sé céimnithe, aistrithe agus beochan an análaithe. |  |
| High contrast | Codarsnacht ard |  |
| Black on white with strong outlines. | Dubh ar bhán le himlínte láidre. |  |
| Bigger buttons | Cnaipí níos mó |  |
| For less precise tapping. | Do thapáil nach bhfuil chomh beacht. |  |
| Number keys | Eochracha uimhreacha |  |
| Shows 1, 2, 3 on answers for keyboard or switch users. | Taispeánann sé 1, 2, 3 ar fhreagraí d'úsáideoirí méarchláir nó lasc. |  |
| Voice | Guth |  |
| Emma is a calm voice built into Calm Match. She sounds the same on every phone, tablet and computer, and works offline. Words you type yourself, like your own stories, are read by this device's voice. Choose "This device" to use the device's voice for everything. | Is guth ciúin í Emma atá ionsuite i Calm Match. Fuaimníonn sí mar an gcéanna ar gach fón, táibléad agus ríomhaire, agus oibríonn sí as líne. Léann guth an ghléis seo focail a chlóscríobhann tú féin, mar do scéalta féin. Roghnaigh "An gléas seo" chun guth an ghléis a úsáid do gach rud. |  |
| Emma (built in) | Emma (ionsuite) |  |
| Which voice | Cén guth |  |
| Voice speed | Luas an ghutha |  |
| This device has no reading voice of its own. Emma still reads the games, but words you type yourself (your own stories, pictures and schedule steps) stay silent unless you record them, or add a voice in the device's Settings under "text-to-speech". | Níl guth léitheoireachta dá chuid féin ag an ngléas seo. Léann Emma na cluichí fós, ach fanann focail a chlóscríobhann tú féin (do scéalta, pictiúir agus céimeanna sceidil féin) ciúin mura dtaifeadann tú iad, nó mura gcuireann tú guth leis i Socruithe an ghléis faoi "text-to-speech". |  |
| Touch style | Stíl tadhaill |  |
| How a touch chooses an answer. Helpful if your child holds their finger on the screen, presses with a whole hand, or slides across the pictures. Long-press menus, text selection and double-tap zoom are switched off in the games either way. | Conas a roghnaíonn tadhall freagra. Cabhrach má choinníonn do pháiste a mhéar ar an scáileán, má bhrúnn sé leis an lámh ar fad, nó má shleamhnaíonn sé trasna na bpictiúr. Bíonn roghchláir brú fada, roghnú téacs agus súmáil le tapáil dhúbailte múchta sna cluichí ar aon nós. |  |
| Tap | Tapáil |  |
| Hold to choose | Coinnigh le roghnú |  |
| Slide and lift | Sleamhnaigh agus ardaigh |  |
| Chosen the moment a finger touches. Holding still counts as one tap. | Roghnaithe an nóiméad a theagmhaíonn méar. Áirítear coinneáil socair mar thapáil amháin. |  |
| How long to hold | Cé chomh fada le coinneáil |  |
| Ignore extra taps for this long after an answer (stops a bouncing finger answering twice) | Déan neamhaird de thapanna breise ar feadh an achair seo i ndiaidh freagra (ionas nach bhfreagraíonn méar phreabach faoi dhó) |  |
| Try it here, or hand the device to your child. | Triail anseo é, nó tabhair an gléas do do pháiste. |  |
| Practice button | Cnaipe cleachtaidh |  |
| Language of the games | Teanga na gcluichí |  |
| Interest theme | Téama suime |  |
| The same games, with pictures your child likes. | Na cluichí céanna, le pictiúir is maith le do pháiste. |  |
| Photos | Grianghraif |  |
| Use photos instead of emoji | Úsáid grianghraif in áit emoji |  |
| Add your own photos, for example your child's real bus or your dog. Photos are shrunk and kept on this device only. They are never uploaded, even with an account. | Cuir do ghrianghraif féin leis, mar shampla fíorbhus do pháiste nó do mhadra. Laghdaítear grianghraif agus coinnítear ar an ngléas seo amháin iad. Ní uaslódáiltear riamh iad, fiú le cuntas. |  |
| Help | Cabhair |  |
| Errorless start | Tús gan earráid |  |
| New skills begin with the right answer highlighted and the others greyed out. After 2 right answers the help drops to an outline, then goes away. If your child struggles, the outline comes back. | Tosaíonn scileanna nua leis an bhfreagra ceart aibhsithe agus na cinn eile liathaithe. I ndiaidh 2 fhreagra cheart, laghdaíonn an chabhair go himlíne, agus imíonn sí ansin. Má bhíonn deacracht ag do pháiste, tagann an imlíne ar ais. |  |
| More feelings | Tuilleadh mothúchán |  |
| Adds calm, silly, worried and loving to the Feelings game. Best once your child knows happy, sad, angry, scared, surprised and sleepy. | Cuireann sé ciúin, amaideach, imníoch agus grámhar leis an gcluiche Mothúcháin. Is fearr é nuair is eol do do pháiste sona, brónach, crosta, scanraithe, iontas agus codladh. |  |
| Auto-adjust difficulty | Coigeartaigh an deacracht go huathoibríoch |  |
| Adds or removes answer choices using the rules in Progress > Summary. | Cuireann sé roghanna freagra leis nó baineann sé iad, de réir na rialacha in Dul chun cinn > Achoimre. |  |
| Games per session | Cluichí sa seisiún |  |
| Turns per game | Babhtaí sa chluiche |  |
| Which games | Cé na cluichí |  |
| Switch them all on | Cas air iad ar fad |  |
| Who picks the games | Cé a roghnaíonn na cluichí |  |
| Engine picks | Roghnaíonn an t-inneall |  |
| Picture doors your child sees under the Start button. Turn off any your child doesn't need. With all of them off, the home screen shows only Start. Each child has their own choice. | Doirse pictiúr a fheiceann do pháiste faoin gcnaipe Tosaigh. Múch aon cheann nach bhfuil de dhíth ar do pháiste. Má bhíonn siad ar fad múchta, ní thaispeánann an scáileán baile ach Tosaigh. Tá a rogha féin ag gach páiste. |  |
| My day | Mo lá |  |
| Today's schedule. Shows only on days with a schedule (Make > Schedules and timer). | Sceideal an lae inniu. Ní thaispeántar é ach ar laethanta a bhfuil sceideal acu (Déan > Sceidil agus amadóir). |  |
| Opens the songs. | Osclaíonn sé na hamhráin. |  |
| Opens the picture book, one letter at a time. | Osclaíonn sé an leabhar pictiúr, litir amháin ag an am. |  |
| My stories | Mo scéalta |  |
| Shows only once you've made a story in Make > Stories. | Ní thaispeántar é go dtí go ndéanann tú scéal in Déan > Scéalta. |  |
| My stickers | Mo ghreamáin |  |
| The sticker book. | An leabhar greamán. |  |
| Calm corner | Cúinne ciúin |  |
| Breathing, bubbles, music or quiet. | Análú, boilgeoga, ceol nó ciúnas. |  |
| Token board | Clár comharthaí |  |
| Your child earns a token for each game finished and each schedule step done. When the board is full, it shows the reward you picked. Tokens are never taken away. | Tuilleann do pháiste comhartha do gach cluiche a chríochnaítear agus do gach céim sceidil a dhéantar. Nuair a bhíonn an clár lán, taispeánann sé an duais a roghnaigh tú. Ní bhaintear comharthaí riamh. |  |
| Tokens to earn the reward | Comharthaí chun an duais a thuilleamh |  |
| Token picture | Pictiúr an chomhartha |  |
| Choose the reward | Roghnaigh an duais |  |
| Reward: | Duais: |  |
| The Break button offers breathing, bubbles, music or quiet. A break timer gives a 1-minute warning, then "Break time is over". Your child can always come back sooner. | Tairgeann an cnaipe Sos análú, boilgeoga, ceol nó ciúnas. Tugann amadóir sosa rabhadh nóiméid, ansin "Tá an sos thart". Is féidir le do pháiste teacht ar ais níos luaithe i gcónaí. |  |
| Break timer | Amadóir sosa |  |
| Offer a break | Tairg sos |  |
| Only when asked | Nuair a iarrtar amháin |  |
| After every game | I ndiaidh gach cluiche |  |
| After every 2 games | I ndiaidh gach 2 chluiche |  |
| After every 3 games | I ndiaidh gach 3 chluiche |  |
| Rewards | Duaiseanna |  |
| Stickers after each game | Greamáin i ndiaidh gach cluiche |  |
| Celebration when an answer is right | Ceiliúradh nuair a bhíonn freagra ceart |  |
| Cheerful | Gealgháireach |  |
| Gentle | Séimh |  |
| Cheerful: bright words and a short tune. Gentle: a soft chime. Very calm: plain words like "That's right", one quiet tone, no tune between games. | Gealgháireach: focail gheala agus fonn gearr. Séimh: cling bhog. An-chiúin: focail shimplí mar "Sin ceart", ton ciúin amháin, gan fonn idir cluichí. |  |
| ⭐ Stars | ⭐ Réaltaí |  |
| 💚 Hearts | 💚 Croíthe |  |
| 🚂 Theme picture | 🚂 Pictiúr an téama |  |
| 🚂 Theme pictures | 🚂 Pictiúir an téama |  |
| No stickers | Gan ghreamáin |  |
| Who is playing | Cé atá ag imirt |  |
| Nickname | Leasainm |  |
| Save | Sábháil |  |
| Emma, the voice that reads the games aloud, can't say names. Record your child's name in your own voice and Emma will use it, for example "Great work, Sam". Until then she leaves the name out. The recording stays on this device. | Ní féidir le Emma, an guth a léann na cluichí os ard, ainmneacha a rá. Taifead ainm do pháiste i do ghuth féin agus úsáidfidh Emma é, mar shampla "Obair iontach, Sam". Go dtí sin fágann sí an t-ainm amach. Fanann an taifeadadh ar an ngléas seo. |  |
| Add a child | Cuir páiste leis |  |
| New child nickname | Leasainm an pháiste nua |  |
| Add | Cuir leis |  |
| Use a nickname only. Please don't enter a full name, age, diagnosis or anything medical. Nicknames stay on this device and are never uploaded. | Úsáid leasainm amháin. Ná cuir isteach ainm iomlán, aois, diagnóis ná aon rud leighis, le do thoil. Fanann leasainmneacha ar an ngléas seo agus ní uaslódáiltear riamh iad. |  |
| Sticker book | Leabhar greamán |  |
| No stickers yet. One is earned for each game finished. | Níl aon ghreamán fós. Tuilltear ceann do gach cluiche a chríochnaítear. |  |
| Classroom mode | Mód seomra ranga |  |
| Use this tablet for a class | Úsáid an táibléad seo do rang |  |
| Each child taps their own avatar to start, and goes back to "Who is playing?" when they finish. Everything stays on this tablet. Use nicknames or first names only. | Tapálann gach páiste a phictiúr féin chun tosú, agus téann sé ar ais go "Cé atá ag imirt?" nuair a chríochnaíonn sé. Fanann gach rud ar an táibléad seo. Úsáid leasainmneacha nó céadainmneacha amháin. |  |
| Backup file | Comhad cúltaca |  |
| Save everything on this device to a file: children, progress, schedules, stories, pictures and recordings. Use it to move to a new tablet, or to take one child's set-up between home and school. The file holds nicknames and family photos, so keep it somewhere private. | Sábháil gach rud ar an ngléas seo i gcomhad: páistí, dul chun cinn, sceidil, scéalta, pictiúir agus taifeadtaí. Úsáid é chun bogadh go táibléad nua, nó chun socrú páiste amháin a thabhairt idir an baile agus an scoil. Tá leasainmneacha agus grianghraif teaghlaigh sa chomhad, mar sin coinnigh in áit phríobháideach é. |  |
| Save backup file | Sábháil comhad cúltaca |  |
| Save this child only | Sábháil an páiste seo amháin |  |
| Open a backup file | Oscail comhad cúltaca |  |
| An account lets you keep each child's settings on more than one device. It is optional. | Ligeann cuntas duit socruithe gach páiste a choinneáil ar níos mó ná gléas amháin. Is rogha é. |  |
| Not signed in. Everything stays on this device. | Níl tú sínithe isteach. Fanann gach rud ar an ngléas seo. |  |
| Sign in or create an account | Sínigh isteach nó cruthaigh cuntas |  |
| More | Tuilleadh |  |
| About Calm Match | Faoi Calm Match |  |
| Privacy policy | Polasaí príobháideachais |  |
| Support the site | Tacaigh leis an suíomh |  |
| Grown-ups button | Cnaipe na ndaoine fásta |  |
| How to open this area. Applies to everyone on this device. | Conas an chuid seo a oscailt. Baineann sé le gach duine ar an ngléas seo. |  |
| Press and hold | Brúigh agus coinnigh |  |
| Answer a sum | Freagair suim |  |
| Try it out | Triail é |  |
| Adds a pretend child with some progress, so you can see how the Progress pages look. | Cuireann sé páiste samplach le roinnt dul chun cinn leis, ionas gur féidir leat leathanaigh an Dul chun cinn a fheiceáil. |  |
| Add example child with progress | Cuir páiste samplach le dul chun cinn leis |  |
| Reset and delete | Athshocraigh agus scrios |  |
| These can't be undone. Save a backup file first if you might want things back. | Ní féidir iad seo a chealú. Sábháil comhad cúltaca ar dtús má d'fhéadfá rudaí a bheith uait ar ais. |  |
| Reset this child's progress | Athshocraigh dul chun cinn an pháiste seo |  |
| Remove this child | Bain an páiste seo |  |
| Delete everything on this device | Scrios gach rud ar an ngléas seo |  |
| 3 tokens | 3 chomhartha |  |
| 5 tokens | 5 chomhartha |  |
| 10 tokens | 10 gcomhartha |  |
| Voice: slower | Guth: níos moille |  |
| Voice: normal | Guth: gnáth |  |
| Voice: faster | Guth: níos tapúla |  |

Patterns with a number in them:

| English | Irish | OK? / correction |
|---|---|---|
| What is {n} plus {n}? | Cé mhéad é {n} móide {n}? |  |
| Grown-ups: hold | Daoine fásta: coinnigh |  |
| My day \{n}\ | Mo lá ({n}) |  |
| {n} min | {n} nóim |  |

Child mode header on the Sing along and Alphabet pages (site/js/childbar.js):

| English | Irish | OK? / correction |
|---|---|---|
| Home | Abhaile |  |


## 11. Sing along (site/singalong/songs.js, site/singalong/shared.js)

The song lyrics have their own sheet, `docs/singalong-irish-lyrics.md`, with syllable counts so the words stay on the tune: please check them there, singing along at calmmatch.com/singalong/ with GA chosen. The lines we were least sure of: Old MacDonald ("feirm" as two syllables, "gog", "le hoinc oinc"); Baa Baa Black Sheep ("Tá, tá, tá mo mhála lán!"); This Old Man ("le cnig cnag is patapat", "rith sé abhaile go beo"); Row Row Row Your Boat ("Seol", "lúcháireach"); Yankee Doodle ("Dúdlí Beag", "seinm" as two syllables); Are You Sleeping ("Id' chodladh fós?"); Jack and Jill ("Seán is Síle", "le torann mór").

Song titles:

| English | Irish | OK? / correction |
|---|---|---|
| Twinkle Twinkle Little Star | Réaltín, Réaltín |  |
| Baa, Baa, Black Sheep | A Chaora Dhubh |  |
| Mary Had a Little Lamb | Máire agus an tUan |  |
| Row, Row, Row Your Boat | Seol do Bhád |  |
| Are You Sleeping? | A Sheáin Bhig |  |
| Hot Cross Buns | Cístí Te |  |
| Rain, Rain, Go Away | Báisteach, Imigh Uainn |  |
| Happy Birthday | Lá Breithe Sona |  |
| London Bridge Is Falling Down | Droichead Mór |  |
| Old MacDonald Had a Farm | Bhí Feirm ag Seán |  |
| This Old Man | An Seanfhear Beag |  |
| Incy Wincy Spider | An Damhán Alla |  |
| Hickory Dickory Dock | Tic Toc, an Clog |  |
| Jack and Jill | Seán agus Síle |  |
| Yankee Doodle | Dúdlí Beag |  |
| Jingle Bells | Cloigín Beag |  |

Picture descriptions (read by screen readers):

| English | Irish | OK? / correction |
|---|---|---|
| A smiling yellow star shining in the night sky above quiet hills | Réaltín buí ag soilsiú sa spéir os cionn na gcnoc |  |
| A black sheep in a green field beside three bags of wool | Caora dhubh i bpáirc ghlas in aice le trí mhála olla |  |
| A little white lamb with a red bow among daisies | Uan beag bán le ribín dearg i measc nóiníní |  |
| A little wooden rowing boat on a calm river at sunset | Bád beag adhmaid ar abhainn chiúin le luí na gréine |  |
| A sleepy moon and a little bell ringing at sunrise | Gealach chodlatach agus clog beag ag bualadh le héirí na gréine |  |
| Three warm buns with crosses on a blue plate | Trí chíste te le crosa orthu ar phláta gorm |  |
| A grey rain cloud over a yellow umbrella and puddles | Scamall báistí liath agus scáth fearthainne buí faoi |  |
| A birthday cake with three candles and colourful bunting | Cáca lá breithe le trí choinneal agus bratacha daite |  |
| A stone bridge with arches over a blue river | Droichead cloiche le háirsí thar abhainn ghorm |  |
| A red barn with a cow, a pig and a hen in the farmyard | Scioból dearg le bó, muc agus cearc sa chlós |  |
| A happy dog with a bone next to a little drum | Madra sona le cnámh in aice le druma beag |  |
| A small friendly spider on a drainpipe with raindrops and a smiling sun | Damhán alla beag cairdiúil ar phíobán, le braonta báistí agus grian gheal |  |
| A tall wooden clock with a little grey mouse climbing up it | Clog ard adhmaid agus luchóg bheag liath ag dreapadh suas air |  |
| A green hill with a well and a wooden bucket at the top | Cnoc glas le tobar agus buicéad adhmaid ar a bharr |  |
| A small brown pony and a hat with a feather in it | Capaillín donn agus hata le cleite ann |  |
| Two golden jingle bells tied with a red ribbon, with snowflakes | Dhá chloigín órga ceangailte le ribín dearg, le calóga sneachta |  |

Words on the Sing along screens:

| English | Irish | OK? / correction |
|---|---|---|
| Sing along | Canaimis le chéile |  |
| Pick a song. The words light up as the tune plays, so your child can sing along at their own pace. | Roghnaigh amhrán. Lasann na focail de réir mar a sheinntear an fonn, ionas gur féidir le do pháiste canadh ar a luas féin. |  |
| All | Gach ceann |  |
| Calm | Ciúin |  |
| Lively | Bríomhar |  |
| Songs | Amhráin |  |
| No songs here yet. | Níl amhráin anseo fós. |  |
| Play | Seinn |  |
| Pause | Sos |  |
| Start again | Tosaigh arís |  |
| Repeat | Arís is arís |  |
| Speed | Luas |  |
| Slower | Níos moille |  |
| Faster | Níos tapúla |  |
| All songs | Na hamhráin go léir |  |
| Song not found. | Níor aimsíodh an t-amhrán. |  |
| Language | Teanga |  |
| Verse | Véarsa |  |


## 12. Numbers

Emma will say numbers on their own (counting: "a haon, a dó, a trí" — please confirm the forms below) and **inside phrases** where the noun follows the number. For the phrases, please write out how each should be said for 1, 2, 3 … 10 (and the pattern for 11–20 and tens), e.g. "nóiméad amháin fágtha / dhá nóiméad fágtha / trí nóiméad fágtha". The recordings will follow what you write.

| English | Irish (as written) | How to say it with 1, 2, 3 … (please write out) |
|---|---|---|
| {n} games, then all done | Cluichí inniu: {n} |  |
| Card {n}, face down | Cárta {n}, bunoscionn |  |
| {n} more, then {next}. | {n} eile, ansin: {next}. |  |
| You played {n} games. Your sticker book has {s} stickers. | Cluichí a d'imir tú: {n}. Greamáin i do leabhar: {s}. |  |
| You played {n} games. | Cluichí a d'imir tú: {n}. |  |
| {n} min | {n} nóim. |  |
| Shadow of {n} | Scáth: {n} |  |
| {n} pictures | Pictiúir: {n} |  |
| Find {n} | Aimsigh {n} |  |
| Size {n} | Méid {n} |  |
| Piece of {n} | Píosa: {n} |  |
| {n} more, then {reward} | {n} eile, ansin: {reward} |  |
| {n} minutes left | {n} nóiméad fágtha |  |
| Step {n} of {m} | Céim {n} as {m} |  |

| Number | Counting form used | OK? / correction |
|---|---|---|
| 0 | a náid |  |
| 1 | a haon |  |
| 2 | a dó |  |
| 3 | a trí |  |
| 4 | a ceathair |  |
| 5 | a cúig |  |
| 6 | a sé |  |
| 7 | a seacht |  |
| 8 | a hocht |  |
| 9 | a naoi |  |
| 10 | a deich |  |
| 11 | a haon déag |  |
| 12 | a dó dhéag |  |
| 13 | a trí déag |  |
| 14 | a ceathair déag |  |
| 15 | a cúig déag |  |
| 16 | a sé déag |  |
| 17 | a seacht déag |  |
| 18 | a hocht déag |  |
| 19 | a naoi déag |  |
| 20 | fiche |  |


## 13. Questions for you

1. **Alphabet cards.** English cards say "A, for apple" in one go. Irish cards currently say the letter, a pause, then the word ("B … bó"). Would "B mar bhó" be natural for a small child, and if so, which letters mutate the word after "mar"? Or is letter-then-word better?
2. **Letter names.** How should each of the 18 letters be named aloud for a child (á, bé, cé … or the English names)?
3. **Praise.** English says "Yes! That's the train." Irish says "Maith thú! traein." Should there be an article ("an traein") or a different shape?
4. **Numbers before nouns** — see section 12.
5. **Names.** When the child's name is added to a phrase ("Inniu, {name}"), the recording of the name is in the parent's own voice. Is there anything about the words around the name that should change (vocative "a Sheáin" can't be done, since the name is a recording)?
6. **The Grown-ups area** — any phrase that is grammatically fine but would read oddly to a parent or teacher.
7. **Your name for the credits page**, and the dialect to name there.

_1065 items in this sheet._
