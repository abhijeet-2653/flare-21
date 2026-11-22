/* FLARE — JSON backup and restore. Keeps the whole flare21.v1 state portable. */
window.FLARE_BACKUP = (function () {
  function cap() {
    return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
      ? window.Capacitor
      : null;
  }

  function stamp() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function payload(state) {
    return {
      app: 'FLARE',
      schema: 'flare21.v1',
      exportedAt: new Date().toISOString(),
      data: state,
    };
  }

  function download(text, fileName) {
    const blob = new Blob([text], { type: 'application/json' });
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

  async function nativeSave(text, fileName) {
    const c = cap();
    const fs = c.Plugins.Filesystem;
    const share = c.Plugins.Share;
    if (!fs) return null;

    await fs.writeFile({ path: fileName, data: text, directory: 'CACHE', encoding: 'utf8', recursive: true });
    const uriResult = await fs.getUri({ path: fileName, directory: 'CACHE' });

    if (share) {
      try {
        await share.share({
          title: 'FLARE backup',
          text: 'FLARE backup · ' + stamp(),
          files: [uriResult.uri],
          dialogTitle: 'Save your FLARE backup',
        });
        return { ok: true, native: true };
      } catch (err) {
        const message = String(err && err.message ? err.message : err);
        if (/cancel/i.test(message)) return { ok: true, native: true, cancelled: true };
        return { ok: false, native: true, error: message };
      }
    }

    return { ok: true, native: true, path: uriResult.uri };
  }

  async function exportBackup(state) {
    const text = JSON.stringify(payload(state), null, 2);
    const fileName = 'flare-backup-' + stamp() + '.json';

    if (cap()) {
      try {
        const result = await nativeSave(text, fileName);
        if (result) return result;
      } catch (err) {
        /* Fall through to a browser download if native storage fails. */
      }
    }

    download(text, fileName);
    return { ok: true, downloaded: true };
  }

  function parse(text) {
    let raw;
    try {
      raw = JSON.parse(text);
    } catch (err) {
      throw new Error('not-json');
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('not-object');

    const state = raw.app === 'FLARE' && raw.data && typeof raw.data === 'object' ? raw.data : raw;
    if (!state || typeof state !== 'object' || Array.isArray(state)) throw new Error('not-state');
    if (!Array.isArray(state.completed) && !Array.isArray(state.history)) throw new Error('not-flare');

    const copy = JSON.parse(JSON.stringify(state));
    delete copy.app;
    delete copy.schema;
    delete copy.exportedAt;
    return copy;
  }

  return {
    exportBackup: exportBackup,
    parse: parse,
    payload: payload,
  };
})();
