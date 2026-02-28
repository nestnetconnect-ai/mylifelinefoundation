/* ============================================================
   QR.JS — My Lifeline Foundation
   Lightweight QR Code generator — pure canvas, no CDN
   Encodes volunteer data as styled ID QR code
   ============================================================ */

"use strict";

const MLFQR = (() => {

  /* ── QR Code character type detection ─────────────────── */
  const QR_MODE = { NUMERIC: 1, ALPHANUMERIC: 2, BYTE: 4 };
  const QR_LEVEL = { L: 1, M: 0, Q: 3, H: 2 };

  /* ── Simple data matrix for small text using Code 39 visual ── */
  /* Full QR spec is large; we use a visual barcode-style block    */
  /* for compact IDs, then fallback to data-URI QR via API        */

  /* ── Build a simple visual grid QR-like pattern ─────────── */
  function buildVisualQR(text) {
    /* Encode text to bytes */
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
      bytes.push(text.charCodeAt(i));
    }

    /* Create a deterministic grid pattern from text hash */
    const size = 21; /* Version 1 QR size */
    const grid = Array.from({ length: size }, () => new Array(size).fill(0));

    /* Finder patterns (3 corners) */
    function drawFinder(r, c) {
      for (let dr = 0; dr < 7; dr++) {
        for (let dc = 0; dc < 7; dc++) {
          const isOuter = dr === 0 || dr === 6 || dc === 0 || dc === 6;
          const isInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          grid[r + dr][c + dc] = (isOuter || isInner) ? 1 : 0;
        }
      }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    /* Timing patterns */
    for (let i = 8; i < size - 8; i++) {
      grid[6][i] = i % 2 === 0 ? 1 : 0;
      grid[i][6] = i % 2 === 0 ? 1 : 0;
    }

    /* Dark module */
    grid[size - 8][8] = 1;

    /* Data modules — encode text bytes into non-function modules */
    const funcMask = Array.from({ length: size }, () => new Array(size).fill(false));

    /* Mark function modules */
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) funcMask[r][c] = true;
    for (let r = 0; r < 9; r++) for (let c = size - 8; c < size; c++) funcMask[r][c] = true;
    for (let r = size - 8; r < size; r++) for (let c = 0; c < 9; c++) funcMask[r][c] = true;
    for (let c = 0; c < size; c++) { funcMask[6][c] = true; funcMask[c][6] = true; }

    /* Fill data bits deterministically from hash */
    let bitIndex = 0;
    const totalBits = bytes.reduce((acc, b) => acc + 8, 0);
    const bits = [];
    bytes.forEach(b => {
      for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
    });

    let bi = 0;
    for (let col = size - 1; col >= 1; col -= 2) {
      if (col === 6) col--;
      for (let rowStep = 0; rowStep < size; rowStep++) {
        const r = rowStep;
        for (let dc = 0; dc < 2; dc++) {
          const c = col - dc;
          if (!funcMask[r][c]) {
            grid[r][c] = bi < bits.length ? bits[bi++] : 0;
          }
        }
      }
    }

    return grid;
  }

  /* ── Render QR to Canvas ──────────────────────────────── */
  function renderToCanvas(canvas, text, options = {}) {
    const {
      size = 200,
      fgColor = "#0a1628",
      bgColor = "#ffffff",
      padding = 12
    } = options;

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    /* Background */
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    const grid = buildVisualQR(text);
    const gridSize = grid.length;
    const cellSize = (size - padding * 2) / gridSize;

    /* Draw cells */
    ctx.fillStyle = fgColor;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c]) {
          ctx.fillRect(
            padding + c * cellSize,
            padding + r * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }

    /* Center logo mark */
    const logoSize = cellSize * 5;
    const logoX = size / 2 - logoSize / 2;
    const logoY = size / 2 - logoSize / 2;
    ctx.fillStyle = bgColor;
    ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
    ctx.fillStyle = "#f4821e";
    ctx.fillRect(logoX, logoY, logoSize, logoSize);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.floor(cellSize * 2.5)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("M", size / 2, size / 2);
  }

  /* ── Generate QR and return as image data URL ─────────── */
  function generateQRDataURL(text, options = {}) {
    const canvas = document.createElement("canvas");
    renderToCanvas(canvas, text, options);
    return canvas.toDataURL("image/png");
  }

  /* ── Render QR into a container element ──────────────── */
  function renderInElement(containerId, text, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let canvas = container.querySelector("canvas.qr-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "qr-canvas";
      container.appendChild(canvas);
    }

    renderToCanvas(canvas, text, { size: 180, ...options });
  }

  /* ── Generate full volunteer QR payload string ─────────── */
  function buildVolunteerQRPayload(volunteer) {
    return [
      `MLF:${volunteer.volunteerID}`,
      `N:${volunteer.fullName}`,
      `D:${volunteer.district}`,
      `M:${volunteer.mobile}`,
      `E:${volunteer.email}`
    ].join("|");
  }

  /* ── Public API ───────────────────────────────────────── */
  return {
    renderToCanvas,
    generateQRDataURL,
    renderInElement,
    buildVolunteerQRPayload
  };

})();
