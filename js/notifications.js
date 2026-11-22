/* FLARE — real local reminders through the Capacitor LocalNotifications plugin.
   The web build quietly no-ops; on Android this schedules one notification per
   remaining challenge day and keeps them in sync as days are completed. */
window.FLARE_NOTIFY = (function () {
  const ID_BASE = 2100;
  const CHANNEL_ID = 'flare-reminders';
  const DAY = 86400000;

  let channelReady = false;
  let queue = Promise.resolve();

  function cap() {
    return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
      ? window.Capacitor
      : null;
  }

  function plugin() {
    const c = cap();
    return c && c.Plugins ? c.Plugins.LocalNotifications || null : null;
  }

  function parseISO(value) {
    if (!value) return null;
    const p = String(value).split('-').map(Number);
    if (!p[0] || !p[1] || !p[2]) return null;
    return new Date(p[0], p[1] - 1, p[2], 0, 0, 0, 0);
  }

  function atTime(date, time) {
    const parts = String(time || '08:00').split(':');
    const out = new Date(date.getTime());
    out.setHours(parseInt(parts[0], 10) || 8, parseInt(parts[1], 10) || 0, 0, 0);
    return out;
  }

  function ids() {
    const list = [];
    for (let day = 1; day <= 21; day++) list.push({ id: ID_BASE + day });
    return list;
  }

  async function ensureChannel(ln) {
    if (channelReady) return;
    try {
      await ln.createChannel({
        id: CHANNEL_ID,
        name: 'Daily challenge reminders',
        description: 'One gentle nudge for each day of your 21-day challenge.',
        importance: 4,
        visibility: 1,
        lights: true,
        lightColor: '#E8451F',
        vibration: true,
      });
      channelReady = true;
    } catch (err) {
      /* Channels are Android-only; a failure here must not block scheduling. */
    }
  }

  async function cancelAll(ln) {
    try {
      await ln.cancel({ notifications: ids() });
    } catch (err) {
      /* Cancelling an id that is not pending is harmless. */
    }
  }

  async function run(opts) {
    const ln = plugin();
    if (!ln) return { ok: false, native: false, scheduled: 0 };

    await ensureChannel(ln);
    await cancelAll(ln);

    if (!opts || !opts.active || !opts.reminder) {
      return { ok: true, native: true, scheduled: 0 };
    }

    try {
      const permission = await ln.checkPermissions();
      if (permission.display !== 'granted' && opts.requestPermission) {
        await ln.requestPermissions();
      }
    } catch (err) {
      /* Older Android versions report granted without a prompt. */
    }

    const start = parseISO(opts.startDate);
    if (!start) return { ok: true, native: true, scheduled: 0 };

    const done = {};
    (opts.completed || []).forEach(function (n) { done[n] = true; });

    const now = Date.now() + 45000;
    const notifications = [];
    const tasks = opts.tasks || [];
    const challenge = opts.challengeName || 'your challenge';

    for (let day = 1; day <= 21; day++) {
      if (done[day]) continue;
      const when = atTime(new Date(start.getTime() + (day - 1) * DAY), opts.reminderTime);
      if (when.getTime() <= now) continue;
      const task = tasks[day - 1] || 'A small action is enough.';
      notifications.push({
        id: ID_BASE + day,
        title: 'Day ' + day + ' of 21 · ' + challenge,
        body: 'Today: ' + task,
        largeBody: 'Today: ' + task + '\n\nSmall actions. Real progress. Tap to open day ' + day + '.',
        summaryText: 'FLARE · 21-day field club',
        channelId: CHANNEL_ID,
        group: 'flare-daily',
        autoCancel: true,
        schedule: {
          at: when,
          allowWhileIdle: true,
          /* Inexact avoids sending the user to the Android 12+ exact-alarm
             settings screen on every sync. Reminders still arrive. */
          isExactNotification: false,
        },
        extra: { day: day, challenge: challenge },
      });
    }

    if (!notifications.length) return { ok: true, native: true, scheduled: 0 };

    try {
      const result = await ln.schedule({ notifications: notifications });
      if (result && result.warning) {
        return { ok: true, native: true, scheduled: notifications.length, inexact: true };
      }
      return { ok: true, native: true, scheduled: notifications.length };
    } catch (err) {
      return { ok: false, native: true, scheduled: 0, error: String(err && err.message ? err.message : err) };
    }
  }

  /* Serialise syncs so a fast sequence of completions cannot interleave
     cancellation and scheduling. */
  function sync(opts) {
    queue = queue.then(function () {
      return run(opts);
    }).catch(function () {
      return { ok: false, native: false, scheduled: 0 };
    });
    return queue;
  }

  return {
    sync: sync,
    cancel: function () {
      return sync({ active: false });
    },
    isNative: function () { return !!plugin(); },
  };
})();
