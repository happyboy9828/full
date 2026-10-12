// src/utility/tool.js

import { triggerDownloadProgress } from '@/components/ads/DownloadProgressPopup/DownloadProgressTrigger';

export function initJpgPngConverter(container) {
  let imageQueue = [];
  let conversionResults = [];
  let isProcessing = false;

  // Options State
  let outputFormat = 'png'; // 'png' | 'jpg'
  let jpgQuality = 0.9; // 0.1 to 1.0
  let preserveTransparency = true;

  renderUI();

  function renderUI() {
    container.innerHTML = `
      <div class="jpg-png-container">
        <header class="jpg-png-header">
          <h1>JPG ⇄ PNG Converter</h1>
          <p>Convert images between JPEG and PNG formats with quality control.</p>
        </header>

        <div class="jpg-png-layout">
          <!-- LEFT COLUMN: Settings & Queue -->
          <div class="jpg-png-left">
            <div class="card">
              <!-- Drop Zone -->
              <div id="dropZone" class="drop-zone">
                <div class="drop-zone-icon">🖼️</div>
                <p class="drop-zone-text">
                  Drag JPG / PNG images here or 
                  <label for="fileInput" class="browse-label">Browse</label>
                </p>
                <input type="file" id="fileInput" accept="image/jpeg, image/png" multiple style="display: none;" />
              </div>

              <div id="activeFilesBanner" class="active-doc-banner" style="display: none;">
                <span id="filesCountDisplay">0 images selected</span>
                <button id="clearFilesBtn" class="btn-remove" title="Clear All">&times;</button>
              </div>

              <hr class="divider" />

              <!-- Output Format Selection -->
              <div class="form-group">
                <label class="section-title">Output Format</label>
                <div class="button-group">
                  <button type="button" class="btn-toggle ${outputFormat === 'png' ? 'active' : ''}" data-format="png">To PNG</button>
                  <button type="button" class="btn-toggle ${outputFormat === 'jpg' ? 'active' : ''}" data-format="jpg">To JPG</button>
                </div>
              </div>

              <!-- JPG Quality (only shown when output is JPG) -->
              <div id="jpgQualityGroup" class="form-group" style="${outputFormat === 'jpg' ? '' : 'display: none;'}">
                <label class="section-title">JPG Quality</label>
                <div class="slider-group">
                  <div class="slider-header">
                    <span>Quality:</span>
                    <strong id="qualityValueDisplay">${Math.round(jpgQuality * 100)}%</strong>
                  </div>
                  <input type="range" id="qualitySlider" min="10" max="100" value="${jpgQuality * 100}" class="slider-input" />
                </div>
                <p class="hint-text">Lower quality = smaller file size. 80-90% is recommended for most photos.</p>
              </div>

              <!-- PNG Options (only shown when output is PNG) -->
              <div id="pngOptionsGroup" class="form-group" style="${outputFormat === 'png' ? '' : 'display: none;'}">
                <label class="section-title">PNG Options</label>
                <label class="radio-label">
                  <input type="checkbox" id="preserveTransparency" ${preserveTransparency ? 'checked' : ''} />
                  Preserve transparency (recommended for graphics)
                </label>
                <p class="hint-text">When disabled, transparent areas will be filled with white background.</p>
              </div>

              <hr class="divider" />

              <!-- Image Queue -->
              <div class="section-title-wrapper">
                <span class="section-title">Images to Convert</span>
                <span id="queueCount" class="badge">0 Images</span>
              </div>

              <div id="imageList" class="image-queue-list">
                <p class="placeholder-text">No images added yet.</p>
              </div>

              <!-- Quick Actions -->
              <div class="quick-actions">
                <button id="sortAZBtn" class="btn-secondary-sm">Sort A-Z</button>
                <button id="clearAllBtn" class="btn-secondary-sm btn-danger-text">Clear All</button>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Results Preview -->
          <div class="jpg-png-right">
            <div class="card preview-card">
              <h3>Converted Images</h3>

              <!-- Progress Bar -->
              <div id="progressWrapper" class="progress-wrapper" style="display: none;">
                <div class="progress-container">
                  <div id="progressBar" class="progress-bar"></div>
                </div>
                <span id="progressStatus" class="progress-status-text">Processing...</span>
              </div>

              <!-- Thumbnails Container -->
              <div class="thumbnails-header">Converted Image Previews</div>
              <div id="thumbnailsContainer" class="thumbnail-grid-area">
                <p class="placeholder-text">Add images and click Convert to see previews.</p>
              </div>

              <!-- Status Indicator -->
              <div class="status-box">
                Status: <strong id="statusText">Awaiting Images...</strong>
              </div>

              <!-- Action Bar -->
              <div class="action-bar">
                <button id="convertBtn" class="btn-primary" disabled>Convert Images</button>
                <button id="downloadZipBtn" class="btn-success" disabled style="margin-top: 8px;">Download All (.ZIP)</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    attachEventListeners();
  }

  function attachEventListeners() {
    const dropZone = container.querySelector('#dropZone');
    const fileInput = container.querySelector('#fileInput');
    const clearFilesBtn = container.querySelector('#clearFilesBtn');
    const convertBtn = container.querySelector('#convertBtn');
    const downloadZipBtn = container.querySelector('#downloadZipBtn');
    const qualitySlider = container.querySelector('#qualitySlider');
    const formatButtons = container.querySelectorAll('[data-format]');
    const preserveTransparencyCheckbox = container.querySelector('#preserveTransparency');
    const clearAllBtn = container.querySelector('#clearAllBtn');
    const sortAZBtn = container.querySelector('#sortAZBtn');

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files) {
        handleFiles(Array.from(e.target.files));
        e.target.value = '';
      }
    });

    clearFilesBtn.addEventListener('click', () => {
      imageQueue = [];
      renderQueueList();
      updateUI();
    });

    // Format Toggle
    formatButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        formatButtons.forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');
        outputFormat = e.target.getAttribute('data-format');
        toggleFormatOptions();
        renderQueueList(); // Re-render to show correct output format badges
      });
    });

    // Quality Slider
    qualitySlider.addEventListener('input', (e) => {
      jpgQuality = parseInt(e.target.value, 10) / 100;
      container.querySelector('#qualityValueDisplay').textContent = `${e.target.value}%`;
    });

    // Preserve Transparency Checkbox
    preserveTransparencyCheckbox.addEventListener('change', (e) => {
      preserveTransparency = e.target.checked;
    });

    // Quick Actions
    clearAllBtn.addEventListener('click', () => {
      imageQueue = [];
      conversionResults = [];
      renderQueueList();
      clearOutputs();
      updateUI();
    });

    sortAZBtn.addEventListener('click', () => {
      imageQueue.sort((a, b) => a.name.localeCompare(b.name));
      renderQueueList();
    });

    // Convert Action
    convertBtn.addEventListener('click', processConversion);

    // ZIP Download Action
    downloadZipBtn.addEventListener('click', handleZipDownload);
  }

  function toggleFormatOptions() {
    const jpgGroup = container.querySelector('#jpgQualityGroup');
    const pngGroup = container.querySelector('#pngOptionsGroup');
    
    if (outputFormat === 'jpg') {
      jpgGroup.style.display = '';
      pngGroup.style.display = 'none';
    } else {
      jpgGroup.style.display = 'none';
      pngGroup.style.display = '';
    }
  }

  function handleFiles(files) {
    const validTypes = ['image/jpeg', 'image/png'];
    const filteredFiles = files.filter((f) => validTypes.includes(f.type));

    if (filteredFiles.length === 0) {
      alert('Please select valid image files (JPG or PNG).');
      return;
    }

    let loadedCount = 0;
    filteredFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        imageQueue.push({
          id: Math.random().toString(36).substr(2, 9),
          file: file,
          name: file.name,
          dataUrl: e.target.result,
          type: file.type,
          size: file.size
        });
        loadedCount++;
        if (loadedCount === filteredFiles.length) {
          renderQueueList();
          updateUI();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function renderQueueList() {
    const listContainer = container.querySelector('#imageList');
    const queueCount = container.querySelector('#queueCount');
    const convertBtn = container.querySelector('#convertBtn');
    const filesCountDisplay = container.querySelector('#filesCountDisplay');
    const activeFilesBanner = container.querySelector('#activeFilesBanner');
    const dropZone = container.querySelector('#dropZone');

    queueCount.textContent = `${imageQueue.length} Image${imageQueue.length === 1 ? '' : 's'}`;
    filesCountDisplay.textContent = `${imageQueue.length} image${imageQueue.length === 1 ? '' : 's'} selected`;
    convertBtn.disabled = imageQueue.length === 0;

    if (imageQueue.length === 0) {
      listContainer.innerHTML = '<p class="placeholder-text">No images added yet.</p>';
      activeFilesBanner.style.display = 'none';
      dropZone.style.display = 'block';
      return;
    }

    activeFilesBanner.style.display = 'flex';
    dropZone.style.display = 'none';
    listContainer.innerHTML = '';

    imageQueue.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'queue-item';
      row.draggable = true;
      row.dataset.index = index;

      const inputExt = item.name.split('.').pop().toLowerCase();
      const outputExt = outputFormat;
      const outputName = item.name.replace(/\.[^/.]+$/, '') + '.' + outputExt;

      row.innerHTML = `
        <span class="drag-handle">☰</span>
        <div class="thumb-preview">
          <img src="${item.dataUrl}" alt="${item.name}" />
        </div>
        <div class="file-info">
          <span class="file-name" title="${item.name}">${item.name}</span>
          <span class="file-meta">${formatFileSize(item.size)} • ${inputExt.toUpperCase()} → ${outputExt.toUpperCase()}</span>
        </div>
        <button class="btn-remove" title="Remove image">&times;</button>
      `;

      // Drag and Drop ordering handlers
      row.addEventListener('dragstart', (e) => {
        draggedIndex = index;
        e.dataTransfer.effectAllowed = 'move';
        row.classList.add('dragging');
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
          const movedItem = imageQueue.splice(draggedIndex, 1)[0];
          imageQueue.splice(index, 0, movedItem);
          renderQueueList();
        }
      });

      row.addEventListener('dragend', () => {
        draggedIndex = null;
        row.classList.remove('dragging');
      });

      // Delete item handler
      row.querySelector('.btn-remove').addEventListener('click', () => {
        imageQueue.splice(index, 1);
        renderQueueList();
        updateUI();
      });

      listContainer.appendChild(row);
    });
  }

  let draggedIndex = null;

  function updateUI() {
    const activeFilesBanner = container.querySelector('#activeFilesBanner');
    const dropZone = container.querySelector('#dropZone');
    const filesCountDisplay = container.querySelector('#filesCountDisplay');
    
    if (imageQueue.length === 0) {
      activeFilesBanner.style.display = 'none';
      dropZone.style.display = 'block';
    } else {
      activeFilesBanner.style.display = 'flex';
      dropZone.style.display = 'none';
      filesCountDisplay.textContent = `${imageQueue.length} image${imageQueue.length === 1 ? '' : 's'} selected`;
    }
  }

  async function processConversion() {
    if (imageQueue.length === 0 || isProcessing) return;

    isProcessing = true;
    clearOutputs();

    const convertBtn = container.querySelector('#convertBtn');
    const downloadZipBtn = container.querySelector('#downloadZipBtn');
    const progressWrapper = container.querySelector('#progressWrapper');
    const progressBar = container.querySelector('#progressBar');
    const progressStatus = container.querySelector('#progressStatus');
    const statusText = container.querySelector('#statusText');
    const thumbsContainer = container.querySelector('#thumbnailsContainer');

    convertBtn.disabled = true;
    downloadZipBtn.disabled = true;
    progressWrapper.style.display = 'block';
    thumbsContainer.innerHTML = '';
    statusText.textContent = 'Converting...';

    const totalImages = imageQueue.length;

    for (let i = 0; i < totalImages; i++) {
      const item = imageQueue[i];
      progressStatus.textContent = `Converting ${i + 1} of ${totalImages}: ${item.name}...`;
      progressBar.style.width = `${Math.round(((i + 1) / totalImages) * 100)}%`;

      try {
        const result = await convertImage(item);
        conversionResults.push(result);
        appendThumbnailCard(result);
      } catch (err) {
        console.error('Conversion failed for', item.name, err);
        appendErrorCard(item.name, err.message);
      }
    }

    progressWrapper.style.display = 'none';
    statusText.textContent = `Conversion Complete (${conversionResults.length} / ${totalImages})`;
    convertBtn.disabled = false;

    if (conversionResults.length > 0) {
      downloadZipBtn.disabled = false;
    }

    isProcessing = false;
  }

  function convertImage(item) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          // Handle transparency for PNG output
          if (outputFormat === 'png' && !preserveTransparency) {
            // Fill with white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          const mimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
          const quality = outputFormat === 'jpg' ? jpgQuality : undefined;

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }

            const dataUrl = canvas.toDataURL(mimeType, quality);
            const outputName = item.name.replace(/\.[^/.]+$/, '') + '.' + outputFormat;

            resolve({
              originalName: item.name,
              name: outputName,
              blob: blob,
              dataUrl: dataUrl,
              width: img.width,
              height: img.height,
              size: blob.size,
              format: outputFormat
            });
          }, mimeType, quality);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = item.dataUrl;
    });
  }

  function appendThumbnailCard(result) {
    const thumbsContainer = container.querySelector('#thumbnailsContainer');
    
    // Remove placeholder if present
    const placeholder = thumbsContainer.querySelector('.placeholder-text');
    if (placeholder) placeholder.remove();

    const card = document.createElement('div');
    card.className = 'thumb-card';

    const img = document.createElement('img');
    img.src = result.dataUrl;
    img.alt = result.name;

    const label = document.createElement('span');
    label.textContent = result.name;

    const info = document.createElement('div');
    info.className = 'thumb-info';
    info.innerHTML = `${result.width}×${result.height} • ${formatFileSize(result.size)}`;

    const downloadSingleBtn = document.createElement('button');
    downloadSingleBtn.className = 'btn-secondary-sm';
    downloadSingleBtn.textContent = `Download ${outputFormat.toUpperCase()}`;
    downloadSingleBtn.onclick = (e) => {
      e.stopPropagation();
      triggerDownload(result.blob, result.name);
    };

    card.appendChild(img);
    card.appendChild(label);
    card.appendChild(info);
    card.appendChild(downloadSingleBtn);
    thumbsContainer.appendChild(card);
  }

  function appendErrorCard(fileName, errorMessage) {
    const thumbsContainer = container.querySelector('#thumbnailsContainer');
    
    const card = document.createElement('div');
    card.className = 'thumb-card error-card';
    card.innerHTML = `
      <div class="error-icon">⚠️</div>
      <span class="file-name">${fileName}</span>
      <span class="error-message">${errorMessage}</span>
    `;
    thumbsContainer.appendChild(card);
  }

  function clearOutputs() {
    conversionResults = [];
    const thumbsContainer = container.querySelector('#thumbnailsContainer');
    thumbsContainer.innerHTML = '<p class="placeholder-text">Add images and click Convert to see previews.</p>';
    container.querySelector('#downloadZipBtn').disabled = true;
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    triggerDownloadProgress({
      countdownMs: 3000,
      durationMs: 2000,
      title: `Preparing your ${outputFormat.toUpperCase()} image`,
      description: 'Your converted image is being saved.',
      onDownloadStart: () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    });
  }

  async function handleZipDownload() {
    const zip = new window.JSZip();

    conversionResults.forEach((item) => {
      zip.file(item.name, item.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const zipFilename = `converted_${outputFormat}_images.zip`;

    triggerDownloadProgress({
      countdownMs: 5000,
      durationMs: 3000,
      title: 'Preparing your ZIP archive',
      description: 'All converted images are being packaged.',
      onDownloadStart: () => {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = zipFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    });
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}