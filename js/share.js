/* FLARE — real shareable completion cards.
   Renders a riso-print certificate on a canvas, then hands a PNG to the Android
   share sheet (or the browser share sheet / a download on the web). */
window.FLARE_SHARE = (function () {
  const W = 1080;
  const H = 1350;
  const PAPER = '#F1E8D7';
  const CREAM = '#FBF5E8';
  const INK = '#181510';
  const MUTED = '#6C6151';
  const TOMATO = '#E8451F';
  const COBALT = '#2F49D1';
  const MARIGOLD = '#E3A11C';
  const SAGE = '#5C7F68';
  const MONO = '"IBM Plex Mono", "Courier New", monospace';
  const SANS = 'Archivo, "Helvetica Neue", Arial, sans-serif';

  function cap() {
    return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
      ? window.Capacitor
      : null;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function shortDate(value) {
    if (!value) return '—';
    const p = String(value).split('-').map(Number);
    const d = new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function sanitize(value) {
    return String(value || 'challenge')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 34) || 'challenge';
  }

  async function fontsReady() {
    if (!document.fonts || !document.fonts.load) return;
    try {
      await Promise.all([
        document.fonts.load('800 80px Archivo'),
        document.fonts.load('500 26px Archivo'),
        document.fonts.load('400 26px Archivo'),
        document.fonts.load('500 20px "IBM Plex Mono"'),
        document.fonts.load('600 20px "IBM Plex Mono"'),
      ]);
      await document.fonts.ready;
    } catch (err) {
      /* System fallbacks still produce a readable card. */
    }
  }

  function wrap(ctx, text, maxWidth, maxLines) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    words.forEach(function (word) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    if (maxLines && lines.length > maxLines) {
      const kept = lines.slice(0, maxLines);
      kept[maxLines - 1] = kept[maxLines - 1].replace(/[.,;:!?]?$/, '…');
      return kept;
    }
    return lines;
  }

  function box(ctx, x, y, w, h, fill, stroke, lineWidth) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth || 2;
      ctx.strokeRect(x + (lineWidth || 2) / 2, y + (lineWidth || 2) / 2, w - (lineWidth || 2), h - (lineWidth || 2));
    }
  }

  function drawBackground(ctx) {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    /* Print grid */
    ctx.strokeStyle = 'rgba(24,21,16,0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 54) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 54) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    /* Riso ink shapes, kept behind the type */
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = MARIGOLD;
    ctx.beginPath();
    ctx.arc(1010, 20, 250, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COBALT;
    ctx.beginPath();
    ctx.arc(30, 1340, 210, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = TOMATO;
    ctx.fillRect(760, 1080, 320, 260);
    ctx.restore();

    /* Frame */
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(38, 38, W - 76, H - 76);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(52, 52, W - 104, H - 104);
  }

  function drawHeader(ctx) {
    box(ctx, 72, 88, 50, 50, TOMATO, INK, 2);
    ctx.fillStyle = CREAM;
    ctx.font = '800 28px ' + SANS;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', 97, 114);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = INK;
    ctx.font = '800 32px ' + SANS;
    ctx.fillText('FLARE', 138, 124);

    ctx.fillStyle = MUTED;
    ctx.font = '500 17px ' + MONO;
    ctx.textAlign = 'right';
    ctx.fillText('CERTIFICATE · 21', 1008, 120);

    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(72, 164);
    ctx.lineTo(1008, 164);
    ctx.stroke();
  }

  function drawTitle(ctx, record) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = TOMATO;
    ctx.font = '600 18px ' + MONO;
    ctx.fillText('21 OF 21 DAYS · CHALLENGE COMPLETE', 72, 218);

    const name = String(record.name || 'My challenge').toUpperCase();
    const size = name.length > 30 ? 56 : name.length > 20 ? 66 : 78;
    ctx.font = '800 ' + size + 'px ' + SANS;
    ctx.fillStyle = INK;
    const lines = wrap(ctx, name, 880, 2);
    const lineHeight = size * 0.94;
    let y = 218 + size + 18;
    lines.forEach(function (line) {
      ctx.fillText(line, 72, y);
      y += lineHeight;
    });

    ctx.font = '500 24px ' + SANS;
    ctx.fillStyle = MUTED;
    const tagline = wrap(ctx, record.tagline || 'Twenty-one days of showing up.', 860, 2);
    let ty = y + 6;
    tagline.forEach(function (line) {
      ctx.fillText(line, 72, ty);
      ty += 32;
    });
    return ty;
  }

  function drawGrid(ctx, y) {
    const w = 936;
    const h = 292;
    box(ctx, 72, y, w, h, CREAM, INK, 3);

    ctx.fillStyle = MUTED;
    ctx.font = '600 14px ' + MONO;
    ctx.textAlign = 'left';
    ctx.fillText('THE RECEIPT · EVERY DAY MARKED', 94, y + 32);

    const gap = 10;
    const cellW = (w - 44 - gap * 6) / 7;
    const cellH = 62;
    const startX = 94;
    const startY = y + 50;

    for (let day = 1; day <= 21; day++) {
      const col = (day - 1) % 7;
      const row = Math.floor((day - 1) / 7);
      const x = startX + col * (cellW + gap);
      const cy = startY + row * (cellH + gap);
      const milestone = day === 7 || day === 14 || day === 21;
      box(ctx, x, cy, cellW, cellH, milestone ? MARIGOLD : INK, INK, 1.5);
      ctx.fillStyle = milestone ? INK : CREAM;
      ctx.font = '600 15px ' + MONO;
      ctx.textAlign = 'left';
      ctx.fillText(pad(day), x + 8, cy + 20);
      ctx.textAlign = 'right';
      ctx.font = '700 20px ' + SANS;
      ctx.fillText('✓', x + cellW - 9, cy + cellH - 10);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = MUTED;
    ctx.font = '500 13px ' + MONO;
    ctx.fillText('FLARE · 21-DAY FIELD CLUB', 94, y + h - 16);
    ctx.textAlign = 'right';
    ctx.fillText('21 / 21', 986, y + h - 16);
    return y + h;
  }

  function drawStats(ctx, y, record) {
    const stats = [
      { value: '21/21', label: 'DAYS MARKED', color: TOMATO },
      { value: String(record.xp || 0), label: 'XP EARNED', color: COBALT },
      { value: String(record.bestStreak || 21), label: 'BEST STREAK', color: MARIGOLD },
      { value: String(record.minutes || 0), label: 'MINUTES GIVEN', color: SAGE },
    ];
    const gap = 12;
    const w = (936 - gap * 3) / 4;
    const h = 108;

    stats.forEach(function (stat, i) {
      const x = 72 + i * (w + gap);
      box(ctx, x, y, w, h, CREAM, INK, 2);
      ctx.fillStyle = INK;
      ctx.fillRect(x, y, w, 8);
      ctx.fillStyle = stat.color;
      ctx.fillRect(x, y, w, 8);
      ctx.fillStyle = INK;
      ctx.font = '800 36px ' + SANS;
      ctx.textAlign = 'left';
      ctx.fillText(stat.value.length > 6 ? stat.value.slice(0, 6) : stat.value, x + 14, y + 56);
      ctx.fillStyle = MUTED;
      ctx.font = '500 11px ' + MONO;
      ctx.fillText(stat.label, x + 14, y + 84);
    });
    return y + h;
  }

  function drawDates(ctx, y, record) {
    ctx.strokeStyle = 'rgba(24,21,16,0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(72, y + 12);
    ctx.lineTo(1008, y + 12);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = MUTED;
    ctx.font = '500 13px ' + MONO;
    ctx.textAlign = 'left';
    ctx.fillText('STARTED', 72, y + 40);
    ctx.fillText('FINISHED', 548, y + 40);

    ctx.fillStyle = INK;
    ctx.font = '600 17px ' + MONO;
    ctx.fillText(shortDate(record.startDate), 72, y + 62);
    ctx.fillText(shortDate(record.completedAt), 548, y + 62);
    return y + 76;
  }

  function drawQuote(ctx, y) {
    box(ctx, 72, y, 936, 104, MARIGOLD, INK, 3);
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.font = '800 30px ' + SANS;
    ctx.fillText('“Small actions. Real progress.”', 98, y + 44);
    ctx.font = '500 14px ' + MONO;
    ctx.fillText('FLARE · 21-DAY FIELD CLUB', 98, y + 74);
    ctx.textAlign = 'right';
    ctx.font = '700 13px ' + MONO;
    ctx.fillText('MEMBER 0021', 982, y + 74);
    return y + 104;
  }

  function drawFooter(ctx) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(72, 1258);
    ctx.lineTo(1008, 1258);
    ctx.stroke();

    ctx.fillStyle = MUTED;
    ctx.textAlign = 'left';
    ctx.font = '500 13px ' + MONO;
    ctx.fillText('SHOW UP. 21 TIMES.', 72, 1284);
    ctx.textAlign = 'right';
    ctx.fillText('A PRINTED 21-DAY FIELD GUIDE', 1008, 1284);
  }

  function draw(record) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'alphabetic';
    drawBackground(ctx);
    drawHeader(ctx);
    const afterTitle = drawTitle(ctx, record);
    const y = Math.max(540, afterTitle + 24);
    drawGrid(ctx, y);
    let statsY = y + 292 + 24;
    let bottom = drawStats(ctx, statsY, record);
    bottom = drawDates(ctx, bottom + 18, record);
    drawQuote(ctx, Math.min(bottom + 20, 1096));
    drawFooter(ctx);
    return canvas;
  }

  function toBlob(canvas) {
    return new Promise(function (resolve) {
      if (canvas.toBlob) canvas.toBlob(resolve, 'image/png');
      else resolve(null);
    });
  }

  function download(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1200);
  }

  function shareText(record) {
    return 'I finished 21 days of ' + (record.name || 'my challenge') + ' with FLARE. Small actions. Real progress.';
  }

  async function nativeShare(canvas, fileName, record) {
    const c = cap();
    const fs = c.Plugins.Filesystem;
    const share = c.Plugins.Share;
    if (!fs || !share) return null;

    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    await fs.writeFile({ path: fileName, data: base64, directory: 'CACHE', recursive: true });
    const uriResult = await fs.getUri({ path: fileName, directory: 'CACHE' });

    try {
      await share.share({
        title: 'My FLARE achievement',
        text: shareText(record),
        files: [uriResult.uri],
        dialogTitle: 'Share your achievement',
      });
      return { ok: true, native: true };
    } catch (err) {
      const message = String(err && err.message ? err.message : err);
      if (/cancel/i.test(message)) return { ok: true, native: true, cancelled: true };
      return { ok: false, native: true, error: message };
    }
  }

  async function shareCompletion(record) {
    if (!record) return { ok: false };
    let canvas;
    try {
      await fontsReady();
      canvas = draw(record);
    } catch (err) {
      return { ok: false, error: 'render' };
    }

    const fileName = 'flare-21-' + sanitize(record.name) + '-' + sanitize(record.completedAt || 'complete') + '.png';
    if (cap()) {
      try {
        const result = await nativeShare(canvas, fileName, record);
        if (result) return result;
      } catch (err) {
        /* Fall through to the browser path if native sharing is unavailable. */
      }
    }

    const blob = await toBlob(canvas);
    if (!blob) return { ok: false, error: 'encode' };
    const file = new File([blob], fileName, { type: 'image/png' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'My FLARE achievement', text: shareText(record) });
        return { ok: true, shared: true };
      } catch (err) {
        if (err && err.name === 'AbortError') return { ok: true, cancelled: true };
      }
    }

    try {
      download(blob, fileName);
      return { ok: true, downloaded: true };
    } catch (err) {
      return { ok: false, error: 'download' };
    }
  }

  return {
    shareCompletion: shareCompletion,
    renderCard: function (record) { return draw(record); },
  };
})();
