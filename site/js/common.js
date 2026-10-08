/* Shared by every page: fills in site settings, shows the cookie notice, registers offline support. */
(function () {
  "use strict";
  var C = window.CM_CONFIG || {};
  var CM = (window.CM = window.CM || {});
  CM.cfg = C;

  CM.safeGet = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  CM.safeSet = function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
  CM.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  // Fill <span data-cfg="ownerName"> etc. Missing values show a highlighted reminder.
  function fillConfig() {
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg"), v = C[key];
      if (v) { el.textContent = v; el.classList.remove("todo-fill"); }
      else { el.textContent = "[set " + key + " in js/config.js]"; el.classList.add("todo-fill"); }
    });
    document.querySelectorAll("[data-donate]").forEach(function (el) {
      if (C.donateUrl) { el.setAttribute("href", C.donateUrl); el.setAttribute("rel", "noopener"); el.setAttribute("target", "_blank"); if (!el.textContent.trim()) el.textContent = C.donateLabel || "Support the site"; }
      else el.hidden = true;
    });
    document.querySelectorAll("[data-donate-missing]").forEach(function (el) { el.hidden = !!C.donateUrl; });
    document.querySelectorAll("[data-accounts-on]").forEach(function (el) { el.hidden = !(C.supabaseUrl && C.supabaseAnonKey); });
    document.querySelectorAll("[data-accounts-off]").forEach(function (el) { el.hidden = !!(C.supabaseUrl && C.supabaseAnonKey); });
    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
  }

  // Cookie notice. The site only uses storage that is strictly necessary, so this is a notice, not a consent wall.
  var CONSENT_KEY = "cm-notice";
  function consentNotice() {
    if (document.body.hasAttribute("data-no-notice")) return;
    var seen = CM.safeGet(CONSENT_KEY);
    if (seen) return;
    var bar = document.createElement("div");
    bar.className = "consent"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Cookie notice");
    bar.innerHTML = '<div class="consent-in"><p><b>No tracking here.</b> This site uses no advertising or analytics cookies. It only stores what it needs to work: game settings on this device, and your sign-in if you make an account. <a href="cookies.html">Cookie policy</a></p>' +
      '<div class="row"><button class="btn btn-primary" type="button" id="consentOk">OK</button></div></div>';
    document.body.appendChild(bar);
    var pad = function () { document.body.style.paddingBottom = (bar.offsetHeight + 16) + "px"; };
    pad(); window.addEventListener("resize", pad);
    document.getElementById("consentOk").addEventListener("click", function () {
      CM.safeSet(CONSENT_KEY, JSON.stringify({ v: 1, at: new Date().toISOString() }));
      window.removeEventListener("resize", pad);
      document.body.style.paddingBottom = "";
      bar.remove();
    });
  }

  function markNav() {
    var here = location.pathname.split("/").pop().replace(".html", "") || "index";
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      var t = (a.getAttribute("href") || "").replace(".html", "").replace("./", "") || "index";
      if (t === here) a.setAttribute("aria-current", "page");
    });
  }

  function registerSW() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  document.addEventListener("DOMContentLoaded", function () { fillConfig(); markNav(); consentNotice(); });
  registerSW();
})();
