/* ToolNest file-tools helper: dropzone renderer, file utils, CDN loader.
   No dependencies — extends the window.ToolNest namespace from main.js. */
(function () {
  "use strict";
  var T = (window.ToolNest = window.ToolNest || {});

  /* i18n helper: falls back to English when i18n.js hasn't loaded. */
  var FALLBACK = {
    dz_or: "or",
    dz_select: "Select File",
    dz_upload_aria: "Upload file",
    dz_default_label: "Drag & drop your file here"
  };
  function L(key, params) {
    if (window.I18N) return I18N.t(key, params);
    var s = FALLBACK[key] || key;
    if (params) {
      s = String(s).replace(/\{(\w+)\}/g, function (m, p) {
        return params[p] !== undefined && params[p] !== null ? params[p] : m;
      });
    }
    return s;
  }

  /* ---------- Pinned CDN libraries (loaded on demand, never at page load) ---------- */
  T.CDN = {
    pdfLib: "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
    pdfjs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    pdfjsWorker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
    tesseract: "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js",
    xlsx: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
    heic2any: "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js",
    html2pdf: "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
  };

  /* ---------- Formatting ---------- */
  function formatBytes(bytes) {
    if (bytes === null || bytes === undefined || !isFinite(bytes) || bytes < 0) return "0 B";
    if (bytes === 0) return "0 B";
    var units = ["B", "KB", "MB", "GB"];
    var i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    var v = bytes / Math.pow(1024, i);
    return (v >= 100 ? Math.round(v).toString() : v.toFixed(1)) + " " + units[i];
  }

  /* ---------- Downloads ---------- */
  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
    T.showToast(L("dl_done", { name: filename || "file" }));
  }
  function downloadText(text, filename, mime) {
    downloadBlob(new Blob([text], { type: mime || "text/plain;charset=utf-8" }), filename);
  }

  /* ---------- File reading ---------- */
  function readAsArrayBuffer(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error(L("read_err", { name: file.name }))); };
      r.readAsArrayBuffer(file);
    });
  }
  function readAsText(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error(L("read_err", { name: file.name }))); };
      r.readAsText(file);
    });
  }
  function readAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error(L("read_err", { name: file.name }))); };
      r.readAsDataURL(file);
    });
  }
  function loadImageFile(file) {
    return readAsDataURL(file).then(function (url) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () { resolve(img); URL.revokeObjectURL(url); };
        img.onerror = function () { reject(new Error(L("not_image_file", { name: file.name }))); };
        img.src = url;
      });
    });
  }

  /* ---------- Dropzone ---------- */
  // renderDropzone(container, {accept, multiple, label, labelKey, onFiles})
  // labelKey is an i18n string id re-resolved on language switch; label is a plain fallback.
  // onFiles receives an array of File objects.
  function renderDropzone(container, opts) {
    opts = opts || {};
    var accept = opts.accept || "";
    var multiple = !!opts.multiple;
    var labelKey = opts.labelKey || null;
    var label = labelKey ? L(labelKey) : (opts.label || L("dz_default_label"));
    if (labelKey) container.setAttribute("data-dz-label-key", labelKey);
    container.innerHTML =
      '<div class="dropzone" tabindex="0" role="button" aria-label="' + T.escapeHtml(L("dz_upload_aria")) + '">' +
        '<div class="dz-icon">📁</div>' +
        '<div class="dz-text"><strong>' + T.escapeHtml(label) + "</strong><span>" + T.escapeHtml(L("dz_or")) + "</span></div>" +
        '<span class="btn btn-primary btn-sm dz-btn">' + T.escapeHtml(L("dz_select")) + "</span>" +
        '<div class="dz-file" aria-live="polite"></div>' +
        '<input type="file" class="dz-input" accept="' + String(accept).replace(/"/g, "") + '"' +
          (multiple ? " multiple" : "") + ' hidden>' +
      "</div>";
    var dz = container.querySelector(".dropzone");
    var input = container.querySelector(".dz-input");
    var fileInfo = container.querySelector(".dz-file");

    function handle(fileList) {
      var files = Array.prototype.slice.call(fileList || []);
      if (!files.length) return;
      var shown = files.slice(0, 4).map(function (f) { return f.name + " (" + formatBytes(f.size) + ")"; });
      fileInfo.textContent = shown.join(", ") + (files.length > 4 ? " " + L("dz_more", { n: files.length - 4 }) : "");
      if (opts.onFiles) opts.onFiles(multiple ? files : files.slice(0, 1));
    }
    dz.addEventListener("click", function () { input.click(); });
    dz.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
    });
    input.addEventListener("change", function () { handle(input.files); input.value = ""; });
    ["dragenter", "dragover"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("dragging"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("dragging"); });
    });
    dz.addEventListener("drop", function (e) { handle(e.dataTransfer.files); });
    return {
      clear: function () { fileInfo.textContent = ""; },
      element: dz
    };
  }

  /* ---------- CDN loader ---------- */
  var scriptCache = {};
  function loadScript(src) {
    if (scriptCache[src]) return scriptCache[src];
    var p = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      var done = false;
      s.onload = function () { if (!done) { done = true; resolve(); } };
      s.onerror = function () { if (!done) { done = true; reject(new Error("load failed")); } };
      document.head.appendChild(s);
      setTimeout(function () { if (!done) { done = true; reject(new Error("timed out")); } }, 45000);
    });
    // Don't cache rejections forever — allow a retry on next attempt.
    scriptCache[src] = p;
    p.catch(function () { delete scriptCache[src]; });
    return p;
  }
  // Shows a friendly inline error and resolves false when a CDN can't load.
  function loadScriptOrAlert(src, alertEl, friendlyMsg) {
    var msg = friendlyMsg || L("lib_fail_default");
    return loadScript(src).then(function () { return true; }).catch(function () {
      if (alertEl) {
        alertEl.innerHTML = '<div class="alert alert-error">' + T.escapeHtml(msg) + "</div>";
      } else if (T.showToast) {
        T.showToast(L("lib_fail_short"));
      }
      return false;
    });
  }

  /* ---------- Small CSV parser (handles quoted fields) ---------- */
  function parseCSV(text, delimiter) {
    delimiter = delimiter || ",";
    var rows = [], row = [], field = "", inQuotes = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else { inQuotes = false; }
        } else { field += c; }
      } else if (c === '"') { inQuotes = true; }
      else if (c === delimiter) { row.push(field); field = ""; }
      else if (c === "\r") { /* skip */ }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else { field += c; }
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return !(r.length === 1 && r[0] === ""); });
  }
  function csvCell(v) {
    v = v === null || v === undefined ? "" : String(v);
    return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }

  T.formatBytes = formatBytes;
  T.downloadBlob = downloadBlob;
  T.downloadText = downloadText;
  T.readAsArrayBuffer = readAsArrayBuffer;
  T.readAsText = readAsText;
  T.readAsDataURL = readAsDataURL;
  T.loadImageFile = loadImageFile;
  T.renderDropzone = renderDropzone;
  /* Re-translate dropzone chrome after a language switch (keeps selected files). */
  function refreshDropzones() {
    var all = document.querySelectorAll("[data-dz-label-key]");
    all.forEach(function (c) {
      var key = c.getAttribute("data-dz-label-key");
      var strong = c.querySelector(".dz-text strong");
      if (strong) strong.textContent = L(key);
      var orSpan = c.querySelector(".dz-text span");
      if (orSpan) orSpan.textContent = L("dz_or");
      var btn = c.querySelector(".dz-btn");
      if (btn) btn.textContent = L("dz_select");
      var dz = c.querySelector(".dropzone");
      if (dz) dz.setAttribute("aria-label", L("dz_upload_aria"));
    });
  }
  T.refreshDropzones = refreshDropzones;
  T.loadScript = loadScript;
  T.loadScriptOrAlert = loadScriptOrAlert;
  T.parseCSV = parseCSV;
  T.csvCell = csvCell;
})();
