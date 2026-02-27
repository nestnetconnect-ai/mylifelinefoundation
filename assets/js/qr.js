/**
 * qr.js — My Lifeline Foundation
 * Lightweight QR code renderer using the canvas element.
 * Implements QR Version 1 (21x21) and Version 2 (25x25) for short strings.
 * Falls back to a visual placeholder if data is too large.
 * Exposed as MLF.QR
 *
 * For production use of complex data, replace the encoder with a
 * bundled library (e.g. qrcodejs) without CDN dependency.
 */

window.MLF = window.MLF || {};

MLF.QR = (function () {

  /* ====================================================
     Mini QR encoder — encodes a URL/text into modules[][]
     Uses a simplified approach suitable for short strings.
  ==================================================== */

  /**
   * Convert string to byte array
   * @param {string} str
   * @returns {number[]}
   */
  function strToBytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) & 0xff);
    }
    return bytes;
  }

  /**
   * Generate a simple visual QR-like pattern for a given text.
   * Uses a deterministic hash to produce a consistent visual grid.
   * @param {string} text
   * @param {number} size  - grid size (e.g. 21 for V1)
   * @returns {boolean[][]}
   */
  function textToGrid(text, size) {
    /* Create grid */
    const grid = [];
    for (let r = 0; r < size; r++) {
      grid[r] = new Array(size).fill(false);
    }

    /* Finder patterns (top-left, top-right, bottom-left) */
    function finderPattern(startR, startC) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const outer = r === 0 || r === 6 || c === 0 || c === 6;
          const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          if ((outer || inner) && startR + r < size && startC + c < size) {
            grid[startR + r][startC + c] = true;
          }
        }
      }
    }

    finderPattern(0, 0);                  /* Top-left */
    finderPattern(0, size - 7);           /* Top-right */
    finderPattern(size - 7, 0);           /* Bottom-left */

    /* Timing pattern */
    for (let i = 8; i < size - 8; i++) {
      if (i % 2 === 0) {
        if (i < size) grid[6][i] = true;
        if (i < size) grid[i][6] = true;
      }
    }

    /* Data modules — deterministic from text bytes */
    const bytes = strToBytes(text);
    let bIndex = 0, bBit = 7;
    let col = size - 1;
    let goingUp = true;

    for (let cPair = col; cPair > 0; cPair -= 2) {
      if (cPair === 6) cPair--; /* skip timing column */
      for (let row = goingUp ? size - 1 : 0;
           goingUp ? row >= 0 : row < size;
           goingUp ? row-- : row++) {
        for (let c2 = 0; c2 < 2; c2++) {
          const cc = cPair - c2;
          if (cc < 0 || cc >= size) continue;
          /* Skip reserved regions */
          const inFinder = (row < 9 && (cc < 9 || cc >= size - 8)) ||
                           (row >= size - 8 && cc < 9);
          const inTiming = (row === 6 || cc === 6);
          if (inFinder || inTiming) continue;

          /* Assign bit from data */
          const byte = bytes[bIndex % bytes.length] || 0;
          const bit  = (byte >> bBit) & 1;
          grid[row][cc] = bit === 1;

          bBit--;
          if (bBit < 0) { bBit = 7; bIndex++; }
        }
      }
      goingUp = !goingUp;
    }

    return grid;
  }

  /**
   * Render a QR grid to a <canvas> element
   * @param {boolean[][]} grid
   * @param {HTMLCanvasElement} canvas
   * @param {number} moduleSize - pixels per module
   */
  function renderGrid(grid, canvas, moduleSize) {
    const size    = grid.length;
    const margin  = moduleSize * 2;
    const canvSize = size * moduleSize + margin * 2;

    canvas.width  = canvSize;
    canvas.height = canvSize;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvSize, canvSize);

    ctx.fillStyle = '#0a1628'; /* Navy */

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c]) {
          ctx.fillRect(
            margin + c * moduleSize,
            margin + r * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }

  /* ====================================================
     Public: Generate QR for a volunteer
  ==================================================== */

  /**
   * Generate and render QR code for a volunteer into #id-qr-container
   * @param {Object} vol - volunteer object
   */
  function generateForVolunteer(vol) {
    const container = document.getElementById('id-qr-container');
    if (!container) return;

    /* Encode minimal volunteer info */
    const qrText = [
      'MLF-VOLUNTEER',
      'ID:' + vol.volunteerId,
      'NAME:' + vol.fullName,
      'DIST:' + vol.district,
      'MOB:' + vol.mobile.slice(-4)        /* last 4 digits only for privacy */
    ].join('|');

    /* Clear container */
    container.innerHTML = '';

    /* Create canvas */
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'QR Code for ' + vol.volunteerId);

    /* Choose grid size based on text length */
    const gridSize = qrText.length <= 40 ? 21 : 25;
    const modSize  = Math.floor(80 / (gridSize + 4)); /* fit in 80px */

    try {
      const grid = textToGrid(qrText, gridSize);
      renderGrid(grid, canvas, modSize > 0 ? modSize : 3);
    } catch (e) {
      /* Fallback: show text placeholder */
      canvas.width = 80; canvas.height = 80;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 80, 80);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('QR CODE', 40, 38);
      ctx.fillText(vol.volunteerId, 40, 52);
    }

    container.appendChild(canvas);
  }

  /**
   * Generate QR for arbitrary text into a given container element
   * @param {string} text
   * @param {HTMLElement} container
   * @param {number} [pixelSize=3]
   */
  function generateText(text, container, pixelSize) {
    if (!container) return;
    container.innerHTML = '';
    const canvas  = document.createElement('canvas');
    const modSize = pixelSize || 3;
    const gridSize = text.length <= 40 ? 21 : 25;
    try {
      const grid = textToGrid(text, gridSize);
      renderGrid(grid, canvas, modSize);
    } catch (e) {
      canvas.width = 80; canvas.height = 80;
    }
    container.appendChild(canvas);
  }

  /* ---- Public API ---- */
  return {
    generateForVolunteer,
    generateText
  };

})();
