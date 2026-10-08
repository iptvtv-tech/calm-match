/* Photo mode. Parents can add their own photos for each picture in a theme.
   Photos are shrunk on the device and saved on the device only. They are never uploaded.
   A site owner can also ship a licensed photo pack in site/photos/<theme>/<name>.jpg (see photos/README.txt). */
(function () {
  "use strict";
  var CM = window.CM, KEY = "calm-match-photos", cache = null;

  function load() { if (cache) return cache; try { cache = JSON.parse(CM.safeGet(KEY) || "{}"); } catch (e) { cache = {}; } return cache; }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(cache)); return true; } catch (e) { return false; }
  }
  var slug = function (item) { return String(item[1]).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };

  CM.photos = {
    slug: slug,
    own: function (theme, item) { var t = load()[theme]; return t ? t[slug(item)] || null : null; },
    pack: function (theme, item) {
      var packs = (CM.cfg && CM.cfg.photoPacks) || [];
      return packs.indexOf(theme) >= 0 ? "photos/" + theme + "/" + slug(item) + ".jpg" : null;
    },
    src: function (theme, item) { return this.own(theme, item) || this.pack(theme, item); },
    count: function (theme) { var t = load()[theme] || {}; return Object.keys(t).length; },
    hasAny: function (theme) { return this.count(theme) > 0 || ((CM.cfg && CM.cfg.photoPacks) || []).indexOf(theme) >= 0; },
    remove: function (theme, item) { var c = load(); if (c[theme]) { delete c[theme][slug(item)]; persist(); } },
    removeAll: function () { cache = {}; try { localStorage.removeItem(KEY); } catch (e) {} },
    // Read a chosen file, crop to a square, shrink to 320px JPEG, save. Resolves true when saved.
    add: function (theme, item, file) {
      return new Promise(function (resolve, reject) {
        if (!file || !/^image\//.test(file.type)) return reject(new Error("Please choose a photo file."));
        var url = URL.createObjectURL(file), img = new Image();
        img.onload = function () {
          var s = Math.min(img.naturalWidth, img.naturalHeight), size = Math.min(320, s);
          var c = document.createElement("canvas"); c.width = c.height = size;
          c.getContext("2d").drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
          URL.revokeObjectURL(url);
          var data = c.toDataURL("image/jpeg", 0.8), all = load();
          all[theme] = all[theme] || {}; var before = all[theme][slug(item)];
          all[theme][slug(item)] = data;
          if (!persist()) { if (before) all[theme][slug(item)] = before; else delete all[theme][slug(item)]; return reject(new Error("This device is out of space for photos. Remove some first.")); }
          resolve(true);
        };
        img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("That file couldn't be opened as a photo.")); };
        img.src = url;
      });
    }
  };

  // Picture for a theme item: a photo when photo mode is on and one exists, otherwise the emoji.
  CM.pic = function (item, themeKey) {
    var S = CM.store.S(), tk = themeKey || S.theme;
    if (S.photos) {
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
