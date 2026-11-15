/* FLARE — screen markup: welcome, setup, home */
window.S = (function () {
  const A = window.App;
  const I = window.ILLUS;
  const esc = A.esc;
  const icon = A.icon;

  const NAV = [
    { id: 'home', label: 'Today', icon: 'home' },
    { id: 'journey', label: 'Journey', icon: 'route' },
    { id: 'stats', label: 'Receipts', icon: 'chart' },
    { id: 'you', label: 'You', icon: 'user' },
  ];

  function nav(active) {
    return NAV.map(function (n) {
      return '<button class="nav-item ' + (active === n.id ? 'active' : '') + '" data-go="' + n.id + '" aria-label="' + n.label + '">' +
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

  /* ------------------------------- welcome ------------------------------ */

  function welcome() {
    const marquee = '<div class="marquee" aria-hidden="true"><div class="marquee-track">' +
      ['MOVE', 'MAKE', 'MIND', 'UNPLUG', 'NO ZERO DAYS', '21 DAYS', 'TINY WINS'].map(function (w) {
        return '<span>' + w + '</span>';
      }).join('') +
      ['MOVE', 'MAKE', 'MIND', 'UNPLUG', 'NO ZERO DAYS', '21 DAYS', 'TINY WINS'].map(function (w) {
        return '<span>' + w + '</span>';
      }).join('') +
      '</div></div>';

    return '<section class="screen welcome nonav">' +
      '<div class="topbar">' +
        '<div class="brand"><span class="brand-mark">✦</span><span>FLARE</span></div>' +
        '<span class="pill">Est. 21 days</span>' +
      '</div>' +

      '<div class="welcome-copy stagger">' +
        '<p class="kicker"><span class="dot"></span> The 21-day field club</p>' +
        '<h1 class="welcome-title">Show up.<br><em>Keep count.</em></h1>' +
      '</div>' +

      '<div class="welcome-art">' +
        '<span class="halo"></span>' +
        '<div class="orbit"></div>' +
        '<div class="orbit rev"></div>' +
        '<span class="sticker s1">' + icon('bolt', 22) + '</span>' +
        '<span class="sticker s2">' + icon('star', 24) + '</span>' +
        '<span class="sticker s3">' + icon('lotus', 21) + '</span>' +
        '<span class="sticker s4">' + icon('spark', 18) + '</span>' +
        '<div class="orb-wrap">' + I.orb21(178, '21') + '</div>' +
        '<div class="mascot-peek">' + I.mascot(76) + '</div>' +
      '</div>' +

      '<div class="welcome-cta">' +
        '<button class="btn btn-primary btn-block" data-act="start">Start my 21 <span class="ico">' + icon('arrow', 18) + '</span></button>' +
        '<button class="btn btn-ghost btn-block" data-act="demo">Peek a demo <span class="pill">5 days in</span></button>' +
        '<p class="micro">No zero days. No hype. Just receipts.</p>' +
      '</div>' +

      marquee +

      '<div class="welcome-foot"><span class="faces"><i></i><i></i><i></i></span> Member 0021 · the club is open</div>' +
      '</section>';
  }

  /* -------------------------------- setup ------------------------------- */

  const STEP_TITLES = {
    1: 'What are you <em>counting?</em>',
    2: 'How much time is <em>real?</em>',
    3: 'When will you <em>show up?</em>',
    4: 'Lock in your <em>21.</em>',
  };

  const STEP_SUBS = {
    1: 'Pick one thing. Specific beats impressive.',
    2: 'A daily dose you can keep on a bad day — that’s the whole trick.',
    3: 'Rituals need a time. We’ll nudge you like a polite little stamp.',
    4: 'One goal. Twenty-one days. Zero zero-days.',
  };

  function setup(step, draft) {
    let body = '';

    if (step === 1) {
      const picks = A.DATA.challenges.map(function (c) {
        return '<button class="pick ' + (draft.challengeId === c.id ? 'sel' : '') + '" data-act="pick" data-id="' + c.id + '" style="--c:' + c.color + ';--c-soft:' + c.colorSoft + '">' +
          '<span class="pick-ico">' + icon(c.icon, 21) + '</span>' +
          '<span class="pick-name">' + c.name + '</span>' +
          '<span class="pick-tag">' + c.tagline + '</span>' +
          '<span class="pick-check">' + icon('check', 13) + '</span>' +
          '</button>';
      }).join('');

      body = '<div class="pick-grid stagger">' + picks +
        '<button class="pick custom ' + (draft.challengeId === 'custom' ? 'sel' : '') + '" data-act="pick" data-id="custom" style="--c:var(--marigold);--c-soft:rgba(227,161,28,.18)">' +
          '<span class="pick-ico">' + icon('spark', 19) + '</span>' +
          '<div style="flex:1"><span class="pick-name" style="display:block">Something else</span><span class="pick-tag" style="display:block">Brew your own 21</span></div>' +
          '<span class="pick-check" style="top:21px">' + icon('check', 13) + '</span>' +
        '</button>' +
        '<div class="custom-field ' + (draft.challengeId === 'custom' ? '' : 'hide') + '" id="customField">' +
          '<label class="field-label" for="customGoal">Name your challenge</label>' +
          '<input class="input" id="customGoal" maxlength="46" value="' + esc(draft.customGoal) + '" placeholder="e.g. 21 days of guitar" />' +
        '</div>' +
        '</div>';
    }

    if (step === 2) {
      const fill = ((draft.minutes - 5) / 55) * 100;
      const hrs = ((draft.minutes * 21) / 60).toFixed(1).replace('.0', '');
      body = '<div class="slider-card stagger">' +
          '<div class="big-num"><span id="minutesNum">' + draft.minutes + '</span><small>min / day</small></div>' +
          '<input class="range" id="minutesRange" type="range" min="5" max="60" step="5" value="' + draft.minutes + '" style="--fill:' + fill + '%" aria-label="Daily minutes" />' +
          '<div class="range-labels"><span>Tiny</span><b id="vibeLabel">' + vibe(draft.minutes) + '</b><span>Spicy</span></div>' +
          '<div class="presets">' +
            [10, 20, 30, 45].map(function (m) {
              return '<button class="preset ' + (draft.minutes === m ? 'sel' : '') + '" data-act="preset" data-min="' + m + '">' + m + ' min</button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="vibe-note" id="timeNote">' + icon('clock', 17) + '<span><b>' + hrs + ' hours</b> of showing up over 21 days. Small price for a new default.</span></div>' +
        '<p class="lede">Tally will split this into a warm-up, the main thing, and a tiny cool-down. No marathons.</p>';
    }

    if (step === 3) {
      const times = ['sunrise', 'midday', 'sunset', 'moon'].map(function (k) {
        const t = A.TIME_LABELS[k];
        return '<button class="time-chip ' + (draft.timeOfDay === k ? 'sel' : '') + '" data-act="time" data-time="' + k + '">' +
          '<span class="ico">' + icon(t.icon, 18) + '</span>' +
          '<span><b>' + t.label + '</b><small>' + t.window + '</small></span>' +
          '</button>';
      }).join('');

      body = '<div class="stagger">' +
        '<label class="field-label" for="nameInput" style="margin-top:2px">What should Tally call you?</label>' +
        '<input class="input" id="nameInput" maxlength="22" value="' + esc(draft.name) + '" placeholder="Your first name (optional)" />' +
        '<span class="field-label">Your daily ritual window</span>' +
        '<div class="time-grid">' + times + '</div>' +
        '<div class="switch-row">' +
          '<div class="sv-text"><b>Gentle daily nudge</b><small>One notification. No guilt trips.</small></div>' +
          '<button class="switch" data-act="toggle-reminder" aria-pressed="' + (draft.reminder ? 'true' : 'false') + '" aria-label="Toggle reminder"></button>' +
        '</div>' +
        '</div>';
    }

    if (step === 4) {
      const c = draft.challengeId === 'custom'
        ? { name: 'My thing', tagline: draft.customGoal || 'Your own 21', color: '#E3A11C', icon: 'spark' }
        : A.DATA.challenges.find(function (x) { return x.id === draft.challengeId; }) || A.DATA.challenges[0];
      const t = A.TIME_LABELS[draft.timeOfDay] || A.TIME_LABELS.sunrise;
      const start = A.today();
      const end = new Date(start.getTime() + 20 * 86400000);
      const totalHrs = ((draft.minutes * 21) / 60).toFixed(1).replace('.0', '');
      const warn = A.state.onboarded
        ? '<div class="vibe-note" style="border-color:var(--tomato);color:var(--tomato);margin-top:12px">' + icon('reset', 17) + '<span>Locking this in starts a fresh 21 and clears your current streak.</span></div>'
        : '';

      body = '<div class="stagger">' +
        '<div class="ticket">' +
          '<div class="ticket-top">' +
            '<div><div class="ticket-num">' + draft.minutes + '<small>min</small></div><div class="ticket-sub">daily dose</div></div>' +
            '<div class="ticket-badge" style="color:' + c.color + '">' + icon(c.icon, 24) + '</div>' +
          '</div>' +
          '<div class="ticket-title">' + esc(c.name === 'My thing' ? (draft.customGoal || 'My thing') : c.name) + '</div>' +
          '<div class="ticket-sub">' + esc(c.tagline) + ' · 21 days</div>' +
          '<div class="ticket-divide"></div>' +
          '<div class="ticket-row"><span>Daily ritual</span><b>' + t.label + ' · ' + t.window + '</b></div>' +
          '<div class="ticket-row"><span>Total time</span><b>' + totalHrs + ' hours</b></div>' +
          '<div class="ticket-row"><span>Starts</span><b>' + A.formatDate(start, { month: 'short', day: 'numeric' }) + '</b></div>' +
          '<div class="ticket-row"><span>Finish line</span><b>' + A.formatDate(end, { month: 'short', day: 'numeric' }) + '</b></div>' +
          '<div class="ticket-row"><span>Nudges</span><b>' + (draft.reminder ? 'On, gently' : 'Off') + '</b></div>' +
          '<div class="ticket-foot"><span>FLARE CLUB · MEMBER 0021</span><b>' + (draft.name ? 'FOR ' + esc(draft.name).toUpperCase() : 'GOOD DECISIONS') + '</b></div>' +
        '</div>' + warn +
        '<p class="lede" style="margin-top:16px">You can change the daily dose later. The streak, however, is a jealous little thing.</p>' +
        '</div>';
    }

    return '<section class="screen setup nonav">' +
      '<div class="stephead">' +
        '<button class="icon-btn" data-act="' + (step === 1 ? 'exit-setup' : 'step-back') + '" aria-label="Back">' + icon('back', 18) + '</button>' +
        '<span class="stepcount">Step ' + step + ' / 4</span>' +
        '<span style="width:39px"></span>' +
      '</div>' +
      '<div class="stepbar">' + [1, 2, 3, 4].map(function (i) {
        return '<i class="' + (i <= step ? 'on' : '') + '"></i>';
      }).join('') + '</div>' +

      '<h1 class="setup-title">' + STEP_TITLES[step] + '</h1>' +
      '<p class="setup-sub">' + STEP_SUBS[step] + '</p>' +
      body +

      '<div class="setup-actions">' +
        '<button class="btn btn-next btn-primary" data-act="step-next">' +
          '<span>' + (step === 4 ? 'Lock it in' : 'Continue') + '</span>' +
          '<span class="ico">' + icon('arrow', 18) + '</span>' +
        '</button>' +
      '</div>' +
      '</section>';
  }

  function vibe(min) {
    if (min <= 10) return 'tiny but mighty';
    if (min <= 25) return 'the sweet spot';
    if (min <= 40) return 'solid commitment';
    return 'big swing energy';
  }

  /* --------------------------------- home ------------------------------- */

  function home() {
    const st = A.state;
    const m = A.metrics();
    const c = A.challenge();
    const day = m.day;
    const doneToday = A.isDone(day);
    const finished = m.done >= 21;
    const q = A.quote();
    const task = A.taskFor(day);
    const name = st.name ? esc(st.name) : 'friend';
    const week = Math.ceil(day / 7);
    const first = (week - 1) * 7 + 1;
    const weekDays = [];
    for (let i = 0; i < 7; i++) weekDays.push(first + i);

    const dots = [];
    for (let i = 1; i <= 21; i++) dots.push('<span class="dot ' + A.statusOf(i) + '"></span>');

    const hero = '<section class="hero-card">' +
      '<div class="hero-top">' +
        '<span class="pill ' + (finished ? 'lime' : '') + '">' + (finished ? '21 / 21 · COMPLETE' : 'DAY ' + String(day).padStart(2, '0') + ' / 21') + '</span>' +
        '<span class="streak-chip">' + icon('flame', 14) + m.streak + ' day' + (m.streak === 1 ? '' : 's') + '</span>' +
      '</div>' +
      '<div class="hero-mid">' +
        '<div>' +
          '<p class="hero-label">' + (finished ? 'Field club certified' : 'The running count') + '</p>' +
          '<div class="big-day">' + String(m.done).padStart(2, '0') + '<sup>/21</sup></div>' +
          '<p class="hero-sub"><b>' + m.done + ' ritual' + (m.done === 1 ? '' : 's') + '</b> done · ' + (21 - m.done) + ' to go</p>' +
        '</div>' +
        ring(m.pct, { cap: 'of 21 marked' }) +
      '</div>' +
      '<div class="dots">' + dots.join('') + '</div>' +
      '<div class="hero-foot">' +
        '<span class="chip">' + icon('bolt', 12) + ' ' + m.xp + ' XP</span>' +
        '<span class="chip">' + icon('clock', 12) + ' ' + m.minutes + ' min</span>' +
        '<span class="chip">' + icon('trophy', 12) + ' ' + m.level.current.name + '</span>' +
      '</div>' +
      '</section>';

    let todayCard = '';
    if (finished) {
      todayCard = '<article class="today-card is-done">' +
        '<span class="watermark">21</span>' +
        '<div class="today-head"><span class="tag-ink">' + icon('trophy', 12) + ' ALL 21 COMPLETE</span><span class="today-sticker">' + icon('check', 22) + '</span></div>' +
        '<h2 class="today-title">You did the whole thing.</h2>' +
        '<p class="today-desc">Twenty-one days of showing up. Go collect your receipt — and your story card.</p>' +
        '<div class="today-foot"><span class="xp-tag">' + icon('spark', 14) + ' ' + m.xp + ' XP earned</span><button class="btn btn-dark small" data-act="go-finale">See the finale ' + icon('arrow', 13) + '</button></div>' +
        '</article>';
    } else if (doneToday) {
      const note = st.notes[day];
      todayCard = '<article class="today-card is-done">' +
        '<span class="watermark">' + String(day).padStart(2, '0') + '</span>' +
        '<div class="today-head"><span class="tag-ink">' + icon('check', 12) + ' TODAY · DONE</span><span class="today-sticker">' + icon('check', 22) + '</span></div>' +
        '<h2 class="today-title">' + esc(task.title) + '</h2>' +
        '<p class="today-desc">' + (note ? '“' + esc(note) + '”' : 'You did the thing. Tally is doing a little dance for you.') + '</p>' +
        '<div class="today-foot"><span class="xp-tag">' + icon('bolt', 14) + ' 60 XP banked</span><button class="btn btn-dark small" data-open-day="' + day + '">View recap ' + icon('chev', 12) + '</button></div>' +
        '</article>';
    } else {
      todayCard = '<article class="today-card">' +
        '<span class="watermark">' + String(day).padStart(2, '0') + '</span>' +
        '<div class="today-head"><span class="tag-ink">' + icon('clock', 12) + ' TODAY · ' + st.minutes + ' MIN</span><span class="today-sticker">' + icon(c.icon, 22) + '</span></div>' +
        '<h2 class="today-title">' + esc(task.title) + '</h2>' +
        '<p class="today-desc">' + esc(task.blurb) + '</p>' +
        '<div class="today-foot"><span class="xp-tag">' + icon('bolt', 14) + ' +60 XP ' + (A.isDone(day - 1) ? '+20 streak' : '') + '</span><button class="btn btn-dark small" data-open-day="' + day + '">Start quest ' + icon('arrow', 13) + '</button></div>' +
        '</article>';
    }

    const strip = weekDays.map(function (n) {
      const s = A.statusOf(n);
      return '<button class="week-day ' + s + '" data-open-day="' + n + '" aria-label="Day ' + n + '">' +
        '<span>' + A.weekdayLetter(n) + '</span>' +
        '<b>' + n + '</b>' +
        '<i class="mini"></i>' +
        '</button>';
    }).join('');

    return '<section class="screen home">' +
      '<div class="home-head">' +
        '<div class="greet">' +
          '<p class="greet-date">' + A.formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase() + '</p>' +
          '<p class="greet-name">' + A.greeting() + ', <em>' + name + '</em></p>' +
        '</div>' +
        '<button class="avatar" data-go="you" aria-label="Your profile"><span>' + esc((st.name || 'F').charAt(0).toUpperCase()) + '</span><i class="flame-dot">' + icon('flame', 10) + '</i></button>' +
      '</div>' +

      '<div class="stagger">' +
        hero +
        todayCard +

        '<div class="week-card">' +
          '<div class="week-head"><span class="section-label">Week ' + week + ' · ' + (week === 1 ? 'The start' : week === 2 ? 'The middle' : 'The finish') + '</span><button class="link-btn" data-go="journey">Full journey ' + icon('chev', 12) + '</button></div>' +
          '<div class="week-strip">' + strip + '</div>' +
        '</div>' +

        '<button class="mini-link" data-go="stats">' +
          '<span class="ml-left"><span class="ml-ico">' + icon('chart', 16) + '</span><span><b>Your receipts</b><small>' + m.pct + '% marked · ' + m.bestStreak + '-day best streak</small></span></span>' +
          icon('chev', 15) +
        '</button>' +

        '<div class="quote-card">' +
          '<span class="quote-mark">“</span>' +
          '<p>' + q[0] + '</p>' +
          '<span class="by">— ' + q[1] + ', club mascot</span>' +
        '</div>' +
      '</div>' +
      '</section>';
  }

  return { nav: nav, brandBar: brandBar, ring: ring, welcome: welcome, setup: setup, home: home, vibe: vibe };
})();
