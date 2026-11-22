/* FLARE — core state, scoring, icons, effects */
window.App = (function () {
  const DATA = window.FLARE;
  const KEY = 'flare21.v1';
  const DAY = 86400000;

  const DEFAULT = {
    version: 2,
    onboarded: false,
    name: '',
    challengeId: null,
    challengeKey: null,
    categoryId: null,
    challengeName: '',
    challengeTagline: '',
    customGoal: '',
    customTask: '',
    difficulty: '',
    startDate: null,
    completed: [],
    notes: {},
    minutes: 20,
    timeOfDay: 'sunrise',
    reminder: true,
    reminderTime: '08:00',
    dailyTarget: '',
    history: [],
    sound: true,
    motion: true,
  };

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function uniqueSorted(list) {
    const seen = {};
    return (Array.isArray(list) ? list : [])
      .map(function (n) { return parseInt(n, 10); })
      .filter(function (n) {
        if (!n || n < 1 || n > 21 || seen[n]) return false;
        seen[n] = true;
        return true;
      })
      .sort(function (a, b) { return a - b; });
  }

  function defaultReminder(timeOfDay) {
    return { sunrise: '07:00', midday: '12:30', sunset: '18:00', moon: '21:00' }[timeOfDay] || '08:00';
  }

  function normalizeState(raw) {
    const s = Object.assign(clone(DEFAULT), raw || {});
    s.completed = uniqueSorted(s.completed);
    s.history = Array.isArray(s.history) ? s.history.filter(function (r) { return r && r.id; }) : [];
    s.notes = s.notes && typeof s.notes === 'object' ? s.notes : {};
    s.version = 2;

    if (!s.challengeKey && s.challengeId) {
      if (s.challengeId === 'custom') s.challengeKey = 'custom';
      else if (DATA.getProgram(s.challengeId)) s.challengeKey = s.challengeId;
      else if (DATA.getCategory(s.challengeId)) s.challengeKey = s.challengeId;
    }
    if (!s.reminderTime) s.reminderTime = defaultReminder(s.timeOfDay);
    if (!s.categoryId && s.challengeKey) {
      const p = DATA.getProgram(s.challengeKey);
      if (p) s.categoryId = p.categoryId;
      else if (s.challengeKey === 'custom') s.categoryId = 'custom';
    }
    if (s.startDate || s.history.length) s.onboarded = true;
    return s;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULT);
      return normalizeState(JSON.parse(raw));
    } catch (e) {
      return clone(DEFAULT);
    }
  }

  let state = load();
  let resetArmed = false;
  let abandonArmed = false;

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function replaceState(raw) {
    state = normalizeState(raw);
    resetArmed = false;
    save();
    return state;
  }

  function reset() {
    state = clone(DEFAULT);
    resetArmed = false;
    abandonArmed = false;
    save();
  }

  function today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function parseISO(s) {
    if (!s) return today();
    const p = String(s).split('-').map(Number);
    return new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
  }

  function iso(d) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function startDate() {
    return state.startDate ? parseISO(state.startDate) : today();
  }

  function dayDate(n) {
    return new Date(startDate().getTime() + (n - 1) * DAY);
  }

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, Math.max(lo, n))); }

  function currentDay() {
    if (!state.startDate) return 1;
    const diff = Math.round((today().getTime() - startDate().getTime()) / DAY);
    return clamp(diff + 1, 1, 21);
  }

  function isDone(n) { return state.completed.indexOf(n) > -1; }

  function statusOf(n) {
    if (isDone(n)) return 'done';
    if (!hasActive()) return 'locked';
    if (n === currentDay()) return 'today';
    if (n < currentDay()) return 'missed';
    return 'locked';
  }

  function countNotes(notes) {
    return Object.keys(notes || {}).filter(function (k) { return notes[k]; }).length;
  }

  function streak() {
    const d = currentDay();
    let n = 0;
    let i = isDone(d) ? d : d - 1;
    while (i >= 1 && isDone(i)) { n++; i--; }
    return n;
  }

  function bestStreakFor(list) {
    const set = {};
    (list || []).forEach(function (n) { set[n] = true; });
    let best = 0, run = 0;
    for (let i = 1; i <= 21; i++) {
      if (set[i]) { run++; best = Math.max(best, run); } else { run = 0; }
    }
    return best;
  }

  function xpFor(list) {
    const set = {};
    (list || []).forEach(function (n) { set[n] = true; });
    let total = 0;
    for (let i = 1; i <= 21; i++) {
      if (set[i]) total += 60 + (set[i - 1] ? 20 : 0);
    }
    if (set[7]) total += 50;
    if (set[14]) total += 100;
    if (set[21]) total += 200;
    return total;
  }

  function xp() { return xpFor(state.completed); }

  function missedDays() {
    if (!hasActive()) return 0;
    let count = 0;
    for (let i = 1; i < currentDay(); i++) if (!isDone(i)) count++;
    return count;
  }

  const LEVELS = [
    { n: 1, name: 'Rookie', at: 0 },
    { n: 2, name: 'Regular', at: 200 },
    { n: 3, name: 'Steady', at: 450 },
    { n: 4, name: 'Veteran', at: 800 },
    { n: 5, name: 'Life Member', at: 1300 },
  ];

  function levelInfo() {
    const points = xp();
    let current = LEVELS[0];
    let next = null;
    for (let i = 0; i < LEVELS.length; i++) {
      if (points >= LEVELS[i].at) current = LEVELS[i];
      else { next = LEVELS[i]; break; }
    }
    const floor = current.at;
    const ceil = next ? next.at : current.at + 500;
    const pct = Math.round(((points - floor) / (ceil - floor)) * 100);
    return { current, next, pct: clamp(pct, 0, 100), points, label: 'Level ' + current.n + ' · ' + current.name };
  }

  function makeCustomChallenge() {
    const goal = state.customGoal || 'my thing';
    const task = state.customTask || '';
    return {
      id: 'custom',
      categoryId: 'custom',
      name: goal,
      tagline: task || ('21 days of ' + goal),
      description: task
        ? task + ' Every day for 21 days, in a version small enough to repeat.'
        : 'Twenty-one days of ' + goal + '. Made up as you go.',
      color: '#E3A11C',
      colorSoft: 'rgba(227,161,28,.18)',
      icon: 'spark',
      kicker: 'For you',
      minutes: state.minutes || 20,
      difficulty: state.difficulty || 'Easy',
      targetHint: 'optional daily note',
      benefits: [
        'Built around something you actually care about',
        'You choose the size of the daily step',
        'A simple record of 21 days of trying',
      ],
      instructions: task || 'Do the smallest version of ' + goal + ' today. Small enough that a bad day cannot stop you.',
      tasks: DATA.customTasks(goal, state.minutes || 20),
    };
  }

  function challenge() {
    const key = state.challengeKey || state.challengeId;
    if (!key) return null;
    if (key === 'custom') return makeCustomChallenge();
    return DATA.getProgram(key) || null;
  }

  function hasActive() {
    return !!(state.startDate && challenge());
  }

  function displayName(c) {
    return c ? c.name : '';
  }

  function taskFor(day) {
    const c = challenge();
    if (!c) return { title: 'Choose a challenge', blurb: 'Pick a category on Home to start your first 21 days.' };
    const list = c.tasks && c.tasks.length ? c.tasks : DATA.customTasks(c.name, state.minutes);
    const t = list[clamp(day - 1, 0, list.length - 1)] || ['Show up today', 'One small action is enough.'];
    return { title: t[0], blurb: t[1] };
  }

  function stepsFor(day) {
    const t = taskFor(day);
    return [
      { title: 'Warm up', sub: 'Two minutes to clear the runway.', time: Math.max(1, Math.round(state.minutes * 0.15)) },
      { title: t.title, sub: t.blurb, time: Math.max(3, Math.round(state.minutes * 0.7)) },
      { title: 'Log the receipt', sub: 'Tick it off and drop one honest line.', time: 1 },
    ];
  }

  function metrics() {
    const done = state.completed.length;
    const noteCount = countNotes(state.notes);
    return {
      day: currentDay(),
      done: done,
      pct: Math.round((done / 21) * 100),
      streak: streak(),
      bestStreak: bestStreakFor(state.completed),
      xp: xp(),
      minutes: done * state.minutes,
      notes: noteCount,
      timeOfDay: state.timeOfDay,
      level: levelInfo(),
      missed: missedDays(),
    };
  }

  function allTimeXp() {
    return state.history.reduce(function (sum, r) { return sum + (r.xp || 0); }, 0) + xp();
  }

  function allTimeDays() {
    return state.history.reduce(function (sum, r) { return sum + ((r.completed || []).length); }, 0) + state.completed.length;
  }

  function findHistory(id) {
    return state.history.find(function (r) { return r.id === id; }) || null;
  }

  function archiveCurrent() {
    const c = challenge();
    if (!c) return null;
    const record = {
      id: (state.challengeKey || 'challenge') + '-' + Date.now(),
      key: state.challengeKey || state.challengeId,
      categoryId: c.categoryId || state.categoryId,
      name: displayName(c),
      tagline: c.tagline,
      color: c.color || '#E8451F',
      icon: c.icon || 'spark',
      difficulty: c.difficulty || state.difficulty,
      minutes: state.minutes,
      dailyTarget: state.dailyTarget || '',
      startDate: state.startDate,
      completedAt: iso(today()),
      completed: state.completed.slice(),
      notes: clone(state.notes),
      xp: xp(),
      bestStreak: bestStreakFor(state.completed),
    };
    state.history.unshift(record);

    state.challengeId = null;
    state.challengeKey = null;
    state.categoryId = null;
    state.challengeName = '';
    state.challengeTagline = '';
    state.customGoal = '';
    state.customTask = '';
    state.difficulty = '';
    state.startDate = null;
    state.completed = [];
    state.notes = {};
    state.dailyTarget = '';
    save();
    return record;
  }

  function quote() {
    return DATA.quotes[(currentDay() - 1) % DATA.quotes.length];
  }

  function badgeList() {
    const m = metrics();
    return DATA.badges.map(function (b) {
      return Object.assign({}, b, { unlocked: b.test(m) });
    });
  }

  function weekdayShort(n) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayDate(n).getDay()];
  }

  function weekdayLetter(n) {
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayDate(n).getDay()];
  }

  function formatDate(d, opts) {
    return d.toLocaleDateString('en-US', opts || { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function formatLongDate(d) {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function formatShortDate(d) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatRange(a, b) {
    return formatShortDate(parseISO(a)) + ' – ' + formatShortDate(parseISO(b));
  }

  const TIME_LABELS = {
    sunrise: { label: 'Sunrise', window: '6 – 9 am', icon: 'sunrise' },
    midday: { label: 'Midday', window: '12 – 2 pm', icon: 'sun' },
    sunset: { label: 'Sunset', window: '5 – 8 pm', icon: 'sunset' },
    moon: { label: 'Moonlight', window: '9 – 11 pm', icon: 'moon' },
  };

  function timeLabel() {
    return TIME_LABELS[state.timeOfDay] || TIME_LABELS.sunrise;
  }

  function timeOfDayFor(time) {
    const hour = parseInt(String(time || '08:00').split(':')[0], 10);
    if (hour < 10) return 'sunrise';
    if (hour < 15) return 'midday';
    if (hour < 19) return 'sunset';
    return 'moon';
  }

  function reminderLabelFor(time) {
    const parts = String(time || '08:00').split(':');
    const hour = parseInt(parts[0], 10);
    const minute = parts[1] || '00';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return h12 + ':' + minute + ' ' + suffix;
  }

  function reminderLabel() {
    return reminderLabelFor(state.reminderTime);
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return 'Late night';
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    if (h < 21) return 'Evening';
    return 'Tonight';
  }

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------- icons -------------------------------- */

  const ICONS = {
    bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" stroke="none"/>',
    flame: '<path d="M12 2.5c1.2 4 5.6 5 5.6 9.1a5.6 5.6 0 0 1-11.2 0c0-2.3 1.1-3.7 2.3-4.9 0 2.1 1 3.3 2.3 3.3 0-3-.5-5 .9-7.5Z" fill="currentColor" stroke="none"/>',
    spark: '<path d="M12 2.5l2.6 6.9 6.9 2.6-6.9 2.6L12 21.5l-2.6-6.9L2.5 12l6.9-2.6L12 2.5Z" fill="currentColor" stroke="none"/>',
    star: '<path d="M12 3.2l2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.3 6.1-.9L12 3.2Z"/>',
    check: '<path d="m5 12.5 4.2 4.2L19 6.8"/>',
    arrow: '<path d="M4 12h15M13 5.5 19.5 12 13 18.5"/>',
    back: '<path d="M20 12H5M11 5.5 4.5 12 11 18.5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    chev: '<path d="m9 5.5 6.5 6.5L9 18.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>',
    bell: '<path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 6.5-2.5 8h17c0-1.5-2.5-2-2.5-8Z"/><path d="M9.5 20a2.5 2.5 0 0 0 5 0"/>',
    sound: '<path d="M4 9.5v5h3l4 3.5v-12l-4 3.5H4Z"/><path d="M15 8.5a5 5 0 0 1 0 7M17.5 6a8.5 8.5 0 0 1 0 12"/>',
    wave: '<path d="M2.5 12c1.8-4 3.6-4 5.4 0s3.6 4 5.4 0 3.6-4 5.4 0 2.4 2 3.8 1"/>',
    reset: '<path d="M3.5 11a8.5 8.5 0 1 0 2.8-6.1L3 8"/><path d="M3 3.5V8h4.5"/>',
    share: '<circle cx="18" cy="5.5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="m8.4 10.7 7.2-3.9M8.4 13.3l7.2 3.9"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    play: '<path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="7" y="5" width="3.5" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="3.5" height="14" rx="1.2" fill="currentColor" stroke="none"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 5H4.5v2a4 4 0 0 0 4 4M16 5h3.5v2a4 4 0 0 1-4 4"/><path d="M12 13v4M8.5 20h7M9.5 17h5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"/>',
    sunrise: '<path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 3v3M4.8 7.8l2 2M19.2 7.8l-2 2M2 21h20"/>',
    sunset: '<path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 3v4M4.8 8.8l2 2M19.2 8.8l-2 2M2 21h20"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>',
    lotus: '<path d="M12 20c-4.2 0-7-2.4-7.5-6 2.6.2 4.4 1.2 5.6 3-.4-3.2.3-5.8 1.9-8 1.6 2.2 2.3 4.8 1.9 8 1.2-1.8 3-2.8 5.6-3-.5 3.6-3.3 6-7.5 6Z"/><path d="M4 8.5c2.4 0 4.3.9 5.5 2.6M20 8.5c-2.4 0-4.3.9-5.5 2.6"/>',
    brush: '<path d="M14.5 4.5 19 9 9.5 18.5 4 20l1.5-5.5 9-10Z"/><path d="m12.5 6.5 4.5 4.5"/>',
    book: '<path d="M4 5.5C6.5 4 9.5 4 12 5.5 14.5 4 17.5 4 20 5.5V19c-2.5-1.5-5.5-1.5-8 0-2.5-1.5-5.5-1.5-8 0V5.5Z"/><path d="M12 5.5V19"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.6-3.8 3.6-6 7.5-6s6.9 2.2 7.5 6"/>',
    home: '<path d="M3.5 11 12 4l8.5 7v8.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V11Z"/><path d="M9 20.5V14h6v6.5"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18h6a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H15"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    note: '<path d="M6 3.5h9.5L20 8v12.5H6V3.5Z"/><path d="M15 3.5V8h4.5M9 12h6M9 15.5h4"/>',
    heart: '<path d="M12 20.5S3.5 15 3.5 8.8A4.3 4.3 0 0 1 12 6a4.3 4.3 0 0 1 8.5 2.8c0 6.2-8.5 11.7-8.5 11.7Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M12 3v12M7 10.5l5 5 5-5"/><path d="M4 20h16"/>',
    upload: '<path d="M12 16V4M7 8.5l5-5 5 5"/><path d="M4 20h16"/>',
  };

  function icon(name, size) {
    size = size || 18;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.spark) + '</svg>';
  }

  /* ------------------------------ effects ------------------------------- */

  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  const app = document.getElementById('app');
  const COLORS = ['#E8451F', '#2F49D1', '#E3A11C', '#5C7F68', '#181510', '#FBF5E8'];
  let particles = [];
  let rafId = null;
  let dpr = 1;

  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = app.clientWidth * dpr;
    canvas.height = app.clientHeight * dpr;
    canvas.style.width = app.clientWidth + 'px';
    canvas.style.height = app.clientHeight + 'px';
  }

  function drawStar(c, r) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.45;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const x = Math.cos(a) * rad;
      const y = Math.sin(a) * rad;
      if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.closePath();
  }

  function loop() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, app.clientWidth, app.clientHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 0.16;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 1;
      if (p.life <= 0 || p.y > app.clientHeight + 40) particles.splice(i, 1);
      else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, p.life / 25);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        else if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2); ctx.fill(); }
        else { drawStar(ctx, p.size / 1.7); ctx.fill(); }
        ctx.restore();
      }
    }
    if (particles.length) rafId = requestAnimationFrame(loop);
    else { rafId = null; ctx.clearRect(0, 0, app.clientWidth, app.clientHeight); }
  }

  function burst(opts) {
    if (!state.motion) return;
    opts = opts || {};
    const w = app.clientWidth;
    const h = app.clientHeight;
    const x = opts.x != null ? opts.x : w / 2;
    const y = opts.y != null ? opts.y : h * 0.42;
    const count = opts.count || 90;
    const power = opts.power || 1;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = (2 + Math.random() * 9) * power;
      particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 4.5 * power,
        size: 6 + Math.random() * 11,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 70 + Math.random() * 50,
        shape: ['rect', 'circle', 'star'][Math.floor(Math.random() * 3)],
      });
    }
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  function clearConfetti() {
    particles = [];
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    ctx.clearRect(0, 0, app.clientWidth, app.clientHeight);
  }

  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();

  /* ------------------------------- sound -------------------------------- */

  let audioCtx = null;

  function chime(kind) {
    if (!state.sound) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const t = audioCtx.currentTime;
      const notes = kind === 'finish' ? [523, 659, 784, 1047, 1319] : [523, 659, 784, 1047];
      notes.forEach(function (f, i) {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        o.connect(g);
        g.connect(audioCtx.destination);
        const at = t + i * 0.075;
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.09, at + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.4);
        o.start(at);
        o.stop(at + 0.45);
      });
    } catch (e) {}
  }

  function buzz(ms) {
    if (navigator.vibrate) navigator.vibrate(ms || 12);
  }

  /* ------------------------------- toast -------------------------------- */

  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function toast(message, iconName) {
    toastEl.innerHTML = (iconName ? icon(iconName, 15) : '') + '<span>' + esc(message) + '</span>';
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2800);
  }

  return {
    DATA: DATA,
    LEVELS: LEVELS,
    TIME_LABELS: TIME_LABELS,
    get state() { return state; },
    set state(v) { state = v; },
    get resetArmed() { return resetArmed; },
    set resetArmed(v) { resetArmed = v; },
    get abandonArmed() { return abandonArmed; },
    set abandonArmed(v) { abandonArmed = v; },
    save: save,
    replaceState: replaceState,
    reset: reset,
    normalizeState: normalizeState,
    today: today,
    iso: iso,
    parseISO: parseISO,
    startDate: startDate,
    dayDate: dayDate,
    currentDay: currentDay,
    isDone: isDone,
    statusOf: statusOf,
    challenge: challenge,
    hasActive: hasActive,
    displayName: displayName,
    taskFor: taskFor,
    stepsFor: stepsFor,
    metrics: metrics,
    quote: quote,
    badgeList: badgeList,
    levelInfo: levelInfo,
    timeLabel: timeLabel,
    timeOfDayFor: timeOfDayFor,
    reminderLabel: reminderLabel,
    reminderLabelFor: reminderLabelFor,
    greeting: greeting,
    weekdayShort: weekdayShort,
    weekdayLetter: weekdayLetter,
    formatDate: formatDate,
    formatLongDate: formatLongDate,
    formatShortDate: formatShortDate,
    formatRange: formatRange,
    missedDays: missedDays,
    countNotes: countNotes,
    xpFor: xpFor,
    bestStreakFor: bestStreakFor,
    allTimeXp: allTimeXp,
    allTimeDays: allTimeDays,
    findHistory: findHistory,
    archiveCurrent: archiveCurrent,
    esc: esc,
    icon: icon,
    burst: burst,
    clearConfetti: clearConfetti,
    chime: chime,
    buzz: buzz,
    toast: toast,
  };
})();
