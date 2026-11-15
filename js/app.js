/* FLARE — router, interactions, timers, hold-to-complete */
(function () {
  const A = window.App;
  const S = window.S;
  const view = document.getElementById('view');
  const nav = document.getElementById('nav');
  const app = document.getElementById('app');
  const overlay = document.getElementById('overlay');

  const NAV_SCREENS = { home: 1, journey: 1, stats: 1, you: 1 };

  let screen = 'welcome';
  let setup = { step: 1, draft: null, returnTo: 'welcome' };
  let questDay = null;
  let checks = [false, false, false];
  let justCompleted = null;
  let finalePreview = false;
  let timer = { secs: 0, total: 0, running: false, id: null, day: null };
  let resetTimerId = null;

  /* ------------------------------- boot -------------------------------- */

  function boot() {
    if (location.hash === '#demo' && !A.state.onboarded) seedDemo();
    screen = A.state.onboarded ? 'home' : 'welcome';
    document.body.classList.toggle('reduce', !A.state.motion);
    render();
  }

  function activeNav() {
    return screen === 'quest' ? 'home' : screen;
  }

  function render() {
    if (!setup.draft) makeDraft(null);
    view.innerHTML = markup();
    nav.innerHTML = S.nav(activeNav());
    nav.hidden = !NAV_SCREENS[screen];
    app.classList.toggle('nonav', !NAV_SCREENS[screen]);
    document.body.classList.toggle('reduce', !A.state.motion);
    if (screen === 'setup') updateNext();

    if (screen === 'quest') {
      bindHold();
      updateCheckUI();
      renderTimer();
    }

    if (justCompleted) {
      const info = justCompleted;
      justCompleted = null;
      overlay.innerHTML = S.celebrate(info.day, info.gain);
      requestAnimationFrame(function () {
        A.burst({ count: 120, power: 1.15, y: app.clientHeight * 0.46 });
      });
    } else {
      overlay.innerHTML = '';
    }

    if (screen === 'finale') {
      requestAnimationFrame(function () {
        A.burst({ count: 140, power: 1.2, y: app.clientHeight * 0.34 });
      });
    }
  }

  function markup() {
    switch (screen) {
      case 'welcome': return S.welcome();
      case 'setup': return S.setup(setup.step, setup.draft);
      case 'journey': return S.journey();
      case 'stats': return S.stats();
      case 'you': return S.you();
      case 'quest': return S.quest(questDay);
      case 'finale': return S.finale(finalePreview);
      case 'home':
      default: return S.home();
    }
  }

  function navigate(name) {
    if (name === screen && name !== 'quest') return;
    if (name === 'finale') finalePreview = false;
    screen = name;
    view.scrollTop = 0;
    if (name !== 'quest') stopTimer();
    if (name !== 'finale') finalePreview = false;
    render();
  }

  /* ------------------------------- setup ------------------------------- */

  function makeDraft(existing) {
    const st = A.state;
    setup.draft = {
      challengeId: existing ? st.challengeId || null : null,
      customGoal: existing ? st.customGoal || '' : '',
      minutes: existing ? st.minutes || 20 : 20,
      timeOfDay: existing ? st.timeOfDay || 'sunrise' : 'sunrise',
      reminder: existing ? st.reminder !== false : true,
      name: existing ? st.name || '' : '',
    };
  }

  function startSetup(existing) {
    makeDraft(existing);
    setup.step = 1;
    setup.returnTo = existing ? 'you' : 'welcome';
    finalePreview = false;
    screen = 'setup';
    view.scrollTop = 0;
    render();
  }

  function validStep() {
    if (setup.step !== 1) return true;
    const d = setup.draft;
    if (!d.challengeId) return false;
    if (d.challengeId === 'custom' && d.customGoal.trim().length < 2) return false;
    return true;
  }

  function updateNext() {
    const btn = view.querySelector('[data-act="step-next"]');
    if (btn) btn.disabled = !validStep();
  }

  function lockIn() {
    const d = setup.draft;
    const st = A.state;
    st.onboarded = true;
    st.name = (d.name || '').trim();
    st.challengeId = d.challengeId;
    st.customGoal = d.challengeId === 'custom' ? d.customGoal.trim() : '';
    st.minutes = d.minutes;
    st.timeOfDay = d.timeOfDay;
    st.reminder = d.reminder;
    st.startDate = A.iso(A.today());
    st.completed = [];
    st.notes = {};
    A.save();
    screen = 'home';
    view.scrollTop = 0;
    render();
    A.chime('done');
    A.buzz([18, 40, 18]);
    A.burst({ count: 110, power: 1.05, y: app.clientHeight * 0.4 });
    A.toast('Twenty-one days starts now', 'spark');
  }

  /* ------------------------------- demo -------------------------------- */

  function seedDemo() {
    const st = A.state;
    st.onboarded = true;
    st.name = 'Aarav';
    st.challengeId = 'move';
    st.customGoal = '';
    st.minutes = 20;
    st.timeOfDay = 'sunrise';
    st.reminder = true;
    st.startDate = A.iso(new Date(A.today().getTime() - 5 * 86400000));
    st.completed = [1, 2, 3, 5];
    st.notes = { 3: 'Felt lighter after the walk. Weirdly proud.' };
    A.save();
  }

  function demo() {
    seedDemo();
    screen = 'home';
    view.scrollTop = 0;
    render();
    A.toast('Demo mode — five days in', 'spark');
  }

  /* -------------------------------- quest ------------------------------ */

  function openDay(n) {
    if (!n) return;
    if (n > A.currentDay()) {
      A.toast('Day ' + n + ' unlocks when you get there', 'lock');
      return;
    }
    questDay = n;
    checks = [false, false, false];
    resetTimerState(n);
    screen = 'quest';
    view.scrollTop = 0;
    render();
  }

  function resetTimerState(day) {
    clearInterval(timer.id);
    timer.id = null;
    timer.running = false;
    timer.day = day;
    timer.total = A.state.minutes * 60;
    timer.secs = timer.total;
  }

  function startTimer() {
    if (!timer.day) resetTimerState(questDay);
    if (timer.running) return;
    if (timer.secs <= 0) timer.secs = timer.total;
    timer.running = true;
    timer.id = setInterval(tick, 1000);
    renderTimer();
  }

  function pauseTimer() {
    timer.running = false;
    clearInterval(timer.id);
    timer.id = null;
    renderTimer();
  }

  function stopTimer() {
    timer.running = false;
    clearInterval(timer.id);
    timer.id = null;
  }

  function tick() {
    timer.secs = Math.max(0, timer.secs - 1);
    if (timer.secs === 0) {
      pauseTimer();
      A.chime('done');
      A.toast('Time. Nice focus.', 'clock');
    }
    renderTimer();
  }

  function renderTimer() {
    const time = document.getElementById('timerTime');
    if (time) time.textContent = fmt(timer.secs || 0);
    const btn = document.getElementById('timerToggle');
    if (btn) {
      btn.innerHTML = A.icon(timer.running ? 'pause' : 'play', 15);
      btn.setAttribute('aria-label', timer.running ? 'Pause timer' : 'Start timer');
    }
  }

  function fmt(secs) {
    return String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');
  }

  function allChecked() {
    return checks.every(Boolean);
  }

  function updateCheckUI() {
    const count = checks.filter(Boolean).length;
    const prog = document.getElementById('checkProgress');
    if (prog) {
      prog.textContent = count + ' / 3';
      prog.classList.toggle('all', count === 3);
    }
    const hint = document.getElementById('holdHint');
    if (hint) {
      hint.textContent = count === 3
        ? 'Now hold for 1 second — make it official'
        : 'Check all 3 steps, then hold for 1 second';
    }
    const hold = document.getElementById('holdBtn');
    if (hold) hold.classList.toggle('ready', count === 3);
  }

  function toggleCheck(i) {
    if (i < 0 || i > 2) return;
    checks[i] = !checks[i];
    const rows = view.querySelectorAll('[data-check]');
    if (rows[i]) {
      rows[i].classList.toggle('on', checks[i]);
      rows[i].setAttribute('aria-pressed', checks[i] ? 'true' : 'false');
    }
    updateCheckUI();
    A.buzz(8);
  }

  function bindHold() {
    const el = document.getElementById('holdBtn');
    if (!el) return;
    let rafId = null;
    let start = 0;
    let active = false;
    const DUR = 1000;

    function frame() {
      const p = Math.min(1, (performance.now() - start) / DUR);
      el.style.setProperty('--p', p.toFixed(3));
      if (p >= 1) {
        cleanup();
        el.classList.add('done');
        el.style.setProperty('--p', '1');
        completeDay(questDay);
      } else {
        rafId = requestAnimationFrame(frame);
      }
    }

    function cleanup() {
      active = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      el.classList.remove('holding');
    }

    function down(e) {
      if (el.dataset.done === '1') return;
      if (!allChecked()) {
        A.toast('Check all 3 steps first', 'check');
        A.buzz(24);
        return;
      }
      e.preventDefault();
      active = true;
      start = performance.now();
      el.classList.add('holding');
      el.style.setProperty('--p', '0.001');
      A.buzz(10);
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      frame();
    }

    function up() {
      if (!active) return;
      cleanup();
      el.style.setProperty('--p', '0');
    }

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    el.addEventListener('keydown', function (e) {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      if (e.repeat) return;
      down(e);
    });
    el.addEventListener('keyup', function (e) {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      up();
    });
  }

  function completeDay(day) {
    if (!day || A.isDone(day)) return;
    const before = A.metrics().xp;
    const noteEl = document.getElementById('questNote');
    const note = noteEl ? noteEl.value.trim() : (A.state.notes[day] || '');
    if (note) A.state.notes[day] = note;
    else delete A.state.notes[day];

    A.state.completed.push(day);
    A.state.completed.sort(function (a, b) { return a - b; });
    A.save();
    const gain = A.metrics().xp - before;

    stopTimer();
    A.chime('done');
    A.buzz([20, 45, 30]);
    justCompleted = { day: day, gain: gain };
    render();
  }

  /* ------------------------------ actions ------------------------------ */

  function handleAction(act, el) {
    switch (act) {
      case 'start':
        startSetup(null);
        break;
      case 'demo':
        demo();
        break;
      case 'exit-setup':
        screen = setup.returnTo || 'welcome';
        view.scrollTop = 0;
        render();
        break;
      case 'step-back':
        if (setup.step > 1) {
          setup.step--;
          view.scrollTop = 0;
          render();
        } else {
          screen = setup.returnTo || 'welcome';
          view.scrollTop = 0;
          render();
        }
        break;
      case 'step-next':
        if (!validStep()) {
          A.toast('Pick your challenge first', 'spark');
          return;
        }
        if (setup.step < 4) {
          setup.step++;
          view.scrollTop = 0;
          render();
        } else {
          lockIn();
        }
        break;
      case 'pick': {
        const id = el.dataset.id;
        setup.draft.challengeId = id;
        view.querySelectorAll('[data-pick]').forEach(function (p) {
          p.classList.toggle('sel', p.dataset.id === id);
        });
        const field = document.getElementById('customField');
        if (field) field.classList.toggle('hide', id !== 'custom');
        if (id === 'custom') {
          setTimeout(function () {
            const input = document.getElementById('customGoal');
            if (input) input.focus();
          }, 60);
        }
        updateNext();
        A.buzz(6);
        break;
      }
      case 'preset':
        setMinutes(parseInt(el.dataset.min, 10));
        break;
      case 'time': {
        setup.draft.timeOfDay = el.dataset.time;
        view.querySelectorAll('[data-time]').forEach(function (t) {
          t.classList.toggle('sel', t.dataset.time === setup.draft.timeOfDay);
        });
        A.buzz(6);
        break;
      }
      case 'toggle-reminder':
        setup.draft.reminder = !setup.draft.reminder;
        el.setAttribute('aria-pressed', setup.draft.reminder ? 'true' : 'false');
        break;
      case 'jump-today': {
        const row = view.querySelector('.day-row[data-open-day="' + A.currentDay() + '"]');
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
      case 'celebrate-close':
        overlay.innerHTML = '';
        navigate('home');
        break;
      case 'celebrate-journey':
        overlay.innerHTML = '';
        navigate('journey');
        break;
      case 'share':
        A.burst({ count: 70, power: 0.9, y: app.clientHeight * 0.45 });
        A.toast('Story card saved to your highlights ✦', 'share');
        break;
      case 'change-goal':
        startSetup(A.state);
        break;
      case 'preview-finale':
        finalePreview = true;
        screen = 'finale';
        view.scrollTop = 0;
        render();
        break;
      case 'close-finale':
        finalePreview = false;
        screen = 'home';
        view.scrollTop = 0;
        render();
        break;
      case 'go-finale':
        finalePreview = false;
        screen = 'finale';
        view.scrollTop = 0;
        render();
        break;
      case 'new-challenge':
        finalePreview = false;
        startSetup(null);
        break;
      case 'next-day':
        skipDay();
        break;
      case 'reset':
        if (A.resetArmed) {
          clearTimeout(resetTimerId);
          stopTimer();
          A.reset();
          screen = 'welcome';
          view.scrollTop = 0;
          render();
          A.toast('Clean slate. Fresh spark.', 'spark');
        } else {
          A.resetArmed = true;
          render();
          A.toast('Tap reset again to erase everything', 'close');
          clearTimeout(resetTimerId);
          resetTimerId = setTimeout(function () {
            A.resetArmed = false;
            if (screen === 'you') render();
          }, 4500);
        }
        break;
      case 'timer-toggle':
        if (timer.running) pauseTimer();
        else startTimer();
        break;
      case 'timer-reset':
        pauseTimer();
        timer.secs = timer.total;
        renderTimer();
        break;
      default:
        break;
    }
  }

  function setMinutes(min) {
    setup.draft.minutes = min;
    const range = document.getElementById('minutesRange');
    if (range) {
      range.value = min;
      range.style.setProperty('--fill', ((min - 5) / 55) * 100 + '%');
    }
    const num = document.getElementById('minutesNum');
    if (num) num.textContent = min;
    const vibe = document.getElementById('vibeLabel');
    if (vibe) vibe.textContent = S.vibe(min);
    const note = document.getElementById('timeNote');
    if (note) {
      const hrs = ((min * 21) / 60).toFixed(1).replace('.0', '');
      note.innerHTML = A.icon('clock', 17) + '<span><b>' + hrs + ' hours</b> of showing up over 21 days. Small price for a new default.</span>';
    }
    view.querySelectorAll('[data-act="preset"]').forEach(function (p) {
      p.classList.toggle('sel', parseInt(p.dataset.min, 10) === min);
    });
    A.buzz(5);
  }

  function skipDay() {
    const st = A.state;
    if (!st.startDate) return;
    if (A.currentDay() >= 21) {
      A.toast('Already at the finish line', 'trophy');
      return;
    }
    const d = A.parseISO(st.startDate);
    d.setDate(d.getDate() - 1);
    st.startDate = A.iso(d);
    A.save();
    A.toast('Fast-forwarded to day ' + A.currentDay(), 'clock');
    render();
  }

  /* ------------------------------- events ------------------------------ */

  view.addEventListener('click', function (e) {
    const go = e.target.closest('[data-go]');
    if (go) { navigate(go.dataset.go); return; }

    const open = e.target.closest('[data-open-day]');
    if (open) { openDay(parseInt(open.dataset.openDay, 10)); return; }

    const check = e.target.closest('[data-check]');
    if (check) { toggleCheck(parseInt(check.dataset.check, 10)); return; }

    const toggle = e.target.closest('[data-toggle]');
    if (toggle) {
      const key = toggle.dataset.toggle;
      A.state[key] = !A.state[key];
      A.save();
      toggle.setAttribute('aria-pressed', A.state[key] ? 'true' : 'false');
      document.body.classList.toggle('reduce', !A.state.motion);
      if (key === 'motion' && !A.state.motion) A.toast('Motion turned way down', 'wave');
      return;
    }

    const act = e.target.closest('[data-act]');
    if (act) handleAction(act.dataset.act, act);
  });

  overlay.addEventListener('click', function (e) {
    const act = e.target.closest('[data-act]');
    if (act) handleAction(act.dataset.act, act);
  });

  nav.addEventListener('click', function (e) {
    const go = e.target.closest('[data-go]');
    if (go) navigate(go.dataset.go);
  });

  view.addEventListener('input', function (e) {
    const id = e.target.id;
    if (id === 'minutesRange') {
      setMinutes(parseInt(e.target.value, 10));
    } else if (id === 'customGoal') {
      setup.draft.customGoal = e.target.value;
      updateNext();
    } else if (id === 'nameInput') {
      setup.draft.name = e.target.value;
    } else if (id === 'questNote' && questDay) {
      const value = e.target.value.trim();
      if (value) A.state.notes[questDay] = value;
      else delete A.state.notes[questDay];
      A.save();
    }
  });

  view.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const row = e.target.closest('.day-row[data-open-day]');
    if (row) {
      e.preventDefault();
      openDay(parseInt(row.dataset.openDay, 10));
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (overlay.innerHTML) overlay.innerHTML = '';
    }
  });

  boot();
})();
