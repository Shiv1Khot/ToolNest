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
      b.setAttribute("aria-label", window.I18N ? (t === "dark" ? I18N.t("theme_to_light") : I18N.t("theme_to_dark"))
        : (t === "dark" ? "Switch to light mode" : "Switch to dark mode"));
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
    { slug: "word-counter", name: "Word Counter", category: "text", desc: "Count words, characters, sentences, paragraphs and reading time as you type.", desc_hi: "लिखते ही शब्द, अक्षर, वाक्य, पैराग्राफ़ और पढ़ने का समय गिनें।", hi_kw: "शब्द गिनती अक्षर गिनें शब्द गिनो" },
    { slug: "case-converter", name: "Case Converter", category: "text", desc: "Convert text to UPPER, lower, Title Case, Sentence case, aLtErNaTiNg and InVeRsE.", desc_hi: "टेक्स्ट को UPPER, lower, Title Case, Sentence case, aLtErNaTiNg और InVeRsE में बदलें।", hi_kw: "केस बदलें बड़े अक्षर छोटे अक्षर" },
    { slug: "duplicate-line-remover", name: "Duplicate Line Remover", category: "text", desc: "Remove duplicate lines, sort lines and trim whitespace.", desc_hi: "दोहराई गई लाइनें हटाएँ, लाइनें क्रम में लगाएँ और खाली जगह साफ़ करें।", hi_kw: "दोहराई लाइन हटाएँ डुप्लिकेट साफ़" },
    { slug: "json-formatter", name: "JSON Formatter", category: "developer", desc: "Format, validate and minify JSON with clear error messages.", desc_hi: "साफ़ त्रुटि संदेशों के साथ JSON फ़ॉर्मेट, जाँच और मिनिफ़ाई करें।", hi_kw: "JSON सजाएँ JSON जाँचें" },
    { slug: "base64-tool", name: "Base64 Encoder / Decoder", category: "developer", desc: "Encode text to Base64 or decode Base64 back to readable text.", desc_hi: "टेक्स्ट को Base64 में एनकोड करें या Base64 को वापस पढ़ने लायक टेक्स्ट में डिकोड करें।", hi_kw: "Base64 एनकोड डिकोड" },
    { slug: "url-encoder", name: "URL Encoder / Decoder", category: "developer", desc: "Encode or decode full URLs and URI components safely.", desc_hi: "पूरे URL और URI कंपोनेंट को सुरक्षित एनकोड या डिकोड करें।", hi_kw: "URL एनकोड डिकोड लिंक" },
    { slug: "password-generator", name: "Password Generator", category: "generators", desc: "Create strong random passwords with a length slider and strength meter.", desc_hi: "लंबाई स्लाइडर और स्ट्रेंथ मीटर के साथ मज़बूत रैंडम पासवर्ड बनाएँ।", hi_kw: "पासवर्ड बनाएँ मज़बूत पासवर्ड" },
    { slug: "uuid-generator", name: "UUID Generator", category: "generators", desc: "Generate UUID v4 identifiers, one at a time or in bulk.", desc_hi: "UUID v4 आइडेंटिफ़ायर बनाएँ, एक-एक करके या थोक में।", hi_kw: "UUID बनाएँ" },
    { slug: "qr-code-generator", name: "QR Code Generator", category: "generators", desc: "Turn text or URLs into QR codes and download them as PNG.", desc_hi: "टेक्स्ट या URL को QR कोड बनाएँ और PNG में डाउनलोड करें।", hi_kw: "QR कोड बनाएँ क्यूआर" },
    { slug: "emi-calculator", name: "EMI Calculator", category: "calculators", desc: "Compute monthly EMI, total interest and total payable for any loan.", desc_hi: "किसी भी लोन की मासिक EMI, कुल ब्याज और कुल देय राशि निकालें।", hi_kw: "EMI निकालें लोन किश्त ब्याज" },
    { slug: "age-calculator", name: "Age Calculator", category: "calculators", desc: "Find your exact age in years, months and days, plus your next birthday.", desc_hi: "साल, महीने और दिन में अपनी सटीक उम्र जानें, और अगला जन्मदिन भी।", hi_kw: "उम्र निकालें आयु जन्मदिन" },
    { slug: "bmi-calculator", name: "BMI Calculator", category: "calculators", desc: "Calculate your Body Mass Index and see your weight category.", desc_hi: "अपना बॉडी मास इंडेक्स निकालें और वज़न श्रेणी देखें।", hi_kw: "BMI वज़न" },
    { slug: "compress-pdf", name: "Compress PDF", category: "pdf", desc: "Shrink PDF file size by repacking its contents — smaller PDFs, same pages.", desc_hi: "सामग्री दोबारा पैक करके PDF फ़ाइल साइज़ घटाएँ — छोटी PDF, वही पेज।", hi_kw: "PDF छोटी करें कंप्रेस साइज़ घटाएँ" },
    { slug: "merge-pdf", name: "Merge PDF", category: "pdf", desc: "Combine multiple PDF files into one document, in any order you choose.", desc_hi: "कई PDF फ़ाइलों को एक दस्तावेज़ में जोड़ें, जिस क्रम में चाहें।", hi_kw: "PDF जोड़ें मिलाएँ मर्ज" },
    { slug: "split-pdf", name: "Split PDF", category: "pdf", desc: "Extract pages or page ranges from a PDF into a brand-new file.", desc_hi: "PDF से पेज या पेज रेंज निकालकर बिल्कुल नई फ़ाइल बनाएँ।", hi_kw: "PDF बाँटें पेज निकालें" },
    { slug: "pdf-remove-pages", name: "Remove PDF Pages", category: "pdf", desc: "Delete unwanted pages from a PDF document.", desc_hi: "PDF दस्तावेज़ से गैर-ज़रूरी पेज हटाएँ।", hi_kw: "PDF पेज हटाएँ" },
    { slug: "png-to-jpg", name: "PNG to JPG", category: "image", desc: "Convert PNG images to smaller JPG files with quality control.", desc_hi: "PNG इमेज को क्वालिटी नियंत्रण के साथ छोटी JPG फ़ाइलों में बदलें।", hi_kw: "PNG JPG बदलें" },
    { slug: "jpg-to-png", name: "JPG to PNG", category: "image", desc: "Convert JPG photos to PNG format.", desc_hi: "JPG फ़ोटो को PNG फ़ॉर्मेट में बदलें।", hi_kw: "JPG PNG बदलें" },
    { slug: "webp-to-png", name: "WebP to PNG", category: "image", desc: "Convert WebP images to widely supported PNG files.", desc_hi: "WebP इमेज को व्यापक-समर्थित PNG फ़ाइलों में बदलें।", hi_kw: "WebP PNG बदलें" },
    { slug: "webp-to-jpg", name: "WebP to JPG", category: "image", desc: "Convert WebP images to JPG with adjustable quality.", desc_hi: "WebP इमेज को एडजस्ट करने लायक क्वालिटी के साथ JPG में बदलें।", hi_kw: "WebP JPG बदलें" },
    { slug: "jfif-to-png", name: "JFIF to PNG", category: "image", desc: "Convert JFIF images to PNG format.", desc_hi: "JFIF इमेज को PNG फ़ॉर्मेट में बदलें।", hi_kw: "JFIF PNG बदलें" },
    { slug: "heic-to-jpg", name: "HEIC to JPG", category: "image", desc: "Convert iPhone HEIC photos to JPG in your browser.", desc_hi: "iPhone HEIC फ़ोटो को अपने ब्राउज़र में JPG में बदलें।", hi_kw: "HEIC JPG iPhone फ़ोटो बदलें" },
    { slug: "heic-to-png", name: "HEIC to PNG", category: "image", desc: "Convert iPhone HEIC photos to PNG without uploading.", desc_hi: "iPhone HEIC फ़ोटो को बिना अपलोड किए PNG में बदलें।", hi_kw: "HEIC PNG iPhone फ़ोटो" },
    { slug: "heic-to-pdf", name: "HEIC to PDF", category: "image", desc: "Bundle HEIC photos into a single PDF document.", desc_hi: "HEIC फ़ोटो को एक ही PDF दस्तावेज़ में बाँधें।", hi_kw: "HEIC PDF फ़ोटो" },
    { slug: "png-to-svg", name: "PNG to SVG", category: "image", desc: "Wrap a PNG image inside an SVG container file.", desc_hi: "PNG इमेज को SVG कंटेनर फ़ाइल में लपेटें।", hi_kw: "PNG SVG बदलें" },
    { slug: "image-resize", name: "Image Resizer", category: "image", desc: "Resize images by exact pixels or percentage, keeping quality.", desc_hi: "क्वालिटी बनाए रखते हुए इमेज को सटीक पिक्सेल या प्रतिशत से रीसाइज़ करें।", hi_kw: "इमेज रीसाइज़ फ़ोटो साइज़ छोटा बड़ा" },
    { slug: "image-to-text", name: "Image to Text (OCR)", category: "image", desc: "Extract editable text from photos and screenshots with on-device OCR.", desc_hi: "ऑन-डिवाइस OCR से फ़ोटो और स्क्रीनशॉट से एडिट करने लायक टेक्स्ट निकालें।", hi_kw: "इमेज से टेक्स्ट OCR फ़ोटो से अक्षर" },
    { slug: "image-to-xml", name: "Image to XML", category: "image", desc: "Run OCR on an image and get the extracted text as XML.", desc_hi: "इमेज पर OCR चलाएँ और निकाला गया टेक्स्ट XML में पाएँ।", hi_kw: "इमेज से XML OCR" },
    { slug: "image-to-json", name: "Image to JSON", category: "image", desc: "Run OCR on an image and get the extracted text as JSON.", desc_hi: "इमेज पर OCR चलाएँ और निकाला गया टेक्स्ट JSON में पाएँ।", hi_kw: "इमेज से JSON OCR" },
    { slug: "jpg-to-pdf", name: "JPG to PDF", category: "image", desc: "Turn JPG and PNG images into a single PDF, one per page.", desc_hi: "JPG और PNG इमेज को एक ही PDF बनाएँ, हर पेज पर एक।", hi_kw: "JPG PDF इमेज से PDF" },
    { slug: "pdf-to-jpg", name: "PDF to JPG", category: "image", desc: "Render every PDF page as a JPG image at your chosen DPI.", desc_hi: "हर PDF पेज को अपनी चुनी DPI पर JPG इमेज बनाएँ।", hi_kw: "PDF JPG पेज इमेज" },
    { slug: "jpeg-compressor", name: "JPEG Compressor", category: "compress", desc: "Shrink JPEG photo file size with a quality slider.", desc_hi: "क्वालिटी स्लाइडर से JPEG फ़ोटो की फ़ाइल साइज़ घटाएँ।", hi_kw: "JPEG छोटा करें कंप्रेस फ़ोटो" },
    { slug: "png-compressor", name: "PNG Compressor", category: "compress", desc: "Reduce PNG file size with smart scaling.", desc_hi: "स्मार्ट स्केलिंग से PNG फ़ाइल का साइज़ घटाएँ।", hi_kw: "PNG छोटा करें कंप्रेस" },
    { slug: "gif-compressor", name: "GIF Compressor", category: "compress", desc: "Compress a GIF's still frame into a much smaller file.", desc_hi: "GIF के स्थिर फ़्रेम को बहुत छोटी फ़ाइल में कंप्रेस करें।", hi_kw: "GIF छोटा करें कंप्रेस" },
    { slug: "image-compressor", name: "Image Compressor", category: "compress", desc: "Drop in any image — the right compression is picked automatically.", desc_hi: "कोई भी इमेज डालें — सही कंप्रेशन अपने आप चुना जाता है।", hi_kw: "इमेज कंप्रेस फ़ोटो छोटी करें" },
    { slug: "csv-to-pdf", name: "CSV to PDF", category: "docs", desc: "Turn a CSV file into a neatly formatted PDF table.", desc_hi: "CSV फ़ाइल को सलीके से फ़ॉर्मेट की गई PDF टेबल में बदलें।", hi_kw: "CSV PDF टेबल" },
    { slug: "txt-to-pdf", name: "Text to PDF", category: "docs", desc: "Convert plain text, pasted or uploaded, into a clean PDF.", desc_hi: "सादे टेक्स्ट को — पेस्ट किया या अपलोड किया — साफ़ PDF में बदलें।", hi_kw: "टेक्स्ट PDF" },
    { slug: "json-to-pdf", name: "JSON to PDF", category: "docs", desc: "Validate JSON and export it as a nicely formatted PDF.", desc_hi: "JSON जाँचें और उसे सुंदर फ़ॉर्मेट की PDF में निर्यात करें।", hi_kw: "JSON PDF" },
    { slug: "html-to-pdf", name: "HTML to PDF", category: "docs", desc: "Paste HTML and download it as a real PDF document.", desc_hi: "HTML पेस्ट करें और उसे असली PDF दस्तावेज़ में डाउनलोड करें।", hi_kw: "HTML PDF" },
    { slug: "html-to-jpg", name: "HTML to JPG", category: "docs", desc: "Render pasted HTML as a JPG screenshot.", desc_hi: "पेस्ट किए गए HTML को JPG स्क्रीनशॉट बनाएँ।", hi_kw: "HTML JPG इमेज" },
    { slug: "rtf-to-html", name: "RTF to HTML", category: "docs", desc: "Convert RTF documents to clean, readable HTML.", desc_hi: "RTF दस्तावेज़ों को साफ़, पढ़ने लायक HTML में बदलें।", hi_kw: "RTF HTML" },
    { slug: "pdf-to-json", name: "PDF to JSON", category: "docs", desc: "Extract the text of every PDF page into structured JSON.", desc_hi: "हर PDF पेज का टेक्स्ट सुसंगठित JSON में निकालें।", hi_kw: "PDF JSON टेक्स्ट निकालें" },
    { slug: "pdf-to-ocr", name: "PDF to Text (OCR)", category: "docs", desc: "Extract text from scanned PDFs page by page with OCR.", desc_hi: "OCR से स्कैन PDF से पेज दर पेज टेक्स्ट निकालें।", hi_kw: "PDF OCR स्कैन टेक्स्ट" },
    { slug: "excel-to-csv", name: "Excel to CSV", category: "data", desc: "Convert Excel XLSX workbooks to CSV files, one sheet at a time.", desc_hi: "Excel XLSX वर्कबुक को CSV फ़ाइलों में बदलें, एक बार में एक शीट।", hi_kw: "Excel CSV" },
    { slug: "csv-to-excel", name: "CSV to Excel", category: "data", desc: "Turn a CSV file into a real Excel XLSX workbook.", desc_hi: "CSV फ़ाइल को असली Excel XLSX वर्कबुक बनाएँ।", hi_kw: "CSV Excel" },
    { slug: "excel-to-json", name: "Excel to JSON", category: "data", desc: "Turn spreadsheet rows into clean JSON objects.", desc_hi: "स्प्रेडशीट पंक्तियों को साफ़ JSON ऑब्जेक्ट बनाएँ।", hi_kw: "Excel JSON" },
    { slug: "excel-to-xml", name: "Excel to XML", category: "data", desc: "Convert spreadsheet data into structured XML.", desc_hi: "स्प्रेडशीट डेटा को सुसंगठित XML में बदलें।", hi_kw: "Excel XML" },
    { slug: "json-to-csv", name: "JSON to CSV", category: "data", desc: "Flatten JSON arrays into CSV rows for spreadsheets.", desc_hi: "स्प्रेडशीट के लिए JSON ऐरे को CSV पंक्तियों में चपटा करें।", hi_kw: "JSON CSV" },
    { slug: "json-to-excel", name: "JSON to Excel", category: "data", desc: "Convert JSON data into a formatted Excel workbook.", desc_hi: "JSON डेटा को फ़ॉर्मेट की गई Excel वर्कबुक में बदलें।", hi_kw: "JSON Excel" },
    { slug: "json-to-xml", name: "JSON to XML", category: "data", desc: "Convert JSON objects into well-formed XML.", desc_hi: "JSON ऑब्जेक्ट को सही XML में बदलें।", hi_kw: "JSON XML" },
    { slug: "json-to-sql", name: "JSON to SQL", category: "data", desc: "Turn a JSON array into CREATE TABLE and INSERT statements.", desc_hi: "JSON ऐरे को CREATE TABLE और INSERT स्टेटमेंट बनाएँ।", hi_kw: "JSON SQL" },
    { slug: "json-to-yaml", name: "JSON to YAML", category: "data", desc: "Convert JSON into human-friendly YAML.", desc_hi: "XML to JSON", hi_kw: "JSON YAML" },
    { slug: "xml-to-json", name: "XML to JSON", category: "data", desc: "Convert XML documents into JSON with attributes preserved.", desc_hi: "एट्रिब्यूट बचाते हुए XML दस्तावेज़ों को JSON में बदलें।", hi_kw: "XML JSON" },
    { slug: "sql-to-json", name: "SQL to JSON", category: "data", desc: "Parse SQL INSERT statements back into clean JSON.", desc_hi: "SQL INSERT स्टेटमेंट को साफ़ JSON में बदलें।", hi_kw: "SQL JSON" },
    { slug: "json-to-table-viewer", name: "JSON Table Viewer", category: "data", desc: "Paste JSON and browse it as a table, then export CSV.", desc_hi: "JSON पेस्ट करें और उसे टेबल में देखें, फिर CSV निर्यात करें।", hi_kw: "JSON टेबल" },
    { slug: "xml-to-table-viewer", name: "XML Table Viewer", category: "data", desc: "Turn repeating XML records into a browsable table.", desc_hi: "दोहराए जाने वाले XML रिकॉर्ड को देखने लायक टेबल बनाएँ।", hi_kw: "XML टेबल" },
    { slug: "leads-extractor", name: "Leads Extractor", category: "data", desc: "Upload any CSV and pull out every email address and phone number.", desc_hi: "कोई भी CSV अपलोड करें और हर ईमेल पता और फ़ोन नंबर निकालें।", hi_kw: "ईमेल फ़ोन निकालें लीड्स" },
    { slug: "invoice-to-table-viewer", name: "Invoice OCR Reader", category: "data", desc: "OCR an invoice photo or PDF into editable text with a line preview.", desc_hi: "इनवॉइस फ़ोटो या PDF को लाइन झलक के साथ एडिट करने लायक टेक्स्ट में OCR करें।", hi_kw: "इनवॉइस OCR बिल" }
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
  function isHindi() { return window.I18N && I18N.getLang() === "hi"; }
  function catLabel(c) { return window.I18N ? I18N.t("cat_" + c) : c; }
  function renderResults(list) {
    activeIndex = -1;
    if (!list.length) {
      resultsBox.innerHTML = '<div class="search-empty">' +
        escapeHtml(window.I18N ? I18N.t("search_empty") : "No tools match your search.") + '</div>';
      return;
    }
    var hi = isHindi();
    resultsBox.innerHTML = list.map(function (t, i) {
      return '<a class="search-result" data-i="' + i + '" href="' + basePath() + "tools/" + t.slug + '.html">' +
        '<div><div class="cat">' + escapeHtml(catLabel(t.category)) + '</div>' +
        '<div class="name">' + escapeHtml(t.name) + '</div>' +
        '<div class="desc">' + escapeHtml(hi && t.desc_hi ? t.desc_hi : t.desc) + '</div></div></a>';
    }).join("");
  }
  function filterTools(q) {
    q = q.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter(function (t) {
      var hay = t.name + " " + t.desc + " " + (t.desc_hi || "") + " " + t.category + " " + (t.hi_kw || "");
      return hay.toLowerCase().indexOf(q) !== -1;
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
  T.refreshSearch = function () {
    if (input && overlay && overlay.classList.contains("open")) {
      renderResults(filterTools(input.value));
    }
  };

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
