/* FLARE — screen markup: journey, achievements, profile, quest, completion */
(function () {
  const A = window.App;
  const I = window.ILLUS;
  const esc = A.esc;
  const icon = A.icon;

  function pad(n) { return String(n).padStart(2, '0'); }

  function progress(pct) {
    return '<div class="progress-track"><div class="progress-fill" style="--w:' + Math.max(0, Math.min(100, pct)) + '%"></div></div>';
  }

  function milestoneCard(day, opts) {
    opts = opts || {};
    const reward = day === 7 ? 50 : day === 14 ? 100 : 200;
    const title = day === 7 ? 'Week one' : day === 14 ? 'Two weeks in' : 'The full 21';
    const unlocked = !!opts.unlocked;
    const count = opts.count || 0;
    const sub = opts.active
      ? (unlocked ? 'Unlocked · ' + reward + ' XP banked' : 'Reach day ' + day + ' for +' + reward + ' XP')
      : (count ? 'Earned in ' + count + ' challenge' + (count === 1 ? '' : 's') : 'Finish day ' + day + ' to unlock');
    return '<div class="milestone-card ' + (unlocked ? '' : 'locked') + '">' +
      '<span class="medal">' + icon(day === 21 ? 'trophy' : 'star', 18) + '</span>' +
      '<div><b>Day ' + day + ' · ' + title + '</b><small>' + sub + '</small></div>' +
      '<span class="xp-bonus">+' + reward + ' XP</span>' +
      '</div>';
  }

  /* -------------------------------- journey ----------------------------- */

  function journey() {
    if (!A.hasActive()) {
      return '<section class="screen journey">' +
        '<div class="topbar">' +
          '<button type="button" class="icon-btn" data-act="go-back" aria-label="Back">' + icon('back', 18) + '</button>' +
          '<span class="topbar-center">Your journey</span>' +
          '<span class="topbar-spacer"></span>' +
        '</div>' +
        '<div class="empty-state tall">' +
          '<span class="empty-ico">' + icon('route', 26) + '</span>' +
          '<h2>No journey running.</h2>' +
          '<p>Start a 21-day challenge and every completed day will land here.</p>' +
          '<button type="button" class="btn btn-primary" data-act="go-home">Choose a challenge</button>' +
        '</div>' +
        '</section>';
    }

    const c = A.challenge();
    const m = A.metrics();
    const day = m.day;

    function dayCell(n) {
      const s = A.statusOf(n);
      const t = A.taskFor(n);
      return '<button type="button" class="cal-day ' + s + (n === day ? ' is-today' : '') + '" data-open-day="' + n + '" aria-label="Day ' + n + ': ' + esc(t.title) + '">' +
        '<span class="cal-wd">' + A.weekdayLetter(n) + '</span>' +
        '<b>' + n + '</b>' +
        '<span class="cal-date">' + A.dayDate(n).getDate() + '</span>' +
        '</button>';
    }

    let weeks = '';
    [1, 2, 3].forEach(function (w) {
      const start = (w - 1) * 7 + 1;
      const end = start + 6;
      let cells = '';
      for (let n = start; n <= end; n++) cells += dayCell(n);
      weeks += '<div class="cal-week">' +
        '<div class="cal-week-head"><b>Week ' + w + '</b><span>Days ' + start + '–' + end + '</span></div>' +
        '<div class="cal-grid">' + cells + '</div>' +
        '</div>';
    });

    return '<section class="screen journey">' +
      '<div class="topbar">' +
        '<button type="button" class="icon-btn" data-act="go-back" aria-label="Back">' + icon('back', 18) + '</button>' +
        '<span class="topbar-center">' + esc(c.name) + '</span>' +
        '<span class="topbar-spacer"></span>' +
      '</div>' +

      '<div class="journey-head">' +
        '<p class="kicker"><span class="dot"></span> The whole journey</p>' +
        '<h1 class="title">The 21-day <em>journey.</em></h1>' +
        '<p class="lede">Tap any day you have reached. Completed days keep your notes. Missed days can still be made up.</p>' +
      '</div>' +

      '<div class="progress-card">' +
        '<div class="progress-top"><b>' + m.done + '<small> / 21 days</small></b><span>Day ' + pad(day) + '</span></div>' +
        progress(m.pct) +
        '<div class="progress-foot"><span>' + m.pct + '% complete</span><span>' + (21 - m.done) + ' days to go</span></div>' +
      '</div>' +

      '<div class="calendar-card">' +
        '<div class="calendar-head"><span class="section-label">Your 21 days</span><button type="button" class="link-btn" data-act="jump-today">Jump to today ' + icon('arrow', 12) + '</button></div>' +
        '<div class="legend-inline"><span><i class="done"></i>Done</span><span><i class="today"></i>Today</span><span><i class="missed"></i>Missed</span><span><i class="locked"></i>Upcoming</span></div>' +
        weeks +
      '</div>' +

      '<div class="section-head"><span class="section-label">Milestones</span><span class="section-note">Bonus rewards</span></div>' +
      '<div class="milestone-list">' +
        milestoneCard(7, { unlocked: A.isDone(7), active: true }) +
        milestoneCard(14, { unlocked: A.isDone(14), active: true }) +
        milestoneCard(21, { unlocked: A.isDone(21), active: true }) +
      '</div>' +

      (m.missed > 0
        ? '<div class="recovery-panel">' + icon('reset', 18) + '<div><b>' + m.missed + ' missed day' + (m.missed === 1 ? '' : 's') + '.</b><p>Nothing is lost. Open a missed day and complete it when you can — the challenge and your notes stay put.</p></div></div>'
        : '') +

      '<p class="journey-note">“Rest is part of the streak. Missing a day isn’t a failure — it’s a plot twist.”</p>' +
      '</section>';
  }

  /* ------------------------------ achievements -------------------------- */

  function achievements() {
    const history = A.state.history || [];
    const active = A.hasActive();
    const m = A.metrics();

    const certs = history.map(function (r) {
      return '<article class="cert-card" style="--c:' + (r.color || '#E8451F') + '">' +
        '<button type="button" class="cert-main" data-history="' + esc(r.id) + '">' +
          '<span class="cert-stripe"></span>' +
          '<span class="cert-body">' +
            '<span class="cert-top"><span class="cert-badge">' + icon('check', 12) + ' COMPLETE</span><span class="cert-days">21 / 21</span></span>' +
            '<b class="cert-name">' + esc(r.name) + '</b>' +
            '<span class="cert-meta">' + A.formatShortDate(A.parseISO(r.startDate)) + ' – ' + A.formatShortDate(A.parseISO(r.completedAt)) + ' · ' + (r.bestStreak || 21) + '-day best streak</span>' +
          '</span>' +
          '<span class="cert-chev">' + icon('chev', 14) + '</span>' +
        '</button>' +
        '<button type="button" class="cert-share" data-act="share-achievement" data-record="' + esc(r.id) + '" aria-label="Share ' + esc(r.name) + ' achievement">' + icon('share', 16) + '</button>' +
        '</article>';
    }).join('');

    const counts = { 7: 0, 14: 0, 21: 0 };
    history.forEach(function (r) {
      [7, 14, 21].forEach(function (n) {
        if ((r.completed || []).indexOf(n) > -1) counts[n]++;
      });
    });

    return '<section class="screen achievements">' +
      '<div class="topbar">' +
        '<div class="brand"><span class="brand-mark">✦</span><span>FLARE</span></div>' +
        '<span class="pill">' + history.length + ' finished</span>' +
      '</div>' +

      '<div class="hub-head">' +
        '<p class="kicker"><span class="dot"></span> The trophy shelf</p>' +
        '<h1 class="title">Achievements<em>.</em></h1>' +
        '<p class="hub-lede">Receipts for the days you showed up.</p>' +
      '</div>' +

      '<div class="ach-tiles">' +
        '<div class="stat-tile"><b>' + history.length + '</b><span>Challenges</span></div>' +
        '<div class="stat-tile"><b>' + A.allTimeDays() + '</b><span>Days marked</span></div>' +
        '<div class="stat-tile"><b>' + A.allTimeXp() + '</b><span>Total XP</span></div>' +
      '</div>' +

      '<div class="section-head"><span class="section-label">Milestone rewards</span><span class="section-note">Days 7, 14, 21</span></div>' +
      '<div class="milestone-list">' +
        milestoneCard(7, { unlocked: (active && A.isDone(7)) || counts[7] > 0, count: counts[7] }) +
        milestoneCard(14, { unlocked: (active && A.isDone(14)) || counts[14] > 0, count: counts[14] }) +
        milestoneCard(21, { unlocked: (active && A.isDone(21)) || counts[21] > 0, count: counts[21] }) +
      '</div>' +

      '<div class="section-head"><span class="section-label">Completed challenges</span>' +
        (history.length ? '<span class="section-note">' + history.length + ' certificate' + (history.length === 1 ? '' : 's') + '</span>' : '') +
      '</div>' +
      (history.length
        ? '<div class="cert-list stagger">' + certs + '</div>'
        : '<div class="empty-state">' +
            '<span class="empty-ico">' + icon('trophy', 26) + '</span>' +
            '<h2>No certificates yet.</h2>' +
            '<p>Finish all 21 days of a challenge and it will live here, with a shareable completion card.</p>' +
            '<button type="button" class="btn btn-primary small" data-act="go-home">Start a challenge</button>' +
          '</div>') +
      '</section>';
  }

  /* -------------------------------- profile ----------------------------- */

  function profile() {
    const st = A.state;
    const m = A.metrics();
    const active = A.hasActive();
    const c = active ? A.challenge() : null;
    const armed = A.resetArmed;
    const abandonArmed = !!A.abandonArmed;
    const native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    const name = st.name || 'Anonymous member';

    return '<section class="screen you">' +
      '<div class="topbar">' +
        '<div class="brand"><span class="brand-mark">✦</span><span>FLARE</span></div>' +
        '<span class="pill">Member 0021</span>' +
      '</div>' +

      '<div class="hub-head">' +
        '<p class="kicker"><span class="dot"></span> The field club member</p>' +
        '<h1 class="title">Your <em>profile.</em></h1>' +
      '</div>' +

      '<div class="profile-card">' +
        '<div class="avatar big"><span>' + esc((st.name || 'F').charAt(0).toUpperCase()) + '</span></div>' +
        '<div class="profile-info">' +
          '<div class="profile-name">' + esc(name) + '</div>' +
          '<div class="profile-level">' + (A.state.history.length) + ' challenge' + (A.state.history.length === 1 ? '' : 's') + ' finished · ' + A.allTimeDays() + ' days marked</div>' +
          '<div class="xp-meta"><span>' + A.allTimeXp() + ' XP</span><span>21-day field club</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="setup-card profile-form">' +
        '<label class="field-label" for="profileName">Display name</label>' +
        '<input class="input" id="profileName" maxlength="22" value="' + esc(st.name) + '" placeholder="Your first name" />' +
      '</div>' +

      '<span class="section-label">Reminders</span>' +
      '<div class="list-card" style="margin-top:9px">' +
        '<div class="list-row"><span class="list-ico">' + icon('bell', 16) + '</span><div class="list-txt"><b>Daily reminder</b><small>' + (native ? 'Scheduled on this device' : 'Saved for the Android app') + '</small></div><button type="button" class="switch" data-toggle="reminder" aria-pressed="' + (st.reminder ? 'true' : 'false') + '" aria-label="Daily reminder"></button></div>' +
        '<div class="list-row reminder-time-row"><span class="list-ico">' + icon('clock', 16) + '</span><div class="list-txt"><b>Reminder time</b><small>One gentle notification</small></div><input class="time-input" id="profileReminderTime" type="time" value="' + esc(st.reminderTime || '08:00') + '" aria-label="Reminder time" /></div>' +
        (native ? '' : '<div class="list-note">' + icon('bell', 14) + ' Notifications are delivered by the Android app.</div>') +
      '</div>' +

      '<span class="section-label">Settings</span>' +
      '<div class="list-card" style="margin-top:9px">' +
        '<div class="list-row"><span class="list-ico">' + icon('sound', 16) + '</span><div class="list-txt"><b>Sound effects</b><small>Little chimes for little wins</small></div><button type="button" class="switch" data-toggle="sound" aria-pressed="' + (st.sound ? 'true' : 'false') + '" aria-label="Sound effects"></button></div>' +
        '<div class="list-row"><span class="list-ico">' + icon('wave', 16) + '</span><div class="list-txt"><b>Reduce motion</b><small>Calm it all the way down</small></div><button type="button" class="switch" data-toggle="motion" aria-pressed="' + (st.motion ? 'true' : 'false') + '" aria-label="Reduce motion"></button></div>' +
      '</div>' +

      '<span class="section-label">Your data</span>' +
      '<div class="list-card" style="margin-top:9px">' +
        '<button type="button" class="list-row" data-act="export-backup"><span class="list-ico">' + icon('download', 16) + '</span><div class="list-txt"><b>Back up my data</b><small>Save challenges, notes and settings as a JSON file</small></div><span class="chev">' + icon('chev', 15) + '</span></button>' +
        '<button type="button" class="list-row" data-act="import-backup"><span class="list-ico">' + icon('upload', 16) + '</span><div class="list-txt"><b>Restore a backup</b><small>Import a FLARE backup file</small></div><span class="chev">' + icon('chev', 15) + '</span></button>' +
        '<input type="file" id="importFile" accept="application/json,.json" hidden />' +
      '</div>' +

      '<span class="section-label">Challenge</span>' +
      '<div class="list-card" style="margin-top:9px">' +
        (active
          ? '<div class="list-row challenge-row"><span class="list-ico">' + icon(c.icon, 16) + '</span><div class="list-txt"><b>' + esc(c.name) + '</b><small>Day ' + pad(m.day) + ' of 21 · ' + m.done + ' days done</small></div><button type="button" class="link-btn" data-go="journey">Journey</button></div>' +
            '<button type="button" class="list-row danger ' + (abandonArmed ? 'armed' : '') + '" data-act="abandon-challenge"><span class="list-ico">' + icon('reset', 16) + '</span><div class="list-txt"><b>' + (abandonArmed ? 'Tap again to leave' : 'Leave this challenge') + '</b><small>' + (abandonArmed ? 'Your active progress will be cleared.' : 'Start over or choose something else') + '</small></div><span class="chev">' + icon('chev', 15) + '</span></button>'
          : '<button type="button" class="list-row" data-act="go-home"><span class="list-ico">' + icon('plus', 16) + '</span><div class="list-txt"><b>Start a new challenge</b><small>Pick a category on Home</small></div><span class="chev">' + icon('chev', 15) + '</span></button>') +
        '<button type="button" class="list-row danger ' + (armed ? 'armed' : '') + '" data-act="reset"><span class="list-ico">' + icon('close', 16) + '</span><div class="list-txt"><b>' + (armed ? 'Tap again to erase' : 'Reset everything') + '</b><small>' + (armed ? 'This clears challenges, notes and settings.' : 'Wipe all FLARE data on this device') + '</small></div><span class="chev">' + icon('chev', 15) + '</span></button>' +
      '</div>' +

      '<p class="you-foot">FLARE · a 21-day field club · riso print study<br>For the ones who keep count.</p>' +
      '</section>';
  }

  /* --------------------------------- quest ------------------------------ */

  function quest(day) {
    if (!A.hasActive()) {
      return '<section class="screen quest">' +
        '<div class="topbar">' +
          '<button type="button" class="icon-btn" data-act="go-home" aria-label="Back">' + icon('back', 18) + '</button>' +
          '<span class="topbar-center">Daily challenge</span>' +
          '<span class="topbar-spacer"></span>' +
        '</div>' +
        '<div class="empty-state tall"><span class="empty-ico">' + icon('spark', 26) + '</span><h2>No active challenge.</h2><p>Choose a category on Home to begin.</p><button type="button" class="btn btn-primary" data-act="go-home">Go to Home</button></div>' +
        '</section>';
    }

    const st = A.state;
    const c = A.challenge();
    const m = A.metrics();
    const t = A.taskFor(day);
    const done = A.isDone(day);
    const locked = day > A.currentDay();
    const missed = !done && day < A.currentDay();
    const milestone = day === 7 || day === 14 || day === 21;

    const chips = '<div class="meta-chips">' +
      '<span class="chip">' + icon('clock', 12) + ' ' + st.minutes + ' min</span>' +
      '<span class="chip">' + icon('bolt', 12) + ' +60 XP</span>' +
      (st.dailyTarget ? '<span class="chip">' + icon('star', 12) + ' ' + esc(st.dailyTarget) + '</span>' : '') +
      (milestone ? '<span class="chip lime">' + icon('trophy', 12) + ' Milestone day</span>' : '') +
      '</div>';

    const hero = '<div class="quest-hero" style="--c:' + c.color + ';--c-soft:' + c.colorSoft + '">' +
      '<span class="quest-daymark">' + pad(day) + '</span>' +
      '<span class="q-sticker">' + icon(c.icon, 24) + '</span>' +
      '<span class="q-mascot">' + I.mascot(82) + '</span>' +
      '<span class="q-spark a">' + icon('spark', 18) + '</span>' +
      '<span class="q-spark b">' + icon('star', 14) + '</span>' +
      '<span class="q-caption">' + esc(c.name) + ' · ' + A.weekdayShort(day) + ', ' + A.formatDate(A.dayDate(day), { month: 'short', day: 'numeric' }) + '</span>' +
      '</div>';

    let body = '';

    if (locked) {
      body = '<div class="quest-complete-card">' +
        '<span class="big-check">' + icon('lock', 22) + '</span>' +
        '<b>Patience, spark.</b>' +
        '<p>Day ' + day + ' opens on ' + A.formatDate(A.dayDate(day), { weekday: 'long', month: 'short', day: 'numeric' }) + '. Today is day ' + A.currentDay() + '.</p>' +
        '</div>' +
        '<button type="button" class="btn btn-cream btn-block" data-act="go-home">Back to Home</button>';
    } else if (done) {
      const note = st.notes[day];
      body = '<div class="quest-complete-card">' +
        '<span class="big-check">' + icon('check', 24) + '</span>' +
        '<b>Day ' + day + ' complete</b>' +
        '<p>+60 XP · logged and dated. You cannot mark this day twice.</p>' +
        (note ? '<div class="quest-note-show">“' + esc(note) + '”</div>' : '') +
        '</div>' +
        '<button type="button" class="btn btn-cream btn-block" data-act="go-home">Back to Home</button>' +
        '<button type="button" class="btn btn-ghost btn-block" style="margin-top:8px" data-go="journey">See the journey</button>';
    } else {
      body = '<div class="quest-how">' +
          '<span class="section-label">How to do it</span>' +
          '<p>' + esc(c.instructions) + '</p>' +
        '</div>' +

        '<div class="timer-card">' +
          '<span class="timer-ico">' + icon('clock', 17) + '</span>' +
          '<div><div class="timer-time" id="timerTime">' + String(st.minutes).padStart(2, '0') + ':00</div><div class="timer-label">Optional focus timer</div></div>' +
          '<div class="timer-btns">' +
            '<button type="button" class="mini-btn primary" data-act="timer-toggle" id="timerToggle" aria-label="Start timer">' + icon('play', 15) + '</button>' +
            '<button type="button" class="mini-btn" data-act="timer-reset" aria-label="Reset timer">' + icon('reset', 14) + '</button>' +
          '</div>' +
        '</div>' +

        '<div class="note-wrap"><label class="section-label" for="questNote" style="display:block;margin-bottom:7px">Daily reflection <span class="field-optional">optional</span></label>' +
          '<textarea class="note" id="questNote" maxlength="160" placeholder="One honest line about today…">' + esc(st.notes[day] || '') + '</textarea>' +
        '</div>' +

        (missed ? '<div class="recovery-chip">' + icon('reset', 14) + ' Making up a missed day still counts.</div>' : '') +

        '<button type="button" class="btn btn-primary btn-block complete-task" data-act="complete-day" data-day="' + day + '">' + icon('check', 17) + ' Complete Today’s Task</button>' +
        '<p class="hold-hint">Completing marks day ' + day + ' once. Your progress saves automatically.</p>';
    }

    return '<section class="screen quest">' +
      '<div class="topbar">' +
        '<button type="button" class="icon-btn" data-act="go-back" aria-label="Back">' + icon('back', 18) + '</button>' +
        '<span class="topbar-center">Day ' + pad(day) + ' / 21</span>' +
        '<span class="topbar-spacer"></span>' +
      '</div>' +

      '<div class="quest-progress-wrap">' +
        '<div class="quest-progress-top"><span>Day ' + pad(day) + ' of 21</span><b>' + m.done + ' / 21 complete</b></div>' +
        progress(m.pct) +
      '</div>' +

      '<div class="stagger">' +
        hero +
        '<span class="kicker" style="margin-bottom:8px"><span class="dot"></span>' + (done ? 'Day complete' : missed ? 'Recovery day' : 'Today’s task') + ' · ' + esc(c.name) + '</span>' +
        '<h1 class="quest-title">' + esc(t.title) + '</h1>' +
        '<p class="quest-desc">' + esc(t.blurb) + '</p>' +
        chips +
        body +
      '</div>' +
      '</section>';
  }

  /* ------------------------------- completion --------------------------- */

  function complete(record) {
    if (!record) {
      return '<section class="screen finale complete">' +
        '<div class="topbar"><button type="button" class="icon-btn" data-act="close-complete" aria-label="Close">' + icon('close', 18) + '</button><span class="topbar-center">Completion</span><span class="topbar-spacer"></span></div>' +
        '<div class="empty-state tall"><h2>That receipt is missing.</h2><p>Return home and choose a completed challenge.</p><button type="button" class="btn btn-primary" data-act="go-home">Go to Home</button></div>' +
        '</section>';
    }

    const notes = Object.keys(record.notes || {})
      .map(function (k) { return parseInt(k, 10); })
      .filter(function (n) { return record.notes[n]; })
      .sort(function (a, b) { return a - b; });

    const reflections = notes.length
      ? notes.map(function (n) {
          return '<div class="reflection-item"><span class="reflection-day">DAY ' + pad(n) + '</span><p>' + esc(record.notes[n]) + '</p></div>';
        }).join('')
      : '<div class="reflection-empty">No reflections were saved. The 21 marks are still the receipt.</div>';

    const grid = [];
    for (let i = 1; i <= 21; i++) grid.push('<i class="on"></i>');

    return '<section class="screen finale complete">' +
      '<div class="starry" aria-hidden="true"></div>' +
      '<div class="topbar">' +
        '<button type="button" class="icon-btn" data-act="close-complete" aria-label="Back to achievements">' + icon('close', 18) + '</button>' +
        '<span class="topbar-center">Challenge complete</span>' +
        '<span class="topbar-spacer"></span>' +
      '</div>' +

      '<div class="finale-orb">' +
        '<span class="glow"></span>' +
        '<div class="orb21">' + I.orb21(176, '21') + '</div>' +
        '<div class="trophy">' + I.trophy(92) + '</div>' +
        '<div class="mini-mascot">' + I.mascot(66) + '</div>' +
      '</div>' +

      '<div class="finale-copy">' +
        '<p class="kicker"><span class="dot"></span> 21 of 21 days</p>' +
        '<h1 class="finale-title">You showed up.<em>21 times.</em></h1>' +
        '<p>' + esc(record.name) + ' is finished. Twenty-one days ago it was a wish. Now it is a receipt — and a story you get to keep.</p>' +
      '</div>' +

      '<div class="finale-stats">' +
        '<div class="finale-stat"><b>21/21</b><span>Days completed</span></div>' +
        '<div class="finale-stat"><b>' + (record.xp || 0) + '</b><span>XP earned</span></div>' +
        '<div class="finale-stat"><b>' + (record.minutes || 0) + '</b><span>Minutes given</span></div>' +
        '<div class="finale-stat"><b>' + (record.bestStreak || 21) + '</b><span>Best streak</span></div>' +
      '</div>' +

      '<div class="completion-dates">' +
        '<span><b>Started</b>' + A.formatLongDate(A.parseISO(record.startDate)) + '</span>' +
        '<span><b>Finished</b>' + A.formatLongDate(A.parseISO(record.completedAt)) + '</span>' +
      '</div>' +

      '<div class="story-card">' +
        '<div class="story-top"><span class="story-brand"><i>✦</i> FLARE · 21</span><span>Certificate</span></div>' +
        '<div class="story-title">' + esc(record.name) + ' <em>21 days.</em></div>' +
        '<div class="story-grid">' + grid.join('') + '</div>' +
        '<div class="story-foot"><span>' + A.formatShortDate(A.parseISO(record.startDate)) + ' – ' + A.formatShortDate(A.parseISO(record.completedAt)) + '</span><b>“Small actions. Real progress.”</b></div>' +
      '</div>' +

      '<div class="reflections-card">' +
        '<div class="card-head"><b>Daily reflections</b><small>' + notes.length + ' saved</small></div>' +
        '<div class="reflection-list">' + reflections + '</div>' +
      '</div>' +

      '<div class="finale-actions">' +
        '<button type="button" class="btn btn-primary btn-block" data-act="share-achievement" data-record="' + esc(record.id) + '">' + icon('share', 16) + ' Share Achievement</button>' +
        '<button type="button" class="btn btn-ghost btn-block" data-act="restart-history" data-record="' + esc(record.id) + '">Start Again ' + icon('arrow', 15) + '</button>' +
        '<button type="button" class="btn btn-ghost btn-block" data-act="close-complete">Back to Achievements</button>' +
      '</div>' +
      '<p class="finale-small">Share creates a real image card and opens your Android share sheet.</p>' +
      '</section>';
  }

  /* ------------------------------- celebrate ---------------------------- */

  function celebrate(day, gain, final, recordId) {
    const m = A.metrics();
    const next = 21 - m.done;
    return '<div class="celebrate">' +
      '<div class="celebrate-card">' +
        '<div class="celebrate-mascot">' + I.mascot(96) + '</div>' +
        '<p class="kicker"><span class="dot"></span> ' + (final ? '21 of 21 complete' : 'Day ' + pad(day) + ' complete') + '</p>' +
        '<h2>' + (final ? 'You did the <em>whole thing.</em>' : 'That’s the <em>receipt.</em>') + '</h2>' +
        '<div class="xp-float">' + icon(final ? 'trophy' : 'bolt', 15) + ' +' + (gain || 60) + ' XP</div>' +
        '<p class="celebrate-sub">' + (final
          ? 'Twenty-one days of showing up. Your certificate and reflections are ready.'
          : m.streak + '-day streak · ' + next + ' ritual' + (next === 1 ? '' : 's') + ' to go.<br>Your progress is saved.') + '</p>' +
        '<button type="button" class="btn btn-primary" data-act="' + (final ? 'celebrate-finish' : 'celebrate-close') + '"' + (final && recordId ? ' data-record="' + esc(recordId) + '"' : '') + '>' + (final ? 'See your completion' : 'Keep the streak') + ' ' + icon('arrow', 15) + '</button>' +
        '<button type="button" class="btn btn-ghost" data-act="' + (final ? 'celebrate-close' : 'celebrate-journey') + '">' + (final ? 'Back to Home' : 'See the journey') + '</button>' +
      '</div>' +
      '</div>';
  }

  Object.assign(window.S, {
    journey: journey,
    achievements: achievements,
    profile: profile,
    quest: quest,
    complete: complete,
    celebrate: celebrate,
  });
})();
