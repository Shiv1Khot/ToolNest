/* ToolNest i18n core — language registry, lazy loading, picker UI.
   English + Hindi are bundled (i18n-dict-*.js); other languages lazy-load
   assets/i18n/dict/{code}.json on demand. */
(function () {
  "use strict";
  window.ToolNestStrings = window.ToolNestStrings || {en:{}, hi:{}};
  var STR = window.ToolNestStrings;
  var LS_KEY = "toolnest-lang";

  /* code, label — keep in sync with assets/i18n/dict/ */
  var LANGS = [
    ["en","English"],["hi","Hindi"],["ar","Arabic"],["bg","Bulgarian"],
    ["bn","Bengali"],["cs","Czech"],["da","Danish"],["de","German"],
    ["el","Greek"],["es","Spanish"],["fa","Persian (Farsi)"],["fi","Finnish"],
    ["fil","Filipino"],["fr","French"],["gu","Gujarati"],["he","Hebrew"],
    ["hu","Hungarian"],["id","Indonesian"],["it","Italian"],["ja","Japanese"],
    ["kn","Kannada"],["ko","Korean"],["ml","Malayalam"],["mr","Marathi"],
    ["ms","Malay"],["nb","Norwegian Bokmål"],["nl","Dutch"],["pa","Punjabi"],
    ["pl","Polish"],["pt","Portuguese"],["ro","Romanian"],["ru","Russian"],
    ["sk","Slovak"],["sv","Swedish"],["sw","Swahili"],["ta","Tamil"],
    ["te","Telugu"],["th","Thai"],["tr","Turkish"],["uk","Ukrainian"],
    ["ur","Urdu"],["vi","Vietnamese"],["zh-CN","Chinese (Simplified)"],["pt-BR","Portuguese (Brazil)"],
    ["pt-PT","Portuguese (Portugal)"],["es-MX","Spanish (Mexico)"],["es-AR","Spanish (Argentina)"],["es-CO","Spanish (Colombia)"],
    ["es-CL","Spanish (Chile)"],["fr-CA","French (Canada)"],["fr-BE","French (Belgium)"],["ar-EG","Arabic (Egypt)"],
    ["ar-SA","Arabic (Saudi Arabia)"],["de-AT","German (Austria)"],["de-CH","German (Switzerland)"],["nl-BE","Dutch (Belgium)"],
    ["ms-BN","Malay (Brunei)"],["en-IN","English (India)"],["en-GB","English (United Kingdom)"],["en-US","English (United States)"],
    ["en-AU","English (Australia)"]
  ];
  var BY_CODE = {};
  LANGS.forEach(function (l) { BY_CODE[l[0]] = l[1]; });
  var RTL = {ar:1, "ar-EG":1, "ar-SA":1, fa:1, ur:1, he:1, ps:1, ug:1, yi:1, ckb:1};
  var loaded = {en: true, hi: true};
  var pending = {}; /* code -> [callbacks] while fetching */

  /* picker chrome strings (bundled for en/hi; machine-translated for the rest) */
  Object.assign(STR.en, {
    "lang_picker_aria": "Choose language",
    "lang_search_ph": "Search languages…",
    "lang_loading": "Loading…"
  });
  Object.assign(STR.hi, {
    "lang_picker_aria": "भाषा चुनें",
    "lang_search_ph": "भाषाएँ खोजें…",
    "lang_loading": "लोड हो रहा है…"
  });

  function storedLang() {
    try {
      var v = localStorage.getItem(LS_KEY);
      if (v && BY_CODE[v]) return v;
    } catch (e) {}
    return null;
  }
  function autoLang() {
    var n = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    for (var i = 0; i < LANGS.length; i++) {
      if (LANGS[i][0].toLowerCase() === n) return LANGS[i][0];
    }
    var base = n.split("-")[0];
    for (var j = 0; j < LANGS.length; j++) {
      var c = LANGS[j][0].toLowerCase();
      if (c === base || c.indexOf(base + "-") === 0) return LANGS[j][0];
    }
    return "en";
  }
  var lang = storedLang() || autoLang();

  function t(key, params) {
    var tab = STR[lang] || STR.en;
    var s = tab[key];
    if (s === undefined) s = STR.en[key];
    if (s === undefined) return key;
    if (params) {
      s = String(s).replace(/\{(\w+)\}/g, function (m, p) {
        return params[p] !== undefined && params[p] !== null ? params[p] : m;
      });
    }
    return s;
  }

  function dictUrl(code) {
    var scr = document.querySelector('script[src*="i18n-core.js"]');
    var base = scr && scr.src ? scr.src : "assets/js/i18n-core.js";
    try {
      return new URL("../i18n/dict/" + code + ".json", base).href;
    } catch (e) {
      return "assets/i18n/dict/" + code + ".json";
    }
  }

  function setLoading(on) {
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.classList.toggle("loading", !!on);
      btn.setAttribute("aria-busy", on ? "true" : "false");
    });
  }

  function ensureLang(code, cb) {
    if (code === "en" || code === "hi" || code.indexOf("en-") === 0 || loaded[code]) { cb(true); return; }
    if (pending[code]) { pending[code].push(cb); return; }
    pending[code] = [cb];
    setLoading(true);
    fetch(dictUrl(code), {cache: "force-cache"}).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (data) {
      STR[code] = Object.assign(STR[code] || {}, data);
      loaded[code] = true;
      setLoading(false);
      var cbs = pending[code]; delete pending[code];
      cbs.forEach(function (f) { f(true); });
    }).catch(function (err) {
      console.warn("[i18n] could not load language '" + code + "', falling back to English.", err);
      setLoading(false);
      var cbs = pending[code]; delete pending[code];
      cbs.forEach(function (f) { f(false); });
    });
  }

  /* ---------- picker UI ---------- */
  function labelFor(code) { return BY_CODE[code] || code; }

  function renderOptions(list) {
    var html = "";
    LANGS.forEach(function (l) {
      html += '<li role="option" tabindex="-1" data-lang-value="' + l[0] + '"' +
        ' aria-selected="' + (l[0] === lang ? "true" : "false") + '"' +
        (l[0] === lang ? ' class="selected"' : "") + '>' +
        '<span class="lang-name">' + l[1] + '</span>' +
        '<span class="lang-code">' + l[0] + '</span></li>';
    });
    list.innerHTML = html;
  }

  function filterOptions(list, q) {
    q = (q || "").trim().toLowerCase();
    var items = list.querySelectorAll("[data-lang-value]");
    var visible = 0;
    items.forEach(function (li) {
      var code = li.getAttribute("data-lang-value").toLowerCase();
      var name = li.querySelector(".lang-name").textContent.toLowerCase();
      var show = !q || code.indexOf(q) === 0 || name.indexOf(q) !== -1 || code.indexOf(q) !== -1;
      li.style.display = show ? "" : "none";
      if (show) visible++;
    });
    return visible;
  }

  function closeMenus() {
    document.querySelectorAll("[data-lang-menu]").forEach(function (m) { m.hidden = true; });
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
  }

  function refreshPickerUI() {
    document.querySelectorAll("[data-lang-current]").forEach(function (el) {
      el.textContent = labelFor(lang);
    });
    document.querySelectorAll("[data-lang-list]").forEach(function (list) {
      list.querySelectorAll("[data-lang-value]").forEach(function (li) {
        var sel = li.getAttribute("data-lang-value") === lang;
        li.classList.toggle("selected", sel);
        li.setAttribute("aria-selected", sel ? "true" : "false");
      });
    });
  }

  function initPicker() {
    document.querySelectorAll("[data-lang-picker]").forEach(function (picker) {
      var btn = picker.querySelector("[data-lang-btn]");
      var menu = picker.querySelector("[data-lang-menu]");
      var search = picker.querySelector("[data-lang-search]");
      var list = picker.querySelector("[data-lang-list]");
      if (!btn || !menu || !list) return;
      renderOptions(list);
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = menu.hidden;
        closeMenus();
        if (open) {
          menu.hidden = false;
          btn.setAttribute("aria-expanded", "true");
          if (search) { search.value = ""; filterOptions(list, ""); search.focus(); }
        }
      });
      if (search) {
        search.addEventListener("input", function () { filterOptions(list, search.value); });
        search.addEventListener("keydown", function (e) {
          if (e.key === "Escape") { closeMenus(); btn.focus(); }
          if (e.key === "Enter") {
            var first = list.querySelector('[data-lang-value]:not([style*="none"])');
            if (first) first.click();
          }
        });
      }
      list.addEventListener("click", function (e) {
        var li = e.target && e.target.closest ? e.target.closest("[data-lang-value]") : null;
        if (!li) return;
        closeMenus();
        setLang(li.getAttribute("data-lang-value"));
      });
    });
    document.addEventListener("click", function (e) {
      if (!(e.target && e.target.closest && e.target.closest("[data-lang-picker]"))) closeMenus();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenus();
    });
  }

  function apply() {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", RTL[lang] ? "rtl" : "ltr");
    refreshPickerUI();
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-i18n-content]").forEach(function (el) {
      el.setAttribute("content", t(el.getAttribute("data-i18n-content")));
    });
    if (window.ToolNest) {
      if (ToolNest.refreshDropzones) { try { ToolNest.refreshDropzones(); } catch (e) {} }
      if (ToolNest.refreshSearch) { try { ToolNest.refreshSearch(); } catch (e) {} }
    }
  }

  function setLang(l) {
    if (!BY_CODE[l]) return;
    lang = l;
    try { localStorage.setItem(LS_KEY, l); } catch (e) {}
    ensureLang(l, function (ok) {
      if (!ok) {
        lang = "en";
        try { localStorage.setItem(LS_KEY, "en"); } catch (e2) {}
      }
      apply();
    });
  }

  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", RTL[lang] ? "rtl" : "ltr");
  window.I18N = {
    t: t,
    getLang: function () { return lang; },
    setLang: setLang,
    apply: apply,
    getLanguages: function () { return LANGS.slice(); }
  };

  function boot() {
    initPicker();
    ensureLang(lang, function () { apply(); });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
