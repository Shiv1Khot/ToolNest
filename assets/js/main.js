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
    { slug: "bmi-calculator", name: "BMI Calculator", category: "calculators", desc: "Calculate your Body Mass Index and see your weight category." },
    { slug: "compress-pdf", name: "Compress PDF", category: "pdf", desc: "Shrink PDF file size by repacking its contents — smaller PDFs, same pages." },
    { slug: "merge-pdf", name: "Merge PDF", category: "pdf", desc: "Combine multiple PDF files into one document, in any order you choose." },
    { slug: "split-pdf", name: "Split PDF", category: "pdf", desc: "Extract pages or page ranges from a PDF into a brand-new file." },
    { slug: "pdf-remove-pages", name: "Remove PDF Pages", category: "pdf", desc: "Delete unwanted pages from a PDF document." },
    { slug: "png-to-jpg", name: "PNG to JPG", category: "image", desc: "Convert PNG images to smaller JPG files with quality control." },
    { slug: "jpg-to-png", name: "JPG to PNG", category: "image", desc: "Convert JPG photos to PNG format." },
    { slug: "webp-to-png", name: "WebP to PNG", category: "image", desc: "Convert WebP images to widely supported PNG files." },
    { slug: "webp-to-jpg", name: "WebP to JPG", category: "image", desc: "Convert WebP images to JPG with adjustable quality." },
    { slug: "jfif-to-png", name: "JFIF to PNG", category: "image", desc: "Convert JFIF images to PNG format." },
    { slug: "heic-to-jpg", name: "HEIC to JPG", category: "image", desc: "Convert iPhone HEIC photos to JPG in your browser." },
    { slug: "heic-to-png", name: "HEIC to PNG", category: "image", desc: "Convert iPhone HEIC photos to PNG without uploading." },
    { slug: "heic-to-pdf", name: "HEIC to PDF", category: "image", desc: "Bundle HEIC photos into a single PDF document." },
    { slug: "png-to-svg", name: "PNG to SVG", category: "image", desc: "Wrap a PNG image inside an SVG container file." },
    { slug: "image-resize", name: "Image Resizer", category: "image", desc: "Resize images by exact pixels or percentage, keeping quality." },
    { slug: "image-to-text", name: "Image to Text (OCR)", category: "image", desc: "Extract editable text from photos and screenshots with on-device OCR." },
    { slug: "image-to-xml", name: "Image to XML", category: "image", desc: "Run OCR on an image and get the extracted text as XML." },
    { slug: "image-to-json", name: "Image to JSON", category: "image", desc: "Run OCR on an image and get the extracted text as JSON." },
    { slug: "jpg-to-pdf", name: "JPG to PDF", category: "image", desc: "Turn JPG and PNG images into a single PDF, one per page." },
    { slug: "pdf-to-jpg", name: "PDF to JPG", category: "image", desc: "Render every PDF page as a JPG image at your chosen DPI." },
    { slug: "jpeg-compressor", name: "JPEG Compressor", category: "compress", desc: "Shrink JPEG photo file size with a quality slider." },
    { slug: "png-compressor", name: "PNG Compressor", category: "compress", desc: "Reduce PNG file size with smart scaling." },
    { slug: "gif-compressor", name: "GIF Compressor", category: "compress", desc: "Compress a GIF's still frame into a much smaller file." },
    { slug: "image-compressor", name: "Image Compressor", category: "compress", desc: "Drop in any image — the right compression is picked automatically." },
    { slug: "csv-to-pdf", name: "CSV to PDF", category: "docs", desc: "Turn a CSV file into a neatly formatted PDF table." },
    { slug: "txt-to-pdf", name: "Text to PDF", category: "docs", desc: "Convert plain text, pasted or uploaded, into a clean PDF." },
    { slug: "json-to-pdf", name: "JSON to PDF", category: "docs", desc: "Validate JSON and export it as a nicely formatted PDF." },
    { slug: "html-to-pdf", name: "HTML to PDF", category: "docs", desc: "Paste HTML and download it as a real PDF document." },
    { slug: "html-to-jpg", name: "HTML to JPG", category: "docs", desc: "Render pasted HTML as a JPG screenshot." },
    { slug: "rtf-to-html", name: "RTF to HTML", category: "docs", desc: "Convert RTF documents to clean, readable HTML." },
    { slug: "pdf-to-json", name: "PDF to JSON", category: "docs", desc: "Extract the text of every PDF page into structured JSON." },
    { slug: "pdf-to-ocr", name: "PDF to Text (OCR)", category: "docs", desc: "Extract text from scanned PDFs page by page with OCR." },
    { slug: "excel-to-csv", name: "Excel to CSV", category: "data", desc: "Convert Excel XLSX workbooks to CSV files, one sheet at a time." },
    { slug: "csv-to-excel", name: "CSV to Excel", category: "data", desc: "Turn a CSV file into a real Excel XLSX workbook." },
    { slug: "excel-to-json", name: "Excel to JSON", category: "data", desc: "Turn spreadsheet rows into clean JSON objects." },
    { slug: "excel-to-xml", name: "Excel to XML", category: "data", desc: "Convert spreadsheet data into structured XML." },
    { slug: "json-to-csv", name: "JSON to CSV", category: "data", desc: "Flatten JSON arrays into CSV rows for spreadsheets." },
    { slug: "json-to-excel", name: "JSON to Excel", category: "data", desc: "Convert JSON data into a formatted Excel workbook." },
    { slug: "json-to-xml", name: "JSON to XML", category: "data", desc: "Convert JSON objects into well-formed XML." },
    { slug: "json-to-sql", name: "JSON to SQL", category: "data", desc: "Turn a JSON array into CREATE TABLE and INSERT statements." },
    { slug: "json-to-yaml", name: "JSON to YAML", category: "data", desc: "Convert JSON into human-friendly YAML." },
    { slug: "xml-to-json", name: "XML to JSON", category: "data", desc: "Convert XML documents into JSON with attributes preserved." },
    { slug: "sql-to-json", name: "SQL to JSON", category: "data", desc: "Parse SQL INSERT statements back into clean JSON." },
    { slug: "json-to-table-viewer", name: "JSON Table Viewer", category: "data", desc: "Paste JSON and browse it as a table, then export CSV." },
    { slug: "xml-to-table-viewer", name: "XML Table Viewer", category: "data", desc: "Turn repeating XML records into a browsable table." },
    { slug: "leads-extractor", name: "Leads Extractor", category: "data", desc: "Upload any CSV and pull out every email address and phone number." },
    { slug: "invoice-to-table-viewer", name: "Invoice OCR Reader", category: "data", desc: "OCR an invoice photo or PDF into editable text with a line preview." }
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
