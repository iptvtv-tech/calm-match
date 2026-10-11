/* My stories and how-to steps: picture pages with a sentence or two, read aloud, made and changed by grown-ups.
   Starter stories are in English and Irish, and written to be edited: swap in names, places and your own photos.
   (Social Stories™ is Carol Gray's trademark, so these are called "My stories".) */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc, t = function (k, v) { return CM.t(k, v); };
  var $ = function (id) { return document.getElementById(id); };

  var TEMPLATES = [
    { key: "dentist", kind: "story", title: "Going to the dentist", pages: [
      ["s:dentist", "Sometimes I go to the dentist. The dentist helps keep my teeth healthy."],
      ["s:sit", "First I wait in the waiting room. I can bring something to hold or look at."],
      ["e:💺", "The dentist asks me to sit in a big chair. The chair can move up and down."],
      ["s:teeth", "The dentist looks at my teeth with a small mirror and a light."],
      ["e:😮", "I open my mouth wide. I can count slowly to ten while the dentist looks."],
      ["s:finished", "When the dentist is finished, I can go home."] ] },
    { key: "haircut", kind: "story", title: "Getting a haircut", pages: [
      ["s:haircut", "Sometimes my hair gets long. Then I get a haircut."],
      ["e:🧥", "The hairdresser puts a cape around me. It keeps hair off my clothes."],
      ["e:✂️", "The scissors make a snipping sound. Clippers can buzz. That is OK."],
      ["s:break", "Little hairs can tickle. I can ask for a break."],
      ["s:look", "I can look at something I like while I wait."],
      ["s:finished", "When it is finished, my hair is short and tidy."] ] },
    { key: "school", kind: "story", title: "My new school", pages: [
      ["s:school", "Soon I am going to a new school."],
      ["s:teacher", "My teacher's name is ______. My teacher is there to help me."],
      ["s:classroom", "My classroom has tables, chairs and lots of things to learn with."],
      ["s:queue", "Sometimes we line up to go outside or to have lunch."],
      ["s:lunchbox", "I bring my lunch box. I eat my lunch at school."],
      ["s:help", "If I need help, I can ask my teacher."],
      ["s:home", "At the end of the day, someone I know brings me home."] ] },
    { key: "fire", kind: "story", title: "Fire drill", pages: [
      ["e:🔔", "Sometimes at school there is a fire drill. A fire drill is practice."],
      ["s:loud", "The alarm is very loud. I can cover my ears."],
      ["s:queue", "We line up and walk outside with the teacher."],
      ["s:outside", "We wait outside together until the teacher says we can go back in."],
      ["s:good", "Practising helps everyone know what to do."] ] },
    { key: "waiting", kind: "story", title: "Waiting", pages: [
      ["s:wait", "Sometimes I have to wait."],
      ["s:clock", "Waiting can feel long."],
      ["s:sit", "While I wait, I can sit, look at a book or squeeze my hands."],
      ["s:quiet", "I can take slow breaths, in and out."],
      ["s:good", "When waiting is finished, it is my turn."] ] },
    { key: "sharing", kind: "story", title: "Sharing and taking turns", pages: [
      ["s:share", "Sometimes I share toys with other children."],
      ["s:play", "When we share, we can play together."],
      ["e:⏳", "I can ask: can I have a turn when you are finished?"],
      ["s:wait", "Waiting for my turn is OK. My turn will come."],
      ["s:happy", "Sharing can make other people feel happy."] ] },
    { key: "baby", kind: "story", title: "A new baby", pages: [
      ["s:baby", "Our family is going to have a new baby."],
      ["e:👶", "Babies cry. Crying is how babies tell us what they need."],
      ["s:quiet", "Sometimes the house needs to be quiet while the baby sleeps."],
      ["s:hug", "Mum and Dad still love me."],
      ["s:help", "I can help, like singing a song to the baby."] ] },
    { key: "plane", kind: "story", title: "Going on a plane", pages: [
      ["s:plane", "We are going on a plane."],
      ["e:🧳", "We bring our bags to the airport."],
      ["s:queue", "At the airport we wait in lines. There can be lots of people."],
      ["s:sit", "On the plane, I sit in my seat and wear a seat belt."],
      ["s:loud", "The plane is loud when it goes up. My ears might feel funny. I can swallow or chew."],
      ["s:good", "When the plane lands, we get off."] ] },
    { key: "wash", kind: "howto", title: "Washing hands", pages: [
      ["s:tap", "Turn on the tap."], ["x:soap", "Put soap on your hands."], ["x:rub", "Rub your hands together: the fronts, the backs and between your fingers."],
      ["x:drip", "Rinse off the soap with water."], ["s:towel", "Dry your hands with the towel."], ["s:finished", "All clean!"] ] },
    { key: "teeth", kind: "howto", title: "Brushing teeth", pages: [
      ["s:toothpaste", "Put a little toothpaste on your brush."], ["s:brushteeth", "Brush your top teeth."], ["s:brushteeth", "Brush your bottom teeth."],
      ["s:mouth", "Brush the fronts and the backs."], ["s:sink", "Spit the toothpaste into the sink."], ["s:rinse", "Rinse your toothbrush under the tap."],
      ["s:finished", "All done. Clean teeth!"] ] },
    { key: "dressed", kind: "howto", title: "Getting dressed", pages: [
      ["s:pants", "Put on your pants."], ["e:👕", "Put on your T-shirt."], ["e:👖", "Put on your trousers."],
      ["e:🧦", "Put on your socks."], ["s:trainers", "Put on your shoes."], ["s:finished", "I'm dressed!"] ] },
    { key: "toilet", kind: "howto", title: "Using the toilet", pages: [
      ["s:toilet", "Go to the toilet."], ["e:👖", "Pull down your trousers and pants."], ["e:🚽", "Sit on the toilet."],
      ["e:🧻", "Wipe with toilet paper."], ["s:flush", "Flush the toilet."], ["s:washhands", "Wash your hands."] ] }
  ];


  // Irish versions of the starter stories, page by page. To be checked by a fluent speaker.
  var GA = {
    dentist: ["Ag dul chuig an bhfiaclóir", ["Uaireanta téim chuig an bhfiaclóir. Cabhraíonn an fiaclóir liom mo chuid fiacla a choinneáil sláintiúil.",
      "Ar dtús fanaim sa seomra feithimh. Is féidir liom rud éigin a thabhairt liom le coinneáil nó le féachaint air.",
      "Iarrann an fiaclóir orm suí i gcathaoir mhór. Is féidir leis an gcathaoir dul suas agus síos.",
      "Féachann an fiaclóir ar mo chuid fiacla le scáthán beag agus solas.",
      "Osclaím mo bhéal go leathan. Is féidir liom comhaireamh go mall go dtí a deich fad is a fhéachann an fiaclóir.",
      "Nuair a bhíonn an fiaclóir críochnaithe, is féidir liom dul abhaile."]],
    haircut: ["Bearradh gruaige", ["Uaireanta fásann mo chuid gruaige fada. Ansin faighim bearradh gruaige.",
      "Cuireann an gruagaire clóca timpeall orm. Coinníonn sé an ghruaig de mo chuid éadaí.",
      "Déanann an siosúr fuaim bheag. Is féidir leis na bearrthóirí dordán a dhéanamh. Tá sé sin ceart go leor.",
      "Is féidir le ribí beaga gruaige cigilt a dhéanamh. Is féidir liom sos a iarraidh.",
      "Is féidir liom féachaint ar rud éigin is maith liom fad is a fhanaim.",
      "Nuair a bhíonn sé críochnaithe, bíonn mo chuid gruaige gearr agus néata."]],
    school: ["Mo scoil nua", ["Go luath beidh mé ag dul chuig scoil nua.",
      "______ is ainm do mo mhúinteoir. Tá mo mhúinteoir ann le cabhrú liom.",
      "Tá boird, cathaoireacha agus a lán rudaí le foghlaim leo i mo sheomra ranga.",
      "Uaireanta seasaimid i líne le dul amach nó le lón a ithe.",
      "Tugaim mo bhosca lóin liom. Ithim mo lón ar scoil.",
      "Má bhíonn cabhair uaim, is féidir liom ceist a chur ar mo mhúinteoir.",
      "Ag deireadh an lae, tugann duine a bhfuil aithne agam air abhaile mé."]],
    fire: ["Druil dóiteáin", ["Uaireanta bíonn druil dóiteáin ar scoil. Is cleachtadh é druil dóiteáin.",
      "Tá an t-aláram an-ard. Is féidir liom mo chluasa a chlúdach.",
      "Seasaimid i líne agus siúlaimid amach leis an múinteoir.",
      "Fanaimid amuigh le chéile go dtí go ndeir an múinteoir gur féidir linn dul ar ais isteach.",
      "Cabhraíonn cleachtadh le gach duine fios a bheith acu cad atá le déanamh."]],
    waiting: ["Ag fanacht", ["Uaireanta caithfidh mé fanacht.",
      "Is féidir le fanacht a bheith fada.",
      "Fad is a fhanaim, is féidir liom suí, féachaint ar leabhar nó mo lámha a fháscadh.",
      "Is féidir liom análú go mall, isteach agus amach.",
      "Nuair a bhíonn an fanacht thart, is é mo sheal é."]],
    sharing: ["Ag roinnt agus ag glacadh sealanna", ["Uaireanta roinnim bréagáin le páistí eile.",
      "Nuair a roinnimid, is féidir linn súgradh le chéile.",
      "Is féidir liom a fhiafraí: an féidir liom seal a fháil nuair a bheidh tú críochnaithe?",
      "Tá sé ceart go leor fanacht le mo sheal. Tiocfaidh mo sheal.",
      "Cuireann roinnt áthas ar dhaoine eile."]],
    baby: ["Leanbh nua", ["Tá leanbh nua ag teacht chuig ár dteaghlach.",
      "Caoineann leanaí. Is mar sin a insíonn leanaí dúinn cad a theastaíonn uathu.",
      "Uaireanta caithfidh an teach a bheith ciúin fad is a chodlaíonn an leanbh.",
      "Tá grá ag Mam agus Daid dom fós.",
      "Is féidir liom cabhrú, mar shampla amhrán a chanadh don leanbh."]],
    plane: ["Ag dul ar eitleán", ["Táimid ag dul ar eitleán.",
      "Tugaimid ár málaí chuig an aerfort.",
      "Ag an aerfort fanaimid i línte. Is féidir go mbeidh a lán daoine ann.",
      "Ar an eitleán, suím i mo shuíochán agus caithim crios sábhála.",
      "Bíonn an t-eitleán glórach nuair a théann sé suas. B'fhéidir go mbraithfidh mo chluasa aisteach. Is féidir liom slogadh nó cogaint.",
      "Nuair a thuirlingíonn an t-eitleán, téimid amach."]],
    wash: ["Lámha a ní", ["Cas air an sconna.", "Cuir gallúnach ar do lámha.", "Cuimil do lámha le chéile: an tosach, an cúl agus idir do mhéara.",
      "Sruthlaigh an ghallúnach le huisce.", "Triomaigh do lámha leis an tuáille.", "Glan ar fad!"]],
    teeth: ["Fiacla a scuabadh", ["Cuir beagán taos fiacla ar do scuab.", "Scuab do chuid fiacla thuas.", "Scuab do chuid fiacla thíos.",
      "Scuab an tosach agus an cúl.", "Caith amach an taos fiacla sa doirteal.", "Sruthlaigh do scuab fiacla faoin sconna.", "Críochnaithe. Fiacla glana!"]],
    dressed: ["Ag cur éadaí orm", ["Cuir ort do chuid fo-éadaí.", "Cuir ort do T-léine.", "Cuir ort do bhríste.", "Cuir ort do stocaí.", "Cuir ort do bhróga.", "Tá mo chuid éadaí orm!"]],
    toilet: ["An leithreas a úsáid", ["Téigh go dtí an leithreas.", "Tarraing síos do bhríste agus do chuid fo-éadaí.", "Suigh ar an leithreas.",
      "Glan tú féin le páipéar leithris.", "Sruthlaigh an leithreas.", "Nigh do lámha."]]
  };
  // English sentence → Irish, for filling in Irish on saved copies of the starter stories.
  var EN_GA = {}, TITLE_GA = {};
  TEMPLATES.forEach(function (tp) { var g = GA[tp.key]; if (!g) return; TITLE_GA[tp.title] = g[0]; tp.pages.forEach(function (p, i) { if (g[1][i]) EN_GA[p[1]] = g[1][i]; }); });
  function addIrish() {
    CM.lib.stories().forEach(function (st) {
      var changed = false;
      if (!st.titleGa && TITLE_GA[st.title]) { st.titleGa = TITLE_GA[st.title]; changed = true; }
      st.pages.forEach(function (p) { if (!p.textGa && EN_GA[p.text]) { p.textGa = EN_GA[p.text]; changed = true; } });
      if (changed) CM.lib.saveStory(st);
    });
  }
  // The story's words in the game language: Irish when there is an Irish version, otherwise English.
  var ga = function () { return CM.lang() === "ga"; };
  CM.storyTitle = function (st) { return ga() && st.titleGa ? st.titleGa : st.title; };
  CM.pageText = function (p) { return ga() && p.textGa ? p.textGa : p.text; };

  var h = null;
  // Recordings of a page are kept per language (English recordings from the first version keep their key).
  CM.pageVoiceKey = function (id, i, lang) { return (lang || CM.lang()) === "ga" ? "voice/page/ga/" + id + "/" + i : "voice/page/" + id + "/" + i; };
  function speakPage(st, i) {
    if (CM.voice && CM.voice.playKey(CM.pageVoiceKey(st.id, i))) return;
    var p = st.pages[i], txt = p && CM.pageText(p); if (txt) h.say(txt);
  }

  // The first "Brushing teeth" used emoji that some phones can't show, and a tap for "spit".
  // Saved copies are switched to symbols, leaving any page a grown-up has rewritten alone.
  function repairTeeth() {
    var fix = { "e:🪥": "s:toothpaste", "x:brush": "s:brushteeth" }, changed = false;
    CM.lib.stories("howto").forEach(function (st) {
      if (!st.pages.some(function (p) { return fix[p.pic]; })) return;
      st.pages.forEach(function (p) {
        if (fix[p.pic]) p.pic = fix[p.pic];
        if (p.pic === "s:teeth" && p.text === "Brush the fronts and the backs.") p.pic = "s:mouth";
        if (p.pic === "e:🚰" && p.text === "Spit out the toothpaste.") { p.pic = "s:sink"; p.text = "Spit the toothpaste into the sink."; }
      });
      var last = st.pages[st.pages.length - 1];
      if (last && last.pic === "s:finished" && !st.pages.some(function (p) { return p.pic === "s:rinse"; }) && st.title === "Brushing teeth")
        st.pages.splice(st.pages.length - 1, 0, { pic: "s:rinse", text: "Rinse your toothbrush under the tap." });
      CM.lib.saveStory(st); changed = true;
    });
    return changed;
  }

  CM.stories = {
    TEMPLATES: TEMPLATES,
    init: function (helpers) { h = helpers; try { repairTeeth(); } catch (e) {} try { addIrish(); } catch (e) {} },
    fromTemplate: function (key) {
      var tp = TEMPLATES.find(function (x) { return x.key === key; }); if (!tp) return null;
      var g = GA[key] || ["", []];
      return CM.lib.saveStory({ title: tp.title, titleGa: g[0], kind: tp.kind, lang: "en", pages: tp.pages.map(function (p, i) { return { pic: p[0], text: p[1], textGa: g[1][i] || "" }; }) });
    },

    // The child's list of stories (from the start screen).
    shelf: function (onClose) {
      var list = CM.lib.stories();
      h.enter();
      h.stage.innerHTML = '<h1 class="say">' + esc(t("myStories")) + '</h1><div class="shelf" role="group" aria-label="' + esc(t("pickStory")) + '">' +
        list.map(function (st) { var p = st.pages[0] || {}; return '<button type="button" class="shelf-item" data-id="' + esc(st.id) + '"><span class="shelf-pic">' + CM.ref(p.pic).html + "</span><b>" + esc(CM.storyTitle(st)) + "</b>" + (st.kind === "howto" ? '<span class="sc-tag next">' + esc(t("howTo")) + "</span>" : "") + "</button>"; }).join("") +
        '</div><button class="big-btn" id="shClose" type="button">' + esc(t("close")) + "</button>";
      h.say(t("pickStory"));
      h.stage.querySelectorAll("[data-id]").forEach(function (b) { b.onclick = function () { CM.stories.read(b.dataset.id, function () { CM.stories.shelf(onClose); }); }; });
      $("shClose").onclick = function () { h.exit(); if (onClose) onClose(); };
    },

    // Read one story or how-to, a page at a time. onDone runs after the last page or Close.
    read: function (id, onDone) {
      var st = CM.lib.story(id); if (!st || !st.pages.length) return onDone && onDone();
      h.enter();
      var i = 0, how = st.kind === "howto";
      var render = function () {
        var end = i >= st.pages.length, p = st.pages[Math.min(i, st.pages.length - 1)];
        var media = p.video && CM.media.has(p.video) ? '<video class="story-video" src="' + CM.media.url(p.video) + '" controls playsinline preload="metadata"></video>' : '<div class="story-pic">' + CM.ref(p.pic).html + "</div>";
        h.stage.innerHTML = '<p class="label">' + esc(CM.storyTitle(st)) + (how && !end ? " · " + esc(t("stepNofM", { n: i + 1, m: st.pages.length })) : "") + "</p>" +
          (how ? '<ol class="howstrip" aria-label="' + esc(t("allSteps")) + '">' + st.pages.map(function (q, k) { return '<li class="' + (k < i ? "done" : k === i ? "now" : "") + '">' + CM.ref(q.pic).html + "</li>"; }).join("") + "</ol>" : "") +
          (end ? '<h1 class="say">' + esc(how ? t("dayDone") : t("theEnd")) + "</h1>" : media + '<p class="story-text">' + esc(CM.pageText(p)) + "</p>") +
          '<div class="row">' + (i > 0 ? '<button class="ghost-btn" id="stBack" type="button">' + esc(t("back")) + "</button>" : "") +
          (end ? '<button class="big-btn" id="stClose" type="button">' + esc(t("ok")) + "</button>"
            : '<button class="big-btn" id="stNext" type="button">' + esc(how ? "✓ " + t("stepDone") : t("next")) + "</button>") +
          (!end && CM.store.S().speech ? '<button class="again" id="stAgain" type="button">' + esc(t("sayAgain")) + "</button>" : "") +
          (!end ? '<button class="small-btn" id="stX" type="button">' + esc(t("close")) + "</button>" : "") + "</div>";
        if ($("stNext")) $("stNext").onclick = function () { i++; render(); if (i < st.pages.length) speakPage(st, i); else h.say(how ? t("dayDone") : t("theEnd")); var b = $("stNext") || $("stClose"); if (b) b.focus(); };
        if ($("stBack")) $("stBack").onclick = function () { i = Math.max(0, i - 1); render(); speakPage(st, i); };
        if ($("stAgain")) $("stAgain").onclick = function () { speakPage(st, i); };
        var close = function () { if (onDone) onDone(); else h.exit(); };
        if ($("stClose")) $("stClose").onclick = close;
        if ($("stX")) $("stX").onclick = close;
      };
      render(); speakPage(st, 0);
    },

    /* ---------- grown-ups: list and editor (Stories tab) ---------- */
    renderTab: function (box, helpers) {
      var editing = null;
      function listView() {
        var all = CM.lib.stories();
        var item = function (st) {
          return '<li class="st-row"><span class="st-pic">' + CM.ref((st.pages[0] || {}).pic).html + '</span><div class="st-info"><b>' + esc(st.title) + (st.titleGa ? ' <span class="note">· ' + esc(st.titleGa) + "</span>" : "") + '</b><span class="note">' + (st.kind === "howto" ? "How-to, " : "Story, ") + st.pages.length + " pages</span></div>" +
            '<div class="row start"><button class="small-btn primary" type="button" data-show="' + st.id + '">Show</button><button class="small-btn" type="button" data-edit="' + st.id + '">Edit</button>' +
            '<button class="small-btn" type="button" data-print="' + st.id + '">Print</button><button class="small-btn danger" type="button" data-del="' + st.id + '">Delete</button></div></li>';
        };
        box.innerHTML =
          '<div><h3>Stories and how-tos</h3><p class="note">Short picture stories read aloud, for things that are new or hard (the dentist, a new school), and step-by-step how-tos (washing hands). Your child finds them under "My stories" on the start screen, and any story or how-to can be added to a schedule step. Everything stays on this device.</p>' +
          (all.length ? '<ul class="st-list">' + all.map(item).join("") + "</ul>" : '<p class="note">No stories yet. Start from one below.</p>') + "</div>" +
          '<div><h3>Start a story</h3><p class="note">Starter stories are in English. Change any words, including into Irish, and swap in names and your own photos.</p><div class="chips" id="tplStory"></div></div>' +
          '<div><h3>Start a how-to</h3><div class="chips" id="tplHow"></div></div>' +
          '<div class="row start"><button class="small-btn" type="button" id="blankStory">Blank story</button><button class="small-btn" type="button" id="blankHow">Blank how-to</button></div>' +
          '<p class="note" id="stMsg" aria-live="polite"></p>';
        var tpl = function (el, kind) {
          el.innerHTML = TEMPLATES.filter(function (x) { return x.kind === kind; }).map(function (x) { return '<button type="button" class="chip" data-tpl="' + x.key + '">' + CM.ref(x.pages[0][0]).html.replace(/class="(sym|ph)"/, 'class="$1 tiny"') + " " + esc(x.title) + "</button>"; }).join("");
        };
        tpl($("tplStory"), "story"); tpl($("tplHow"), "howto");
        box.querySelectorAll("[data-tpl]").forEach(function (b) { b.onclick = function () { var id = CM.stories.fromTemplate(b.dataset.tpl); editing = CM.lib.story(id); editView(); }; });
        $("blankStory").onclick = function () { editing = { title: "My story", kind: "story", lang: CM.lang(), pages: [{ pic: "s:happy", text: "" }] }; editView(); };
        $("blankHow").onclick = function () { editing = { title: "How to", kind: "howto", lang: CM.lang(), pages: [{ pic: "s:finished", text: "" }] }; editView(); };
        box.querySelectorAll("[data-show]").forEach(function (b) { b.onclick = function () { helpers.showChild(function () { CM.stories.read(b.dataset.show); }); }; });
        box.querySelectorAll("[data-edit]").forEach(function (b) { b.onclick = function () { editing = CM.lib.story(b.dataset.edit); editView(); }; });
        box.querySelectorAll("[data-print]").forEach(function (b) { b.onclick = function () { printStory(CM.lib.story(b.dataset.print)); }; });
        box.querySelectorAll("[data-del]").forEach(function (b) { CM.ui.twoTap(b, "Delete", "Tap again to delete", function () { CM.lib.removeStory(b.dataset.del); listView(); }); });
      }
      function editView() {
        var st = editing;
        box.innerHTML = '<div><h3>' + (st.id ? "Edit" : "New") + " " + (st.kind === "howto" ? "how-to" : "story") + '</h3>' +
          '<label class="field">Title<input type="text" id="stTitle" maxlength="60" value="' + esc(st.title) + '"></label>' +
          '<label class="field">Title in Irish (optional)<input type="text" id="stTitleGa" maxlength="60" value="' + esc(st.titleGa || "") + '"></label>' +
          '<p class="note">Each page can have Irish words too. When the games are set to Gaeilge, your child sees the Irish where there is some, and the English where there isn\'t.</p>' +
          (st.kind === "story" ? '<p class="note">Tips: write from your child\'s point of view ("I", "my"), describe what happens and what others do, and say what your child can do, not what they must not do. Keep each page to one or two short sentences.</p>' : '<p class="note">One step per page, in order. Start each step with an action word: "Turn on the tap".</p>') +
          '<ol class="pg-list" id="pgList"></ol><div class="row start"><button class="small-btn" type="button" id="pgAdd">Add a page</button></div>' +
          '<div class="row start"><button class="small-btn primary" type="button" id="stSave">Save</button><button class="small-btn" type="button" id="stCancel">Cancel</button></div><p class="note" id="stMsg" aria-live="polite"></p></div>';
        renderPages();
        $("stTitle").oninput = function () { st.title = $("stTitle").value; };
        $("stTitleGa").oninput = function () { st.titleGa = $("stTitleGa").value; };
        $("pgAdd").onclick = function () { if (st.pages.length >= 30) return; st.pages.push({ pic: "e:🙂", text: "" }); renderPages(); };
        $("stSave").onclick = function () {
          st.title = $("stTitle").value.trim() || "My story"; st.titleGa = $("stTitleGa").value.trim();
          try { editing.id = CM.lib.saveStory(st); } catch (e) { $("stMsg").textContent = e.message; return; }
          editing = null; listView(); $("stMsg").textContent = "Saved.";
        };
        $("stCancel").onclick = function () { editing = null; listView(); };
      }
      function renderPages() {
        var st = editing, ol = $("pgList");
        ol.innerHTML = st.pages.map(function (p, k) {
          var vid = p.video && CM.media.has(p.video);
          return '<li class="pg"><div class="pg-pic">' + (vid ? '<span class="emo">🎬</span>' : CM.ref(p.pic).html) + '</div><div class="pg-body">' +
            '<label class="field">Page ' + (k + 1) + '<textarea data-txt="' + k + '" rows="2" maxlength="300">' + esc(p.text) + "</textarea></label>" +
            '<label class="field">Page ' + (k + 1) + ' in Irish (optional)<textarea data-ga="' + k + '" rows="2" maxlength="300">' + esc(p.textGa || "") + "</textarea></label>" +
            '<div class="row start"><button class="small-btn" type="button" data-pic="' + k + '">Picture</button>' +
            '<label class="small-btn pbtn">Photo<input type="file" accept="image/*" data-photo="' + k + '" class="visually-hidden"></label>' +
            (CM.video ? '<label class="small-btn pbtn">' + (vid ? "Change video" : "Video") + '<input type="file" accept="video/*" data-video="' + k + '" class="visually-hidden"></label>' + (vid ? '<button class="small-btn" type="button" data-novid="' + k + '">Remove video</button>' : "") : "") +
            (CM.voice && st.id ? CM.voice.button(CM.pageVoiceKey(st.id, k)) : "") +
            '<button class="se-btn" type="button" data-mv="-1" data-k="' + k + '" aria-label="Move page ' + (k + 1) + ' earlier"' + (k ? "" : " disabled") + '>↑</button>' +
            '<button class="se-btn" type="button" data-mv="1" data-k="' + k + '" aria-label="Move page ' + (k + 1) + ' later"' + (k < st.pages.length - 1 ? "" : " disabled") + '>↓</button>' +
            '<button class="se-btn" type="button" data-rm="' + k + '" aria-label="Remove page ' + (k + 1) + '"' + (st.pages.length > 1 ? "" : " disabled") + ">✕</button></div><div class=\"pg-pick\" id=\"pgPick" + k + '"></div></div></li>';
        }).join("");
        ol.querySelectorAll("[data-txt]").forEach(function (ta) { ta.oninput = function () { st.pages[+ta.dataset.txt].text = ta.value; }; });
        ol.querySelectorAll("[data-ga]").forEach(function (ta) { ta.oninput = function () { st.pages[+ta.dataset.ga].textGa = ta.value; }; });
        ol.querySelectorAll("[data-pic]").forEach(function (b) { b.onclick = function () { var k = +b.dataset.pic; CM.ui.pickRef($("pgPick" + k), function (r) { st.pages[k].pic = r; renderPages(); }, { start: "sym" }); }; });
        ol.querySelectorAll("[data-photo]").forEach(function (inp) { inp.onchange = function () {
          var k = +inp.dataset.photo, f = inp.files && inp.files[0]; if (!f) return;
          CM.shrinkImage(f, 640, false).then(function (d) { var key = "story/" + CM.uid("p"); return CM.media.put(key, d).then(function () { st.pages[k].pic = "m:" + key; CM.media.keep(); renderPages(); }); })
            .catch(function (e) { $("stMsg").textContent = e.message; });
        }; });
        ol.querySelectorAll("[data-video]").forEach(function (inp) { inp.onchange = function () {
          var k = +inp.dataset.video, f = inp.files && inp.files[0]; if (!f) return;
          $("stMsg").textContent = "Saving the video…";
          CM.video.save(f).then(function (key) { if (st.pages[k].video) CM.media.del(st.pages[k].video); st.pages[k].video = key; $("stMsg").textContent = "Video saved on this device."; renderPages(); })
            .catch(function (e) { $("stMsg").textContent = e.message; });
        }; });
        ol.querySelectorAll("[data-novid]").forEach(function (b) { b.onclick = function () { var k = +b.dataset.novid; CM.media.del(st.pages[k].video); st.pages[k].video = null; renderPages(); }; });
        ol.querySelectorAll("[data-mv]").forEach(function (b) { b.onclick = function () { var k = +b.dataset.k, j = k + +b.dataset.mv; var x = st.pages[k]; st.pages[k] = st.pages[j]; st.pages[j] = x; renderPages(); }; });
        ol.querySelectorAll("[data-rm]").forEach(function (b) { b.onclick = function () { st.pages.splice(+b.dataset.rm, 1); renderPages(); }; });
        if (CM.voice) CM.voice.bind(ol);
      }
      function printStory(st) {
        CM.ui.print('<div class="pr-story">' + st.pages.map(function (p, k) {
          return '<div class="pr-page"><div class="pr-pic">' + CM.ref(p.pic).html + "</div><p>" + (st.kind === "howto" ? "<b>" + (k + 1) + ".</b> " : "") + esc(CM.pageText(p)) + "</p></div>";
        }).join("") + "</div>", CM.storyTitle(st));
      }
      if (editing) editView(); else listView();
    }
  };
})();
