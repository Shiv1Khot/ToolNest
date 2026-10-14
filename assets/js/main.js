/* ToolNest shared JS: theme toggle, search overlay, helpers. No dependencies. */
(function () {
  "use strict";

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  function currentTheme() {
    try { return localStorage.getItem("toolnest-theme") || "light"; }
    catch (e) { return "light"; }
  }
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    var btns = document.querySelectorAll("[data-theme-toggle]");
    btns.forEach(function (b) {
      b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
      b.querySelector(".theme-icon").textContent = t === "dark" ? "☀️" : "🌙";
    });
  }
  applyTheme(currentTheme());
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-theme-toggle]");
    if (!t) return;
    var next = currentTheme() === "dark" ? "light" : "dark";
    try { localStorage.setItem("toolnest-theme", next); } catch (err) {}
    applyTheme(next);
  });

  /* ---------- Tool catalogue (search data) ---------- */
  var TOOLS = [
    { slug: "word-counter", name: "Word Counter", category: "text", desc: "Count words, characters, sentences, paragraphs and reading time as you type." },
    { slug: "case-converter", name: "Case Converter", category: "text", desc: "Convert text to UPPER, lower, Title Case, Sentence case, aLtErNaTiNg and InVeRsE." },
    { slug: "duplicate-line-remover", name: "Duplicate Line Remover", category: "text", desc: "Remove duplicate lines, sort lines and trim whitespace." },
    { slug: "json-formatter", name: "JSON Formatter", category: "developer", desc: "Format, validate and minify JSON with clear error messages." },
    { slug: "base64-tool", name: "Base64 Encoder / Decoder", category: "developer", desc: "Encode text to Base64 or decode Base64 back to readable text." },
    { slug: "url-encoder", name: "URL Encoder / Decoder", category: "developer", desc: "Encode or decode full URLs and URI components safely." },
    { slug: "password-generator", name: "Password Generator", category: "generators", desc: "Create strong random passwords with a length slider and strength meter." },
    { slug: "uuid-generator", name: "UUID Generator", category: "generators", desc: "Generate UUID v4 identifiers, one at a time or in bulk." },
    { slug: "qr-code-generator", name: "QR Code Generator", category: "generators", desc: "Turn text or URLs into QR codes and download them as PNG." },
    { slug: "emi-calculator", name: "EMI Calculator", category: "calculators", desc: "Compute monthly EMI, total interest and total payable for any loan." },
    { slug: "age-calculator", name: "Age Calculator", category: "calculators", desc: "Find your exact age in years, months and days, plus your next birthday." },
    { slug: "bmi-calculator", name: "BMI Calculator", category: "calculators", desc: "Calculate your Body Mass Index and see your weight category." }
  ];

  /* ---------- Search overlay ---------- */
  var overlay = document.getElementById("search-overlay");
  var input = document.getElementById("search-input");
  var resultsBox = document.getElementById("search-results");
  var activeIndex = -1;

  function basePath() {
    // Tool pages live one level deeper than index.
    return document.body.getAttribute("data-base") || "./";
  }

  function openSearch() {
    if (!overlay) return;
    overlay.classList.add("open");
    input.value = "";
    renderResults(TOOLS);
    setTimeout(function () { input.focus(); }, 30);
  }
  function closeSearch() {
    if (!overlay) return;
    overlay.classList.remove("open");
  }
  function renderResults(list) {
    activeIndex = -1;
    if (!list.length) {
      resultsBox.innerHTML = '<div class="search-empty">No tools match your search.</div>';
      return;
    }
    resultsBox.innerHTML = list.map(function (t, i) {
      return '<a class="search-result" data-i="' + i + '" href="' + basePath() + "tools/" + t.slug + '.html">' +
        '<div><div class="cat">' + t.category + '</div>' +
        '<div class="name">' + escapeHtml(t.name) + '</div>' +
        '<div class="desc">' + escapeHtml(t.desc) + '</div></div></a>';
    }).join("");
  }
  function filterTools(q) {
    q = q.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter(function (t) {
      return (t.name + " " + t.desc + " " + t.category).toLowerCase().indexOf(q) !== -1;
    });
  }

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      overlay.classList.contains("open") ? closeSearch() : openSearch();
    } else if (e.key === "Escape") {
      closeSearch();
    } else if (overlay && overlay.classList.contains("open") && e.key === "ArrowDown") {
      e.preventDefault(); moveActive(1);
    } else if (overlay && overlay.classList.contains("open") && e.key === "ArrowUp") {
      e.preventDefault(); moveActive(-1);
    } else if (overlay && overlay.classList.contains("open") && e.key === "Enter") {
      var links = resultsBox.querySelectorAll(".search-result");
      if (links.length) {
        var target = activeIndex >= 0 ? links[activeIndex] : links[0];
        window.location.href = target.getAttribute("href");
      }
    }
  });
  function moveActive(dir) {
    var links = resultsBox.querySelectorAll(".search-result");
    if (!links.length) return;
    activeIndex = (activeIndex + dir + links.length) % links.length;
    links.forEach(function (l, i) { l.classList.toggle("active", i === activeIndex); });
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-open-search]")) openSearch();
    if (overlay && e.target === overlay) closeSearch();
  });
  if (input) {
    input.addEventListener("input", function () { renderResults(filterTools(input.value)); });
  }

  /* ---------- Category chips (index page) ---------- */
  document.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
    chip.classList.add("active");
    var cat = chip.getAttribute("data-cat");
    document.querySelectorAll(".tool-card").forEach(function (card) {
      card.style.display = (cat === "all" || card.getAttribute("data-category") === cat) ? "" : "none";
    });
    document.querySelectorAll(".category-block").forEach(function (block) {
      block.style.display = (cat === "all" || block.getAttribute("data-category") === cat) ? "" : "none";
    });
  });

  /* ---------- Shared helpers (global) ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function showToast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._hide);
    t._hide = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }
  function copyText(text, doneMsg) {
    function done() { showToast(doneMsg || "Copied to clipboard"); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch (e) { showToast("Copy failed — select the text manually"); }
      document.body.removeChild(ta);
    }
  }
  window.ToolNest = { copyText: copyText, showToast: showToast, escapeHtml: escapeHtml, TOOLS: TOOLS };
})();
