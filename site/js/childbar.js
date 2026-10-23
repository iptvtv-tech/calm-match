/* Child mode for Sing along and the Alphabet book.
   Opened from a door on the Play home screen (?from=play), these pages hide the site menu and footer
   and show one big Home button back to Play, so a child never lands on the grown-up website.
   Moving between song list and song, or reloading, keeps child mode; arriving from the website shows the normal site. */
(function () {
  "use strict";
  var q = new URLSearchParams(location.search), on = q.get("from") === "play";
  try {
    if (on) sessionStorage.setItem("cm-child", "1");
    else if (sessionStorage.getItem("cm-child") === "1") {
      var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      var r = document.referrer ? new URL(document.referrer) : null;
      on = (nav && nav.type === "reload") ||
        (!!r && r.origin === location.origin && /\/(singalong|alphabet)\/|\/play\.html$/.test(r.pathname));
    }
    if (!on) sessionStorage.removeItem("cm-child");
  } catch (e) {}
  if (!on) return;

  var lang = q.get("lang");
  if (lang !== "ga" && lang !== "en") {
    try { var db = JSON.parse(localStorage.getItem("calm-match-data") || "null"), p = db && db.profiles && db.profiles[db.active]; lang = p && p.settings && p.settings.lang === "ga" ? "ga" : "en"; }
    catch (e) { lang = "en"; }
  }
  var home = (document.querySelector("script[src*='childbar.js']").getAttribute("src").indexOf("../") === 0 ? "../" : "") + "play.html";
  document.body.classList.add("childmode");
  var bar = document.createElement("div");
  bar.className = "child-bar";
  bar.innerHTML = '<a class="child-home" href="' + home + '"><span aria-hidden="true">🏠</span> ' + (lang === "ga" ? "Abhaile" : "Home") + "</a>";
  document.body.insertBefore(bar, document.body.firstChild);
})();
