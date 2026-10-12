// WebP ⇄ PNG Converter: plain JS, no dependencies, no JSX.
// Usage: const unmount = initWebpPngConverter(domElement);  later: unmount();

import { triggerDownloadProgress } from "@/components/ads/DownloadProgressPopup/DownloadProgressTrigger";
import { MAX_FILES, formatBytes, withExtension } from "../../shared/format";
import { PNG, WEBP, ACCEPT_ATTR, canEncode, canvasToBlob, kindOf, loadImage } from "../../shared/imageFile";
import { createZipFromBlobs } from "../../shared/zip";

// Yields to the browser so a long batch keeps painting its progress list.
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

/* ---------- tiny DOM helper ---------- */
function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key === "checked" || key === "disabled" || key === "value") node[key] = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value !== false && value != null) node.setAttribute(key, value);
  }
  kids.flat().forEach((child) => child != null && node.append(child));
  return node;
}

/* ---------- the tool ---------- */
export function initWebpPngConverter(root) {
  if (!root) return () => {};

  const items = [];
  const settings = { format: "png", quality: 0.9, alpha: "preserve", color: "#ffffff" };
  let uid = 0;
  let draggedIndex = null;
  let warnTimer = null;
  let busy = false;
  let webpEncodeSupported = true;

  /* static shell */
  const fileInput = el("input", { type: "file", accept: ACCEPT_ATTR(["webp", "png"]), multiple: true, hidden: true });
  const dropZone = el(
    "div",
    { class: "tool-drop", tabindex: "0", role: "button", "aria-label": "Add WebP or PNG images" },
    el("span", {
      class: "tool-drop-icon",
      html:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" ' +
        'stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/>' +
        '<circle cx="9" cy="9" r="1.8"/><path d="M21 15l-5-5L5 21"/></svg>',
    }),
    el("strong", { class: "tool-drop-title", text: "Drag WEBP / PNG files here or browse" }),
    el("span", { class: "tool-drop-hint", text: "Supports up to " + MAX_FILES + " files at once" }),
    fileInput
  );
  const warnBox = el("div", { class: "tool-alert", role: "status", hidden: true });

  /* output format segmented control */
  const segPng = el("button", { type: "button", class: "tool-seg-btn is-active", text: "To PNG" });
  const segWebp = el("button", { type: "button", class: "tool-seg-btn", text: "To WEBP" });

  /* WEBP quality (only when converting to WEBP) */
  const qualityValue = el("span", { class: "tool-value", text: "90%" });
  const qualityRange = el("input", { type: "range", class: "tool-range tool-range-inline", min: "10", max: "100", value: "90", style: "--fill: 90%" });
  const qualityRow = el(
    "div",
    { class: "tool-field", hidden: true },
    el("div", { class: "tool-label-between" }, el("span", { class: "tool-label", text: "WEBP quality" }), qualityValue),
    qualityRange,
    el("p", { class: "tool-hint", text: "Lower quality = smaller file size. 80-90% is recommended for most images." })
  );

  /* PNG transparency options (only when converting to PNG) */
  const radioPreserve = el("input", { type: "radio", name: "wpc-alpha", checked: true });
  const radioSolid = el("input", { type: "radio", name: "wpc-alpha" });
  const colorInput = el("input", { type: "color", value: settings.color, class: "tool-color" });
  const alphaRow = el(
    "div",
    { class: "tool-field wpc-field-stack", hidden: true },
    el("span", { class: "tool-label", text: "Transparency (alpha channel)" }),
    el("div", { class: "tool-pills" },
      el("label", { class: "tool-pill" }, radioPreserve, el("span", { text: "Preserve" })),
      el("label", { class: "tool-pill" }, radioSolid, el("span", { text: "Replace with solid" })))
  );
  const colorRow = el("div", { class: "tool-inline", hidden: true }, el("span", { class: "tool-label", text: "Fill colour" }), colorInput);

  const webpNote = el(
    "p",
    { class: "tool-hint", hidden: true, text: "This browser cannot encode WEBP files, so only PNG output is available." }
  );

  const btnConvert = el("button", { class: "tool-btn tool-btn-primary", text: "Convert All Files" });
  const btnSort = el("button", { class: "tool-btn tool-btn-ghost tool-btn-small", text: "Sort A-Z" });
  const btnClear = el("button", { class: "tool-btn tool-btn-ghost tool-btn-small", text: "Clear Queue" });
  const btnZip = el("button", { class: "tool-btn tool-btn-primary", text: "Download All (.ZIP)", "data-download": "true" });
  const summary = el("div", { class: "tool-mono tool-muted" });
  const list = el("div", { class: "wpc-list" });

  const progressBar = el("div", { class: "tool-progress-bar", style: "width: 0%" });
  const progressWrap = el("div", { class: "tool-progress", hidden: true }, progressBar);
  const progressText = el("div", { class: "tool-mono tool-muted", hidden: true });

  const left = el(
    "section",
    { class: "tool-col" },
    dropZone,
    warnBox,
    el(
      "div",
      { class: "tool-card" },
      el("h2", { class: "tool-card-title", text: "Conversion Settings" }),
      el("div", { class: "tool-field wpc-field-stack" },
        el("span", { class: "tool-label", text: "Output format" }),
        el("div", { class: "tool-seg" }, segPng, segWebp)),
      qualityRow,
      alphaRow,
      colorRow,
      webpNote
    ),
    el("div", { class: "tool-card" },
      el("h2", { class: "tool-card-title", text: "Batch Action" }),
      el("div", { class: "tool-actions-column" }, btnConvert))
  );

  const right = el(
    "section",
    { class: "tool-col" },
    el(
      "div",
      { class: "tool-card" },
      el("h2", { class: "tool-card-title", text: "Batch Queue" }),
      el("div", { class: "tool-actions wpc-queue-actions" }, btnSort, btnClear),
      progressWrap,
      progressText,
      list
    ),
    el(
      "div",
      { class: "tool-card" },
      el("h2", { class: "tool-card-title", text: "Download" }),
      el("div", { class: "tool-actions-column" }, btnZip, summary)
    )
  );

  root.append(
    el(
      "header",
      { class: "tool-head" },
      el("h1", { text: "WebP ⇄ PNG Converter" }),
      el("p", { text: "Convert between modern WebP and universally supported PNG, entirely in your browser." })
    ),
    el("div", { class: "tool-grid tool-grid--queue" }, left, right)
  );

  /* ---------- rendering ---------- */
  function render() {
    list.textContent = "";
    if (!items.length) {
      list.append(el("div", { class: "tool-empty", text: "No files yet. Add WebP or PNG images to start." }));
    }
    items.forEach((item, index) => {
      const outExt = settings.format;
      const badgeText =
        item.status === "queued" ? "Queued" :
        item.status === "converting" ? "Converting..." :
        item.status === "done" ? "Completed - " + formatBytes(item.blob.size) :
        "Error: " + item.error;
      const badgeKind =
        item.status === "done" ? "tool-badge tool-badge-ok" :
        item.status === "error" ? "tool-badge tool-badge-error" : "tool-badge";

      const dl = el("button", {
        class: "tool-btn tool-btn-small tool-btn-accent",
        text: outExt === "png" ? "Download PNG" : "Download WEBP",
        "data-download": "true",
        disabled: item.status !== "done",
        onClick: () => downloadItem(item),
      });
      const rm = el("button", {
        class: "tool-btn tool-btn-small tool-btn-ghost",
        text: "Remove",
        onClick: () => {
          URL.revokeObjectURL(item.url);
          items.splice(index, 1);
          render();
        },
      });

      const row = el(
        "div",
        { class: "wpc-item", draggable: "true" },
        el("div", { class: "tool-checker wpc-thumb" }, el("img", { src: item.url, alt: "" })),
        el(
          "div",
          { class: "wpc-info" },
          el("div", { class: "wpc-name", text: item.name, title: item.name }),
          el("div", { class: "wpc-meta", text: (item.width ? item.width + " × " + item.height + " px" : "-") + " | " + formatBytes(item.size) }),
          el("div", { class: "wpc-meta", text: "Format: " + (kindOf(item.file) || "image").toUpperCase() + " → " + outExt.toUpperCase() }),
          el("span", { class: badgeKind, text: badgeText })
        ),
        el("div", { class: "wpc-item-actions" }, dl, rm)
      );

      /* drag-to-reorder */
      row.addEventListener("dragstart", (e) => {
        draggedIndex = index;
        e.dataTransfer.effectAllowed = "move";
        row.classList.add("is-dragging");
      });
      row.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });
      row.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
          const moved = items.splice(draggedIndex, 1)[0];
          items.splice(index, 0, moved);
          render();
        }
      });
      row.addEventListener("dragend", () => {
        draggedIndex = null;
        row.classList.remove("is-dragging");
      });

      list.append(row);
    });

    const done = items.filter((item) => item.status === "done");
    const totalSize = done.length
      ? done.reduce((sum, item) => sum + item.blob.size, 0)
      : items.reduce((sum, item) => sum + item.size, 0);
    summary.textContent = "Total files: " + items.length + " | Total size: " + formatBytes(totalSize);
    btnZip.disabled = !done.length || busy;
    btnConvert.disabled = !items.length || busy;
    btnClear.disabled = !items.length || busy;
    btnSort.disabled = items.length < 2 || busy;

    qualityRow.hidden = settings.format !== "webp";
    alphaRow.hidden = settings.format !== "png";
    colorRow.hidden = settings.format !== "png" || settings.alpha !== "solid";
    webpNote.hidden = webpEncodeSupported || settings.format !== "webp";
    segPng.classList.toggle("is-active", settings.format === "png");
    segWebp.classList.toggle("is-active", settings.format === "webp");
    segWebp.disabled = !webpEncodeSupported;
  }

  function warn(message) {
    warnBox.textContent = message;
    warnBox.hidden = false;
    clearTimeout(warnTimer);
    warnTimer = setTimeout(() => (warnBox.hidden = true), 6000);
  }

  /* ---------- conversion ---------- */
  async function convertItem(item) {
    item.status = "converting";
    render();
    await tick();
    try {
      const canvas = document.createElement("canvas");
      canvas.width = item.width;
      canvas.height = item.height;
      const ctx = canvas.getContext("2d");
      if (settings.format === "png" && settings.alpha === "solid") {
        ctx.fillStyle = settings.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(item.img, 0, 0);
      item.blob =
        settings.format === "png"
          ? await canvasToBlob(canvas, PNG)
          : await canvasToBlob(canvas, WEBP, settings.quality);
      item.status = "done";
    } catch (err) {
      item.status = "error";
      item.error = err.message;
    }
    render();
  }

  async function convertAll(queue) {
    if (!queue.length || busy) return;
    busy = true;
    progressWrap.hidden = false;
    progressText.hidden = false;
    progressBar.style.width = "0%";
    render();
    let converted = 0;
    for (const item of queue) {
      progressText.textContent = "Converting " + (converted + 1) + " of " + queue.length + ": " + item.name;
      await convertItem(item);
      converted++;
      progressBar.style.width = Math.round((converted / queue.length) * 100) + "%";
    }
    progressWrap.hidden = true;
    progressText.hidden = true;
    busy = false;
    render();
  }

  async function addFiles(fileList) {
    const added = [];
    for (const file of Array.from(fileList)) {
      const kind = kindOf(file);
      if (kind !== "webp" && kind !== "png") {
        warn('"' + file.name + '" rejected: not a WebP or PNG file.');
        continue;
      }
      if (items.length >= MAX_FILES) {
        warn("Limit of " + MAX_FILES + " files reached. Extra files were skipped.");
        break;
      }
      try {
        const loaded = await loadImage(file);
        const item = {
          id: ++uid,
          file,
          name: file.name,
          url: loaded.url,
          img: loaded.img,
          width: loaded.width,
          height: loaded.height,
          size: loaded.size,
          status: "queued",
        };
        items.push(item);
        added.push(item);
      } catch (err) {
        warn(err.message);
      }
    }
    render();
    await convertAll(added);
  }

  /* ---------- downloads ---------- */
  function downloadItem(item) {
    const url = URL.createObjectURL(item.blob);
    const outputName = withExtension(item.name, settings.format);
    triggerDownloadProgress({
      countdownMs: 5000,
      durationMs: 3000,
      title: "Preparing your " + settings.format.toUpperCase() + " image",
      description: "Your converted image is being saved.",
      onDownloadStart: () => {
        const a = document.createElement("a");
        a.href = url;
        a.download = outputName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    });
  }

  async function handleZipDownload() {
    busy = true;
    render();
    const files = items
      .filter((item) => item.status === "done")
      .map((item) => ({ name: withExtension(item.name, settings.format), blob: item.blob }));
    const zipBlob = await createZipFromBlobs(files);
    const url = URL.createObjectURL(zipBlob);
    const zipName = (settings.format === "png" ? "webp-to-png" : "png-to-webp") + ".zip";
    triggerDownloadProgress({
      countdownMs: 5000,
      durationMs: 3000,
      title: "Preparing your ZIP archive",
      description: "All converted images are being packaged.",
      onDownloadStart: () => {
        const a = document.createElement("a");
        a.href = url;
        a.download = zipName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    });
    busy = false;
    render();
  }

  /* ---------- events ---------- */
  const on = (target, event, handler) => target.addEventListener(event, handler);

  on(dropZone, "click", () => fileInput.click());
  on(dropZone, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
  on(fileInput, "change", () => { addFiles(fileInput.files); fileInput.value = ""; });
  on(dropZone, "dragover", (e) => { e.preventDefault(); dropZone.classList.add("is-dragging"); });
  on(dropZone, "dragleave", () => dropZone.classList.remove("is-dragging"));
  on(dropZone, "drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("is-dragging");
    addFiles(e.dataTransfer.files);
  });

  on(segPng, "click", () => { settings.format = "png"; render(); });
  on(segWebp, "click", () => { if (webpEncodeSupported) { settings.format = "webp"; render(); } });
  on(qualityRange, "input", () => {
    settings.quality = parseInt(qualityRange.value, 10) / 100;
    qualityValue.textContent = qualityRange.value + "%";
    qualityRange.style.setProperty("--fill", qualityRange.value + "%");
  });
  on(radioPreserve, "change", () => { settings.alpha = "preserve"; render(); });
  on(radioSolid, "change", () => { settings.alpha = "solid"; render(); });
  on(colorInput, "input", () => { settings.color = colorInput.value; });

  on(btnConvert, "click", () => convertAll(items.slice()));
  on(btnSort, "click", () => { items.sort((a, b) => a.name.localeCompare(b.name)); render(); });
  on(btnClear, "click", () => {
    items.forEach((item) => URL.revokeObjectURL(item.url));
    items.length = 0;
    render();
  });
  on(btnZip, "click", handleZipDownload);

  /* Safari historically refused to encode image/webp; check before offering it. */
  canEncode(WEBP).then((supported) => {
    webpEncodeSupported = supported;
    if (!supported && settings.format === "webp") settings.format = "png";
    render();
  });

  render();

  /* cleanup */
  return function unmount() {
    clearTimeout(warnTimer);
    items.forEach((item) => URL.revokeObjectURL(item.url));
    items.length = 0;
    root.textContent = "";
  };
}
