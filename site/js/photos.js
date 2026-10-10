/* Photo mode. Parents can add their own photos for each picture in a theme.
   Photos are shrunk on the device and saved on the device only (js/media.js). They are never uploaded.
   A site owner can also ship a licensed photo pack in site/photos/<theme>/<name>.jpg (see photos/README.txt). */
(function () {
  "use strict";
  var CM = window.CM, OLD = "calm-match-photos";
  var slug = function (item) { return String(item[1]).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  var key = function (theme, item) { return "photo/" + theme + "/" + slug(item); };

  // Photos saved by earlier versions lived in the browser's small store: move them across once.
  CM.media.ready.then(function () {
    var old = CM.safeGet(OLD); if (!old) return;
    var all; try { all = JSON.parse(old) || {}; } catch (e) { all = {}; }
    var jobs = [];
    Object.keys(all).forEach(function (th) { Object.keys(all[th] || {}).forEach(function (s) {
      var k = "photo/" + th + "/" + s; if (!CM.media.has(k)) jobs.push(CM.media.put(k, all[th][s]));
    }); });
    return Promise.all(jobs).then(function () { if (CM.media.saved()) try { localStorage.removeItem(OLD); } catch (e) {} });
  }).catch(function () {});

  CM.photos = {
    slug: slug,
    own: function (theme, item) { return CM.media.get(key(theme, item)); },
    pack: function (theme, item) {
      var packs = (CM.cfg && CM.cfg.photoPacks) || [];
      return packs.indexOf(theme) >= 0 ? "photos/" + theme + "/" + slug(item) + ".jpg" : null;
    },
    src: function (theme, item) { return this.own(theme, item) || this.pack(theme, item); },
    count: function (theme) { return CM.media.keys("photo/" + theme + "/").length; },
    hasAny: function (theme) { return this.count(theme) > 0 || ((CM.cfg && CM.cfg.photoPacks) || []).indexOf(theme) >= 0; },
    remove: function (theme, item) { return CM.media.del(key(theme, item)); },
    removeAll: function () { try { localStorage.removeItem(OLD); } catch (e) {} return CM.media.delPrefix("photo/"); },
    // Crop to a square, shrink to 320px, save. Resolves true when saved.
    add: function (theme, item, file) {
      return CM.shrinkImage(file, 320).then(function (data) { return CM.media.put(key(theme, item), data); }).then(function () { CM.media.keep(); return true; });
    }
  };

  // Picture for a theme item: a photo when photo mode is on and one exists, otherwise the emoji.
  CM.pic = function (item, themeKey) {
    var S = CM.store.S(), tk = themeKey || S.theme;
    if (S.photos && CM.THEMES[tk]) {
      var src = CM.photos.src(tk, item);
      if (src) return '<img class="ph" src="' + src + '" alt="" data-fb="' + item[0] + '">';
    }
    return item[0];
  };
  // If a photo fails to load, show the emoji instead.
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && t.dataset && t.dataset.fb) t.replaceWith(document.createTextNode(t.dataset.fb));
  }, true);
})();
