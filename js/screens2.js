/* FLARE — screen markup: journey, stats, you, quest, finale, celebrate */
(function () {
  const A = window.App;
  const I = window.ILLUS;
  const esc = A.esc;
  const icon = A.icon;

  /* -------------------------------- journey ----------------------------- */

  function dayRow(n) {
    const s = A.statusOf(n);
    const t = A.taskFor(n);
    const label = s === 'done' ? 'Done' : s === 'today' ? 'Today' : s === 'missed' ? 'Missed' : 'Locked';
    let right = icon('lock', 14);
    if (s === 'done') right = icon('check', 16);
    else if (s === 'today') right = icon('chev', 15);
    else if (s === 'missed') right = icon('plus', 15);

    return '<div class="day-row ' + s + '" data-open-day="' + n + '" role="button" tabindex="0" aria-label="Day ' + n + ': ' + esc(t.title) + '">' +
      '<span class="day-node">' + (s === 'done' ? icon('check', 14) : n) + '</span>' +
      '<div class="day-card">' +
        '<div class="day-info">' +
          '<p class="day-title">' + esc(t.title) + '</p>' +
          '<div class="day-meta"><span>' + A.weekdayShort(n) + '</span><span>·</span><span>' + A.state.minutes + ' min</span><span class="st ' + s + '">' + label + '</span></div>' +
        '</div>' +
        '<span class="day-right">' + right + '</span>' +
      '</div>' +
      '</div>';
  }

  function milestone(w) {
    const day = w * 7;
    const done = A.isDone(day);
    const bonus = w === 1 ? 50 : w === 2 ? 100 : 200;
    const title = w === 1 ? 'Week one, done' : w === 2 ? 'Two weeks of showing up' : 'The full 21';
    const sub = w === 3 ? 'The finish line is a feeling' : 'Finish day ' + day + ' for bonus XP';
    return '<div class="milestone-card ' + (done ? '' : 'locked') + '">' +
      '<span class="medal">' + icon(w === 3 ? 'trophy' : 'star', 18) + '</span>' +
      '<div><b>' + title + '</b><small>' + sub + '</small></div>' +
      '<span class="xp-bonus">+' + bonus + ' XP</span>' +
      '</div>';
  }

  function journey() {
    const m = A.metrics();
    const titles = ['The start', 'The middle', 'The finish'];
    let blocks = '';

    [1, 2, 3].forEach(function (w) {
      const start = (w - 1) * 7 + 1;
      const end = start + 6;
      let count = 0;
      let rows = '';
      for (let n = start; n <= end; n++) {
        if (A.isDone(n)) count++;
        rows += dayRow(n);
      }
      blocks += '<div class="week-block">' +
        '<div class="week-block-head">' +
          '<span class="week-badge" style="color:' + (w === 1 ? 'var(--lime)' : w === 2 ? 'var(--violet)' : 'var(--butter)') + '">' + icon(w === 1 ? 'bolt' : w === 2 ? 'wave' : 'trophy', 15) + '</span>' +
          '<div class="wbh-text"><b>Week ' + w + '</b><small>' + titles[w - 1] + ' · days ' + start + '–' + end + '</small></div>' +
          '<span class="week-progress">' + count + '/7</span>' +
        '</div>' +
        '<div class="day-list">' + rows + '</div>' +
        milestone(w) +
        '</div>';
    });

    return '<section class="screen journey">' +
      '<div class="topbar">' +
        '<div class="brand"><span class="brand-mark">✦</span><span>FLARE</span></div>' +
        '<span class="pill">' + m.done + ' / 21 marked</span>' +
      '</div>' +

      '<div class="journey-head">' +
        '<p class="kicker"><span class="dot"></span> The whole journey</p>' +
        '<h1 class="title">The whole<br><em>twenty-one.</em></h1>' +
        '<p class="lede">Every tiny receipt. Tap a day to open the quest, make up a missed one, or peek ahead.</p>' +
      '</div>' +

      '<div class="progress-card">' +
        '<div class="progress-top"><b>' + m.done + '<small> / 21 days</small></b><span>' + m.pct + '% in</span></div>' +
        '<div class="progress-track"><div class="progress-fill" style="--w:' + m.pct + '%"></div></div>' +
      '</div>' +

      '<div class="journey-actions">' +
        '<div class="legend-inline"><span><i style="background:var(--tomato)"></i>Done</span><span><i style="background:var(--ink)"></i>Today</span><span><i style="background:var(--tomato)"></i>Missed</span></div>' +
        '<button class="link-btn" data-act="jump-today">Jump to today ' + icon('arrow', 12) + '</button>' +
      '</div>' +

      blocks +

      '<p class="journey-note">“Rest is part of the streak. Missing a day isn’t a failure — it’s a plot twist.”</p>' +
      '</section>';
  }

  /* --------------------------------- stats ------------------------------ */

  function stats() {
    const m = A.metrics();
    const day = m.day;
    const week = Math.ceil(day / 7);
    const first = (week - 1) * 7 + 1;
    const heights = [];
    const letters = [];

    for (let i = 0; i < 7; i++) {
      const n = first + i;
      const done = A.isDone(n);
      let h = 4;
      if (done) h = 52 + (A.isDone(n - 1) ? 12 : 0);
      if (n === day && !done) h = 10;
      heights.push({ n: n, h: h, done: done, today: n === day });
    }
    const max = 72;

    const bars = heights.map(function (b, i) {
      const cls = b.done ? 'on' : b.today ? 'today' : '';
      return '<div class="bar-col"><div class="bar ' + cls + '" style="--h:' + ((b.h / max) * 100) + ';--i:' + i + '"></div><span class="' + (b.today ? 'now' : '') + '">' + A.weekdayLetter(b.n) + '</span></div>';
    }).join('');

    const heat = [];
    for (let n = 1; n <= 21; n++) {
      const s = A.statusOf(n);
      heat.push('<span class="heat-cell ' + s + '" title="Day ' + n + ' · ' + s + '">' + n + '</span>');
    }

    const badges = A.badgeList().map(function (b) {
      return '<div class="badge ' + (b.unlocked ? '' : 'locked') + '" style="--c:' + b.color + '">' +
        (b.unlocked ? '' : '<span class="lock">' + icon('lock', 12) + '</span>') +
        '<span class="badge-ico">' + icon(b.icon, 18) + '</span>' +
        '<b>' + b.name + '</b>' +
        '<small>' + b.desc + '</small>' +
        '</div>';
    }).join('');

    const unlocked = A.badgeList().filter(function (b) { return b.unlocked; }).length;

    return '<section class="screen stats">' +
      '<div class="topbar">' +
        '<div class="brand"><span class="brand-mark">✦</span><span>FLARE</span></div>' +
        '<span class="pill lime">' + m.pct + '% marked</span>' +
      '</div>' +

      '<div class="stats-head">' +
        '<p class="kicker violet"><span class="dot"></span> The receipts</p>' +
        '<h1 class="title">Your receipts,<br><em>in numbers.</em></h1>' +
        '<p class="lede">Consistency beats intensity. Every bar here is a day you chose yourself.</p>' +
      '</div>' +

      '<div class="stat-hero">' +
        S.ring(m.pct, { big: true, cap: 'of 21 days' }) +
        '<div class="stat-hero-text"><h2>' + m.done + ' of 21 days <em>marked.</em></h2><p>You’re ' + (100 - m.pct) + '% away from a brand-new default. Keep showing up ugly.</p></div>' +
      '</div>' +

      '<div class="stat-tiles">' +
        '<div class="stat-tile"><b>' + m.xp + '</b><span>Total XP</span></div>' +
        '<div class="stat-tile"><b>' + m.minutes + '</b><span>Minutes</span></div>' +
        '<div class="stat-tile"><b>' + m.streak + '</b><span>Day streak</span></div>' +
      '</div>' +

      '<div class="chart-card">' +
        '<div class="card-head"><b>This week’s energy</b><small>XP earned</small></div>' +
        '<div class="bars">' + bars + '</div>' +
      '</div>' +

      '<div class="chart-card">' +
        '<div class="card-head"><b>21-day map</b><small>Week ' + week + ' of 3</small></div>' +
        '<div class="heat-grid">' + heat.join('') + '</div>' +
        '<div class="heat-legend">' +
          '<span><i style="background:var(--tomato)"></i>Done</span>' +
          '<span><i style="background:rgba(232,69,31,.45)"></i>Missed</span>' +
          '<span><i style="border:1.5px solid var(--ink);background:var(--cream)"></i>Today</span>' +
          '<span><i style="background:var(--paper-3)"></i>Ahead</span>' +
        '</div>' +
      '</div>' +

      '<div class="chart-card">' +
        '<div class="card-head"><b>Stamps earned</b><small>' + unlocked + ' / ' + A.badgeList().length + '</small></div>' +
        '<div class="badge-grid">' + badges + '</div>' +
      '</div>' +

      '<button class="share-cta" data-act="share">' +
        '<span><b>Share your receipts</b><small>Story card · 9:16 · made for the group chat</small></span>' +
        '<span class="share-ico">' + icon('share', 18) + '</span>' +
      '</button>' +
      '</section>';
  }

  /* --------------------------------- you -------------------------------- */

  function you() {
    const m = A.metrics();
    const c = A.challenge();
    const lvl = m.level;
    const name = A.state.name || 'Anonymous member';
    const armed = A.resetArmed;

    return '<section class="screen you">' +
      '<div class="topbar">' +
        '<div class="brand"><span class="brand-mark">✦</span><span>FLARE</span></div>' +
        '<span class="pill">Member 0021</span>' +
      '</div>' +

      '<div class="you-head">' +
        '<p class="kicker"><span class="dot"></span> The human behind the streak</p>' +
        '<h1 class="title">This is<br><em>you.</em></h1>' +
      '</div>' +

      '<div class="profile-card">' +
        '<div class="avatar big"><span>' + esc((A.state.name || 'F').charAt(0).toUpperCase()) + '</span></div>' +
        '<div class="profile-info">' +
          '<div class="profile-name">' + esc(name) + '<span class="level-chip">Lv. ' + lvl.current.n + '</span></div>' +
          '<div class="profile-level">' + lvl.label + ' · ' + m.done + ' days in</div>' +
          '<div class="xp-line">' +
            '<div class="xp-meta"><span>' + m.xp + ' XP</span><span>' + (lvl.next ? lvl.next.at + ' to ' + lvl.next.name : 'Max count') + '</span></div>' +
            '<div class="xp-track"><div class="xp-fill" style="width:' + lvl.pct + '%"></div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="challenge-mini" style="--c:' + c.color + ';--c-soft:' + c.colorSoft + '">' +
        '<span class="cm-ico">' + icon(c.icon, 19) + '</span>' +
        '<div><b>' + esc(c.name === 'My thing' ? (A.state.customGoal || 'My thing') : c.name) + '</b><small>' + esc(c.tagline) + '</small></div>' +
        '<span class="pill">Day ' + m.day + '</span>' +
      '</div>' +

      '<span class="section-label">Settings</span>' +
      '<div class="list-card" style="margin-top:9px">' +
        '<div class="list-row"><span class="list-ico">' + icon('sound', 16) + '</span><div class="list-txt"><b>Sound effects</b><small>Little chimes for little wins</small></div><button class="switch" data-toggle="sound" aria-pressed="' + (A.state.sound ? 'true' : 'false') + '" aria-label="Sound effects"></button></div>' +
        '<div class="list-row"><span class="list-ico">' + icon('wave', 16) + '</span><div class="list-txt"><b>Reduce motion</b><small>Calm it all the way down</small></div><button class="switch" data-toggle="motion" aria-pressed="' + (A.state.motion ? 'true' : 'false') + '" aria-label="Reduce motion"></button></div>' +
        '<div class="list-row"><span class="list-ico">' + icon('bell', 16) + '</span><div class="list-txt"><b>Daily nudge</b><small>' + A.timeLabel().label + ' · ' + A.timeLabel().window + '</small></div><button class="switch" data-toggle="reminder" aria-pressed="' + (A.state.reminder ? 'true' : 'false') + '" aria-label="Daily reminder"></button></div>' +
      '</div>' +

      '<span class="section-label">The controls</span>' +
      '<div class="list-card" style="margin-top:9px">' +
        '<button class="list-row" data-act="change-goal"><span class="list-ico">' + icon('reset', 16) + '</span><div class="list-txt"><b>Change my goal</b><small>Start a fresh 21 with a new thing</small></div><span class="chev">' + icon('chev', 15) + '</span></button>' +
        '<button class="list-row" data-act="preview-finale"><span class="list-ico">' + icon('trophy', 16) + '</span><div class="list-txt"><b>Peek the finale</b><small>See the view from day 21</small></div><span class="chev">' + icon('chev', 15) + '</span></button>' +
        '<button class="list-row" data-act="next-day"><span class="list-ico">' + icon('clock', 16) + '</span><div class="list-txt"><b>Skip to next day</b><small>Demo control · fast-forward the calendar</small></div><span class="chev">' + icon('chev', 15) + '</span></button>' +
        '<button class="list-row danger ' + (armed ? 'armed' : '') + '" data-act="reset"><span class="list-ico">' + icon('close', 16) + '</span><div class="list-txt"><b>' + (armed ? 'Tap again to erase' : 'Reset everything') + '</b><small>' + (armed ? 'This clears your goal, streak and notes.' : 'Wipe the demo and start over') + '</small></div><span class="chev">' + icon('chev', 15) + '</span></button>' +
      '</div>' +

      '<p class="you-foot">FLARE · a 21-day field club · riso print study<br>For the ones who keep count.</p>' +
      '</section>';
  }

  /* --------------------------------- quest ------------------------------ */

  function quest(day) {
    const st = A.state;
    const s = A.statusOf(day);
    const c = A.challenge();
    const t = A.taskFor(day);
    const steps = A.stepsFor(day);
    const done = s === 'done';
    const locked = day > A.currentDay();

    const chips = '<div class="meta-chips">' +
      '<span class="chip">' + icon('clock', 12) + ' ' + st.minutes + ' min</span>' +
      '<span class="chip lime">' + icon('bolt', 12) + ' +60 XP</span>' +
      '<span class="chip">' + icon(A.timeLabel().icon, 12) + ' ' + A.timeLabel().label + '</span>' +
      '<span class="chip">' + icon('star', 12) + ' Day ' + day + ' of 21</span>' +
      '</div>';

    const hero = '<div class="quest-hero" style="--c:' + c.color + ';--c-soft:' + c.colorSoft + '">' +
      '<span class="quest-daymark">' + String(day).padStart(2, '0') + '</span>' +
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
        '<p>Day ' + day + ' opens when you get there. Today is day ' + A.currentDay() + '. Tally believes in anticipation.</p>' +
        '</div>' +
        '<button class="btn btn-cream btn-block" data-go="home">Back to today</button>';
    } else if (done) {
      const note = st.notes[day];
      body = '<div class="quest-complete-card">' +
        '<span class="big-check">' + icon('check', 24) + '</span>' +
        '<b>Day ' + day + ' complete</b>' +
        '<p>+60 XP · ' + A.metrics().streak + '-day streak · logged and dated</p>' +
        (note ? '<div class="quest-note-show">“' + esc(note) + '”</div>' : '') +
        '</div>' +
        '<button class="btn btn-cream btn-block" data-go="home">Back to today</button>' +
        '<button class="btn btn-ghost btn-block" style="margin-top:8px" data-go="journey">See the journey</button>';
    } else {
      const checks = steps.map(function (step, i) {
        return '<button class="check-row" data-check="' + i + '" aria-pressed="false">' +
          '<span class="checkbox">' + icon('check', 13) + '</span>' +
          '<span class="check-txt"><b>' + esc(step.title) + '</b><small>' + esc(step.sub) + '</small></span>' +
          '<span class="section-label" style="color:var(--muted-2)">' + step.time + 'm</span>' +
          '</button>';
      }).join('');

      body = '<div class="checklist-wrap">' +
          '<div class="checklist-head"><span class="section-label">The plan</span><span class="check-progress" id="checkProgress">0 / 3</span></div>' +
          '<div class="checklist">' + checks + '</div>' +
        '</div>' +

        '<div class="timer-card">' +
          '<span class="timer-ico">' + icon('clock', 17) + '</span>' +
          '<div><div class="timer-time" id="timerTime">' + String(st.minutes).padStart(2, '0') + ':00</div><div class="timer-label">Focus timer</div></div>' +
          '<div class="timer-btns">' +
            '<button class="mini-btn primary" data-act="timer-toggle" id="timerToggle" aria-label="Start timer">' + icon('play', 15) + '</button>' +
            '<button class="mini-btn" data-act="timer-reset" aria-label="Reset timer">' + icon('reset', 14) + '</button>' +
          '</div>' +
        '</div>' +

        '<div class="note-wrap"><label class="section-label" for="questNote" style="display:block;margin-bottom:7px">One line about today</label>' +
          '<textarea class="note" id="questNote" maxlength="160" placeholder="Felt lighter after…">' + esc(st.notes[day] || '') + '</textarea>' +
        '</div>' +

        '<button class="hold" id="holdBtn" style="--p:0">' +
          '<span class="hold-fill"></span>' +
          '<span class="hold-label">' + icon('check', 17) + ' Hold to complete</span>' +
        '</button>' +
        '<p class="hold-hint" id="holdHint">Check all 3 steps, then hold for 1 second</p>';
    }

    return '<section class="screen quest">' +
      '<div class="topbar">' +
        '<button class="icon-btn" data-go="home" aria-label="Back">' + icon('back', 18) + '</button>' +
        '<span class="topbar-center">Day ' + String(day).padStart(2, '0') + ' / 21</span>' +
        '<button class="icon-btn" data-act="share" aria-label="Share quest">' + icon('share', 16) + '</button>' +
      '</div>' +

      '<div class="stagger">' +
        hero +
        '<span class="kicker ' + (c.id === 'mind' ? 'violet' : c.id === 'make' ? 'coral' : '') + '" style="margin-bottom:8px"><span class="dot"></span>' + esc(c.kicker) + ' · ' + (done ? 'complete' : 'today’s quest') + '</span>' +
        '<h1 class="quest-title">' + esc(t.title) + '</h1>' +
        '<p class="quest-desc">' + esc(t.blurb) + '</p>' +
        chips +
        body +
      '</div>' +
      '</section>';
  }

  /* -------------------------------- finale ------------------------------ */

  function finale(preview) {
    const m = A.metrics();
    const complete = m.done >= 21;
    const days = preview ? 21 : m.done;
    const xp = preview ? 1680 : m.xp;
    const mins = preview ? 420 : m.minutes;
    const best = preview ? 21 : m.bestStreak;
    const show = preview || complete;

    const grid = [];
    for (let i = 1; i <= 21; i++) {
      const on = preview || A.isDone(i);
      grid.push('<i class="' + (on ? 'on' : '') + '"></i>');
    }

    return '<section class="screen finale">' +
      '<div class="starry" aria-hidden="true"></div>' +
      '<div class="topbar">' +
        '<button class="icon-btn" data-act="close-finale" aria-label="Close">' + icon(preview ? 'back' : 'close', 18) + '</button>' +
        '<span class="topbar-center">' + (preview ? 'The view from day 21' : 'The finish line') + '</span>' +
        '<span style="width:39px"></span>' +
      '</div>' +

      '<div class="finale-orb">' +
        '<span class="glow"></span>' +
        '<div class="orb21">' + I.orb21(176, '21') + '</div>' +
        '<div class="trophy">' + I.trophy(92) + '</div>' +
        '<div class="mini-mascot">' + I.mascot(66) + '</div>' +
      '</div>' +

      '<div class="finale-copy">' +
        '<p class="kicker"><span class="dot"></span> ' + (show ? '21 of 21 days' : 'Not there yet') + '</p>' +
        '<h1 class="finale-title">You showed up.<em>' + Math.max(days, 1) + ' times.</em></h1>' +
        '<p>' + (show ? 'Twenty-one days ago this was just a wish. Now it’s a receipt. Tally is quietly losing it.' : 'You’re ' + (21 - m.done) + ' days from this view. One tiny quest at a time.') + '</p>' +
      '</div>' +

      '<div class="finale-stats">' +
        '<div class="finale-stat"><b>' + days + '/21</b><span>Days shown up</span></div>' +
        '<div class="finale-stat"><b>' + xp + '</b><span>XP earned</span></div>' +
        '<div class="finale-stat"><b>' + mins + '</b><span>Minutes moved</span></div>' +
        '<div class="finale-stat"><b>' + best + '</b><span>Best streak</span></div>' +
      '</div>' +

      '<div class="story-card">' +
        '<div class="story-top"><span class="story-brand"><i>✦</i> FLARE · 21</span><span>' + (preview ? 'Premonition' : 'Receipt') + '</span></div>' +
        '<div class="story-title">21 days.<br><em>One receipt.</em></div>' +
        '<div class="story-grid">' + grid.join('') + '</div>' +
        '<div class="story-foot"><span>Started ' + A.formatDate(A.startDate(), { month: 'short', day: 'numeric' }) + '</span><b>“Small streaks. Dated receipts.”</b></div>' +
      '</div>' +

      '<div class="finale-actions">' +
        '<button class="btn btn-primary btn-block" data-act="share">' + icon('share', 16) + ' Share my receipts</button>' +
        '<button class="btn btn-ghost btn-block" data-act="new-challenge">Start another 21 ' + icon('arrow', 15) + '</button>' +
        (preview ? '<button class="btn btn-ghost btn-block" data-act="close-finale">Back to today</button>' : '') +
      '</div>' +
      '<p class="finale-small">' + (preview ? 'Day 21 looks good on you.' : 'We’re proud of you. Obviously.') + '</p>' +
      '</section>';
  }

  /* ------------------------------- celebrate ---------------------------- */

  function celebrate(day, gain) {
    const m = A.metrics();
    const next = 21 - m.done;
    return '<div class="celebrate">' +
      '<div class="celebrate-card">' +
        '<div class="celebrate-mascot">' + I.mascot(96) + '</div>' +
        '<p class="kicker"><span class="dot"></span> Day ' + String(day).padStart(2, '0') + ' complete</p>' +
        '<h2>That’s the <em>receipt.</em></h2>' +
        '<div class="xp-float">' + icon('bolt', 15) + ' +' + (gain || 60) + ' XP</div>' +
        '<p class="celebrate-sub">' + m.streak + '-day streak · ' + next + ' ritual' + (next === 1 ? '' : 's') + ' to go.<br>Tally will be right here tomorrow.</p>' +
        '<button class="btn btn-primary" data-act="celebrate-close">Keep the streak ' + icon('arrow', 15) + '</button>' +
        '<button class="btn btn-ghost" data-act="celebrate-journey">See the journey</button>' +
      '</div>' +
      '</div>';
  }

  Object.assign(window.S, {
    journey: journey,
    stats: stats,
    you: you,
    quest: quest,
    finale: finale,
    celebrate: celebrate,
    dayRow: dayRow,
  });
})();
