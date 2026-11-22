/* FLARE — screen markup: home, explore, detail, custom, setup */
window.S = (function () {
  const A = window.App;
  const I = window.ILLUS;
  const esc = A.esc;
  const icon = A.icon;

  const NAV = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'achievements', label: 'Achievements', icon: 'trophy' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ];

  function nav(active) {
    return NAV.map(function (n) {
      return '<button type="button" class="nav-item ' + (active === n.id ? 'active' : '') + '" data-go="' + n.id + '" aria-label="' + n.label + '">' +
        icon(n.icon, 19) + '<span>' + n.label + '</span></button>';
    }).join('');
  }

  function brandBar(right) {
    return '<div class="topbar">' +
      '<div class="brand"><span class="brand-mark">✦</span><span>FLARE</span></div>' +
      (right || '') + '</div>';
  }

  function ring(pct, opts) {
    opts = opts || {};
    const offset = 100 - Math.max(0, Math.min(100, pct));
    return '<div class="ring ' + (opts.big ? 'big' : '') + '">' +
      '<svg viewBox="0 0 120 120" aria-hidden="true">' +
      '<circle class="ring-bg" cx="60" cy="60" r="52"/>' +
      '<circle class="ring-fg" cx="60" cy="60" r="52" pathLength="100" style="--offset:' + offset + '"/>' +
      '</svg>' +
      '<div class="ring-txt"><b class="ring-pct">' + pct + '%</b><span class="ring-cap">' + (opts.cap || 'marked') + '</span></div>' +
      '</div>';
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function diffClass(d) {
    return String(d || 'Easy').toLowerCase().replace(/[^a-z]/g, '');
  }

  function progress(pct) {
    return '<div class="progress-track"><div class="progress-fill" style="--w:' + Math.max(0, Math.min(100, pct)) + '%"></div></div>';
  }

  function categoryOf(id) {
    return A.DATA.getCategory(id) || A.DATA.categories[0];
  }

  function programName(p, draft) {
    if (p && p.id === 'custom') return (draft && draft.customGoal) || p.name || 'My challenge';
    return p ? p.name : '';
  }

  function programTagline(p, draft) {
    if (p && p.id === 'custom') return (draft && draft.customTask) || p.tagline || 'Your own 21 days';
    return p ? p.tagline : '';
  }

  /* --------------------------------- home ------------------------------- */

  function home() {
    const st = A.state;
    const m = A.metrics();
    const c = A.challenge();
    const active = A.hasActive();
    const day = m.day;
    const doneToday = active && A.isDone(day);
    const task = active ? A.taskFor(day) : null;
    const name = st.name ? esc(st.name) : 'friend';
    const history = st.history || [];

    let activeCard = '';
    if (active) {
      activeCard = '<button type="button" class="active-card" data-act="continue" style="--c:' + c.color + ';--c-soft:' + c.colorSoft + '">' +
        '<span class="active-top">' +
          '<span class="pill ' + (doneToday ? 'lime' : '') + '">' + (doneToday ? 'TODAY DONE' : 'DAY ' + pad(day) + ' / 21') + '</span>' +
          (m.streak > 0
            ? '<span class="streak-chip">' + icon('flame', 13) + ' ' + m.streak + ' day' + (m.streak === 1 ? '' : 's') + '</span>'
            : m.done > 0
              ? '<span class="streak-chip">' + icon('check', 12) + ' ' + m.done + ' marked</span>'
              : '') +
        '</span>' +
        '<span class="active-name">' + esc(c.name) + '</span>' +
        '<span class="active-tag">' + esc(c.tagline) + '</span>' +
        '<span class="active-progress">' + progress(m.pct) + '</span>' +
        '<span class="active-meta"><b>' + m.done + ' of 21 days done</b><span>' + (21 - m.done) + ' to go</span></span>' +
        '<span class="active-desc">' + esc(c.description) + '</span>' +
        '<span class="active-today"><span class="section-label">' + (doneToday ? 'Today · complete' : 'Today’s task') + '</span><b>' + esc(task.title) + '</b></span>' +
        '<span class="active-cta">' + (doneToday ? 'Review today' : 'Continue Challenge') + icon('arrow', 15) + '</span>' +
        '</button>';
      if (m.missed > 0) {
        activeCard += '<button type="button" class="recovery-note" data-go="journey">' +
          icon('reset', 14) + '<span><b>' + m.missed + ' missed day' + (m.missed === 1 ? '' : 's') + '.</b> Open the journey to catch up — your history is safe.</span>' + icon('chev', 13) +
          '</button>';
      }
    } else {
      activeCard = '<button type="button" class="empty-challenge" data-act="browse">' +
        '<span class="empty-ico">' + icon('spark', 24) + '</span>' +
        '<span class="empty-title">No challenge running.</span>' +
        '<span class="empty-desc">Pick a category below and start your first 21 days. Small actions, real progress.</span>' +
        '<span class="btn btn-primary small">Choose a challenge ' + icon('arrow', 14) + '</span>' +
        '</button>';
    }

    const cats = A.DATA.categories.map(function (cat) {
      return '<button type="button" class="cat-card" data-category="' + cat.id + '" style="--c:' + cat.color + ';--c-soft:' + cat.colorSoft + '">' +
        '<span class="cat-ico">' + icon(cat.icon, 22) + '</span>' +
        '<span class="cat-name">' + cat.name + '</span>' +
        '<span class="cat-desc">' + cat.short + '</span>' +
        '<span class="cat-arrow">' + icon('arrow', 14) + '</span>' +
        '</button>';
    }).join('');

    const customCard = '<button type="button" class="cat-card custom" data-go="custom" style="--c:' + A.DATA.customCategory.color + ';--c-soft:' + A.DATA.customCategory.colorSoft + '">' +
      '<span class="cat-ico">' + icon('spark', 22) + '</span>' +
      '<span class="cat-copy"><span class="cat-name">Custom</span><span class="cat-desc">Create a personalized challenge.</span></span>' +
      '<span class="cat-arrow">' + icon('plus', 15) + '</span>' +
      '</button>';

    const doneCards = history.slice(0, 2).map(function (r) {
      return '<button type="button" class="done-card" data-history="' + esc(r.id) + '" style="--c:' + (r.color || '#E8451F') + '">' +
        '<span class="done-check">' + icon('check', 14) + '</span>' +
        '<span class="done-info"><b>' + esc(r.name) + '</b><small>21 / 21 days · Finished ' + A.formatShortDate(A.parseISO(r.completedAt)) + '</small></span>' +
        '<span class="done-chev">' + icon('chev', 14) + '</span>' +
        '</button>';
    }).join('');

    return '<section class="screen home">' +
      '<div class="topbar home-topbar">' +
        '<div class="brand"><span class="brand-mark">✦</span><span>FLARE</span></div>' +
        '<button type="button" class="avatar" data-go="profile" aria-label="Your profile"><span>' + esc((st.name || 'F').charAt(0).toUpperCase()) + '</span><i class="flame-dot">' + icon('flame', 10) + '</i></button>' +
      '</div>' +

      '<div class="hub-head stagger">' +
        '<p class="kicker"><span class="dot"></span> The 21-day field club · ' + A.greeting() + ', ' + name + '</p>' +
        '<h1 class="hub-title">Make the next <em>21 days</em> count.</h1>' +
        '<p class="hub-lede">Small actions. Real progress.</p>' +
      '</div>' +

      '<div class="stagger">' +
        activeCard +

        '<div class="section-head"><span class="section-label">Create a challenge</span><span class="section-note">Pick a lane</span></div>' +
        '<div class="cat-grid">' + cats + customCard + '</div>' +

        '<div class="section-head">' +
          '<span class="section-label">Completed challenges</span>' +
          (history.length > 2 ? '<button type="button" class="link-btn" data-go="achievements">View all ' + icon('chev', 12) + '</button>' : '') +
        '</div>' +
        (history.length
          ? '<div class="done-list">' + doneCards + '</div>'
          : '<div class="done-empty">' + icon('trophy', 17) + '<span>Your first finish line will appear here.</span></div>') +
      '</div>' +
      '</section>';
  }

  /* -------------------------------- explore ----------------------------- */

  function explore(categoryId) {
    const cat = categoryOf(categoryId);
    const programs = A.DATA.programsFor(cat.id);

    const cards = programs.map(function (p) {
      return '<button type="button" class="program-card" data-program="' + p.id + '" style="--c:' + p.color + ';--c-soft:' + p.colorSoft + '">' +
        '<span class="program-ico">' + icon(p.icon, 21) + '</span>' +
        '<span class="program-body">' +
          '<span class="program-top"><b>' + esc(p.name) + '</b>' + (p.classic ? '<span class="classic-tag">CLUB CLASSIC</span>' : '') + '<span class="diff ' + diffClass(p.difficulty) + '">' + p.difficulty + '</span></span>' +
          '<span class="program-desc">' + esc(p.description) + '</span>' +
          '<span class="program-meta">' + icon('clock', 12) + ' ' + p.minutes + ' min/day · 21 days</span>' +
        '</span>' +
        '<span class="program-chev">' + icon('chev', 15) + '</span>' +
        '</button>';
    }).join('');

    return '<section class="screen explore">' +
      '<div class="topbar">' +
        '<button type="button" class="icon-btn" data-act="go-back" aria-label="Back">' + icon('back', 18) + '</button>' +
        '<span class="topbar-center">Challenge category</span>' +
        '<span class="topbar-spacer"></span>' +
      '</div>' +

      '<div class="explore-hero" style="--c:' + cat.color + ';--c-soft:' + cat.colorSoft + '">' +
        '<span class="explore-ico">' + icon(cat.icon, 28) + '</span>' +
        '<p class="kicker"><span class="dot"></span> ' + esc(cat.kicker) + '</p>' +
        '<h1 class="title">' + cat.name + '<em>.</em></h1>' +
        '<p class="explore-desc">' + esc(cat.short) + '</p>' +
      '</div>' +

      '<div class="section-head"><span class="section-label">Choose a challenge</span><span class="section-note">' + programs.length + ' options</span></div>' +
      '<div class="program-list stagger">' + cards + '</div>' +
      '<p class="explore-note">Every challenge is 21 days. Pick the one you can keep on a bad day.</p>' +
      '</section>';
  }

  /* --------------------------------- detail ----------------------------- */

  function detail(program) {
    const cat = categoryOf(program.categoryId);
    const tasks = program.tasks || [];
    const sampleIndexes = tasks.length > 14 ? [0, 7, 14] : [0, 1, 2].filter(function (i) { return i < tasks.length; });
    const samples = sampleIndexes.map(function (i) {
      const t = tasks[i];
      return '<div class="sample-task"><span class="sample-day">' + pad(i + 1) + '</span><span><b>' + esc(t[0]) + '</b><small>' + esc(t[1]) + '</small></span></div>';
    }).join('');

    const allDays = (program.tasks || []).map(function (t, i) {
      return '<div class="all-day-row"><span>' + pad(i + 1) + '</span><b>' + esc(t[0]) + '</b></div>';
    }).join('');

    const benefits = (program.benefits || []).map(function (b) {
      return '<li><span class="benefit-check">' + icon('check', 12) + '</span>' + esc(b) + '</li>';
    }).join('');

    return '<section class="screen detail">' +
      '<div class="topbar">' +
        '<button type="button" class="icon-btn" data-act="go-back" aria-label="Back">' + icon('back', 18) + '</button>' +
        '<span class="topbar-center">Challenge details</span>' +
        '<span class="topbar-spacer"></span>' +
      '</div>' +

      '<div class="detail-hero" style="--c:' + program.color + ';--c-soft:' + program.colorSoft + '">' +
        '<span class="detail-ico">' + icon(program.icon, 30) + '</span>' +
        '<p class="kicker"><span class="dot"></span> ' + cat.name + (program.classic ? ' · club classic' : '') + '</p>' +
        '<h1 class="detail-title">' + esc(program.name) + '</h1>' +
        '<p class="detail-tagline">' + esc(program.tagline) + '</p>' +
      '</div>' +

      '<div class="detail-meta">' +
        '<span class="chip">' + icon('clock', 12) + ' ' + program.minutes + ' min/day</span>' +
        '<span class="chip">' + icon('route', 12) + ' 21 days</span>' +
        '<span class="chip diff ' + diffClass(program.difficulty) + '">' + program.difficulty + '</span>' +
      '</div>' +

      '<p class="detail-desc">' + esc(program.description) + '</p>' +

      '<div class="detail-block">' +
        '<span class="section-label">Daily task examples</span>' +
        '<div class="sample-list">' + samples + '</div>' +
      '</div>' +

      '<div class="detail-block">' +
        '<span class="section-label">Why it works</span>' +
        '<ul class="benefit-list">' + benefits + '</ul>' +
      '</div>' +

      '<div class="detail-block">' +
        '<span class="section-label">How to do it</span>' +
        '<p class="detail-instructions">' + esc(program.instructions) + '</p>' +
      '</div>' +

      '<details class="all-days">' +
        '<summary>See all 21 daily tasks ' + icon('chev', 13) + '</summary>' +
        '<div class="all-day-list">' + allDays + '</div>' +
      '</details>' +

      '<div class="detail-actions">' +
        '<button type="button" class="btn btn-primary btn-block" data-act="choose-program" data-id="' + program.id + '">Set up this challenge ' + icon('arrow', 16) + '</button>' +
      '</div>' +
      '</section>';
  }

  /* --------------------------------- custom ----------------------------- */

  function custom(draft) {
    const d = draft || { name: '', task: '', minutes: 20, difficulty: 'Easy' };
    return '<section class="screen custom">' +
      '<div class="topbar">' +
        '<button type="button" class="icon-btn" data-act="go-back" aria-label="Back">' + icon('back', 18) + '</button>' +
        '<span class="topbar-center">Create your own</span>' +
        '<span class="topbar-spacer"></span>' +
      '</div>' +

      '<div class="explore-hero" style="--c:' + A.DATA.customCategory.color + ';--c-soft:' + A.DATA.customCategory.colorSoft + '">' +
        '<span class="explore-ico">' + icon('spark', 28) + '</span>' +
        '<p class="kicker"><span class="dot"></span> Make it personal</p>' +
        '<h1 class="title">Your own <em>21.</em></h1>' +
        '<p class="explore-desc">Name the thing. Set a daily size you can actually keep.</p>' +
      '</div>' +

      '<div class="setup-card">' +
        '<label class="field-label" for="customName">Challenge name</label>' +
        '<input class="input" id="customName" maxlength="46" value="' + esc(d.name) + '" placeholder="e.g. 21 days of guitar" />' +
        '<label class="field-label" for="customTask">What is the daily task?</label>' +
        '<input class="input" id="customTask" maxlength="90" value="' + esc(d.task) + '" placeholder="e.g. practise one song for 20 minutes" />' +
        '<div class="field-row">' +
          '<label class="field-label" for="customMinutes">Daily minutes</label>' +
          '<span class="field-value"><b id="customMinutesNum">' + d.minutes + '</b> min</span>' +
        '</div>' +
        '<input class="range" id="customMinutes" type="range" min="5" max="60" step="5" value="' + d.minutes + '" style="--fill:' + (((d.minutes - 5) / 55) * 100) + '%" aria-label="Daily minutes" />' +
        '<span class="field-label" style="margin-top:18px">Difficulty</span>' +
        '<div class="diff-picks">' +
          ['Easy', 'Medium', 'Hard'].map(function (level) {
            return '<button type="button" class="diff-pick ' + (d.difficulty === level ? 'sel' : '') + '" data-act="custom-difficulty" data-value="' + level + '">' + level + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="setup-actions">' +
        '<button type="button" class="btn btn-primary btn-block" data-act="custom-continue">Continue ' + icon('arrow', 16) + '</button>' +
      '</div>' +
      '</section>';
  }

  /* --------------------------------- setup ------------------------------ */

  function setup(step, draft, program) {
    const cat = categoryOf(program.categoryId);
    const name = programName(program, draft);
    const tagline = programTagline(program, draft);
    const isCustom = program.id === 'custom';
    const start = draft.startDate ? A.parseISO(draft.startDate) : A.today();
    const end = new Date(start.getTime() + 20 * 86400000);
    const targetHint = program.targetHint || (isCustom ? 'e.g. 20 minutes' : 'optional daily target');
    const warn = A.hasActive()
      ? '<div class="setup-warn">' + icon('reset', 15) + '<span>Starting this challenge replaces your current one. Your active progress will be cleared.</span></div>'
      : '';

    let body = '';

    if (step === 1) {
      body = '<div class="challenge-mini" style="--c:' + cat.color + ';--c-soft:' + cat.colorSoft + '">' +
          '<span class="cm-ico">' + icon(program.icon, 19) + '</span>' +
          '<div class="cm-copy"><b>' + esc(name) + '</b><small>' + esc(tagline) + '</small></div>' +
          '<span class="pill">' + program.minutes + ' min</span>' +
        '</div>' +
        '<div class="setup-card stagger">' +
          '<label class="field-label" for="startDate">Start date</label>' +
          '<input class="input" id="startDate" type="date" value="' + esc(draft.startDate || A.iso(A.today())) + '" min="' + A.iso(A.today()) + '" />' +
          '<label class="field-label" for="dailyTarget">Daily target <span class="field-optional">optional</span></label>' +
          '<input class="input" id="dailyTarget" maxlength="40" value="' + esc(draft.dailyTarget || '') + '" placeholder="' + esc(targetHint) + '" />' +
          '<label class="field-label" for="setupName">Your name <span class="field-optional">optional</span></label>' +
          '<input class="input" id="setupName" maxlength="22" value="' + esc(draft.name || '') + '" placeholder="First name" />' +
          '<div class="switch-row">' +
            '<div class="sv-text"><b>Daily reminder</b><small>One notification on this device.</small></div>' +
            '<button type="button" class="switch" data-act="setup-toggle-reminder" aria-pressed="' + (draft.reminder ? 'true' : 'false') + '" aria-label="Toggle daily reminder"></button>' +
          '</div>' +
          '<label class="field-label" for="reminderTime">Reminder time</label>' +
          '<input class="input" id="reminderTime" type="time" value="' + esc(draft.reminderTime || '08:00') + '" ' + (draft.reminder ? '' : 'disabled') + ' />' +
        '</div>' +
        '<p class="setup-note">The duration is always 21 days. You can change your reminder later in Profile.</p>';
    } else {
      body = '<div class="setup-ticket stagger">' +
        '<div class="ticket">' +
          '<div class="ticket-top">' +
            '<div><div class="ticket-num">21<small>days</small></div><div class="ticket-sub">fixed duration</div></div>' +
            '<div class="ticket-badge" style="color:' + cat.color + '">' + icon(program.icon, 24) + '</div>' +
          '</div>' +
          '<div class="ticket-title">' + esc(name) + '</div>' +
          '<div class="ticket-sub">' + esc(tagline) + ' · ' + esc(cat.name) + '</div>' +
          '<div class="ticket-divide"></div>' +
          '<div class="ticket-row"><span>Daily commitment</span><b>' + program.minutes + ' min</b></div>' +
          '<div class="ticket-row"><span>Difficulty</span><b>' + esc(program.difficulty || 'Easy') + '</b></div>' +
          '<div class="ticket-row"><span>Daily target</span><b>' + esc(draft.dailyTarget || 'Not set') + '</b></div>' +
          '<div class="ticket-row"><span>Starts</span><b>' + A.formatDate(start, { month: 'short', day: 'numeric' }) + '</b></div>' +
          '<div class="ticket-row"><span>Finish line</span><b>' + A.formatDate(end, { month: 'short', day: 'numeric' }) + '</b></div>' +
          '<div class="ticket-row"><span>Reminder</span><b>' + (draft.reminder ? A.reminderLabelFor(draft.reminderTime) : 'Off') + '</b></div>' +
          '<div class="ticket-foot"><span>FLARE CLUB · MEMBER 0021</span><b>' + (draft.name ? 'FOR ' + esc(draft.name).toUpperCase() : 'GOOD DECISIONS') + '</b></div>' +
        '</div>' +
        '</div>' + warn +
        '<p class="setup-note">One active challenge at a time. Missing a day never deletes your history.</p>';
    }

    return '<section class="screen setup nonav">' +
      '<div class="stephead">' +
        '<button type="button" class="icon-btn" data-act="go-back" aria-label="Back">' + icon('back', 18) + '</button>' +
        '<span class="stepcount">Step ' + step + ' / 2</span>' +
        '<span class="topbar-spacer"></span>' +
      '</div>' +
      '<div class="stepbar">' + [1, 2].map(function (i) {
        return '<i class="' + (i <= step ? 'on' : '') + '"></i>';
      }).join('') + '</div>' +

      '<h1 class="setup-title">' + (step === 1 ? 'Set your <em>rhythm.</em>' : 'Ready to <em>lock it in?</em>') + '</h1>' +
      '<p class="setup-sub">' + (step === 1 ? 'A start date, a gentle reminder and a target you can keep.' : 'One last look before your first day begins.') + '</p>' +
      body +

      '<div class="setup-actions">' +
        (step === 1
          ? '<button type="button" class="btn btn-primary btn-block" data-act="setup-next">Review challenge ' + icon('arrow', 16) + '</button>'
          : '<button type="button" class="btn btn-primary btn-block" data-act="start-challenge">Start My 21-Day Challenge ' + icon('arrow', 16) + '</button>') +
      '</div>' +
      '</section>';
  }

  return {
    nav: nav,
    brandBar: brandBar,
    ring: ring,
    home: home,
    explore: explore,
    detail: detail,
    custom: custom,
    setup: setup,
  };
})();
