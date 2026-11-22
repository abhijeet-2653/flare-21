/* FLARE — router, interactions, timers, completion */
(function () {
  const A = window.App;
  const S = window.S;
  const view = document.getElementById('view');
  const nav = document.getElementById('nav');
  const app = document.getElementById('app');
  const overlay = document.getElementById('overlay');

  const NAV_SCREENS = { home: 1, achievements: 1, profile: 1 };

  let screen = 'home';
  const route = { categoryId: null, programId: null, historyId: null, day: null };
  let setupProgram = null;
  let setupDraft = null;
  let setupStep = 1;
  let setupReturn = 'home';
  let customDraft = null;
  let questReturn = 'home';
  let justCompleted = null;
  let lastRecordId = null;
  let resetTimerId = null;
  let abandonTimerId = null;
  let timer = { secs: 0, total: 0, running: false, id: null, day: null };

  /* ------------------------------- boot -------------------------------- */

  function boot() {
    if (A.hasActive() && A.state.completed.length >= 21) {
      A.archiveCurrent();
    }
    document.body.classList.toggle('reduce', !A.state.motion);
    screen = 'home';
    render();
    syncReminders({ requestPermission: false });
  }

  function activeNav() {
    if (screen === 'home') return 'home';
    if (screen === 'achievements') return 'achievements';
    if (screen === 'profile') return 'profile';
    return '';
  }

  function render() {
    view.innerHTML = markup();
    nav.innerHTML = S.nav(activeNav());
    nav.hidden = !NAV_SCREENS[screen];
    app.classList.toggle('nonav', !NAV_SCREENS[screen]);
    document.body.classList.toggle('reduce', !A.state.motion);

    if (screen === 'quest') renderTimer();

    if (justCompleted) {
      const info = justCompleted;
      justCompleted = null;
      if (info.recordId) lastRecordId = info.recordId;
      overlay.innerHTML = S.celebrate(info.day, info.gain, info.final, info.recordId);
      requestAnimationFrame(function () {
        A.burst({ count: info.final ? 140 : 110, power: info.final ? 1.2 : 1.05, y: app.clientHeight * 0.44 });
      });
    } else if (screen === 'complete') {
      /* The certificate screen already carries its own print texture; keep it readable. */
      overlay.innerHTML = '';
    } else {
      overlay.innerHTML = '';
    }
  }

  function markup() {
    switch (screen) {
      case 'explore': return S.explore(route.categoryId);
      case 'detail': {
        const p = A.DATA.getProgram(route.programId);
        return p ? S.detail(p) : S.home();
      }
      case 'custom':
        if (!customDraft) customDraft = { name: '', task: '', minutes: 20, difficulty: 'Easy' };
        return S.custom(customDraft);
      case 'setup': return (setupDraft && setupProgram) ? S.setup(setupStep, setupDraft, setupProgram) : S.home();
      case 'quest': return S.quest(route.day);
      case 'journey': return S.journey();
      case 'achievements': return S.achievements();
      case 'profile': return S.profile();
      case 'complete': return S.complete(A.findHistory(route.historyId));
      case 'home':
      default: return S.home();
    }
  }

  function navigate(name, opts) {
    opts = opts || {};
    if (name !== 'quest') stopTimer();
    screen = name;
    if (name === 'explore' && opts.categoryId) route.categoryId = opts.categoryId;
    if (name === 'detail' && opts.programId) route.programId = opts.programId;
    if (name === 'complete' && opts.historyId) route.historyId = opts.historyId;
    view.scrollTop = 0;
    render();
  }

  function back() {
    if (screen === 'quest') { navigate(questReturn || 'home'); return; }
    if (screen === 'setup') {
      if (setupStep > 1) {
        setupStep = 1;
        view.scrollTop = 0;
        render();
      } else if (setupReturn === 'custom') {
        navigate('custom');
      } else if (setupReturn === 'detail' && setupProgram && setupProgram.id !== 'custom') {
        route.categoryId = setupProgram.categoryId;
        route.programId = setupProgram.id;
        navigate('detail', { programId: setupProgram.id });
      } else {
        navigate('home');
      }
      return;
    }
    if (screen === 'detail') {
      const p = A.DATA.getProgram(route.programId);
      navigate('explore', { categoryId: p ? p.categoryId : route.categoryId });
      return;
    }
    if (screen === 'explore' || screen === 'custom' || screen === 'journey' || screen === 'complete') {
      navigate('home');
      return;
    }
    if (screen === 'achievements' || screen === 'profile') {
      navigate('home');
      return;
    }
    if (screen === 'home') return;
  }

  /* --------------------------- challenge flows -------------------------- */

  function openDay(n) {
    if (!A.hasActive()) {
      A.toast('Start a challenge first', 'spark');
      return;
    }
    if (!n) n = A.currentDay();
    if (n > A.currentDay()) {
      A.toast('Day ' + n + ' unlocks on ' + A.formatDate(A.dayDate(n), { month: 'short', day: 'numeric' }), 'lock');
      return;
    }
    questReturn = screen === 'journey' ? 'journey' : 'home';
    route.day = n;
    stopTimer();
    resetTimerState(n);
    screen = 'quest';
    view.scrollTop = 0;
    render();
  }

  function openSetup(program, opts) {
    if (!program) return;
    if (A.hasActive()) {
      A.toast('One challenge at a time. Finish it or leave it from Profile.', 'lock');
      navigate('home');
      return;
    }
    opts = opts || {};
    setupProgram = program;
    setupStep = 1;
    setupReturn = opts.returnTo || 'home';
    setupDraft = {
      key: program.id,
      categoryId: program.categoryId,
      name: A.state.name || '',
      startDate: A.iso(A.today()),
      dailyTarget: opts.dailyTarget || '',
      reminder: A.state.reminder !== false,
      reminderTime: A.state.reminderTime || '08:00',
      minutes: program.minutes || A.state.minutes || 20,
      difficulty: program.difficulty || 'Easy',
      customGoal: program.id === 'custom' ? program.name : '',
      customTask: program.id === 'custom' ? program.tagline : '',
    };
    navigate('setup');
  }

  function makeCustomProgram(d) {
    const name = d.name.trim();
    const task = d.task.trim();
    return {
      id: 'custom',
      categoryId: 'custom',
      name: name,
      tagline: task || ('21 days of ' + name),
      description: task
        ? task + ' Every day for 21 days, in a version small enough to repeat.'
        : 'Twenty-one days of ' + name + '. Made up as you go.',
      color: '#E3A11C',
      colorSoft: 'rgba(227,161,28,.18)',
      icon: 'spark',
      kicker: 'For you',
      minutes: d.minutes,
      difficulty: d.difficulty,
      targetHint: 'optional daily note',
      benefits: [
        'Built around something you actually care about',
        'You choose the size of the daily step',
        'A simple record of 21 days of trying',
      ],
      instructions: task || 'Do the smallest version of ' + name + ' today. Small enough that a bad day cannot stop you.',
      tasks: A.DATA.customTasks(name, d.minutes),
    };
  }

  function startChallenge() {
    if (!setupDraft || !setupProgram) return;
    const d = setupDraft;
    const p = setupProgram;
    let start = d.startDate ? A.parseISO(d.startDate) : A.today();
    if (start.getTime() > A.today().getTime()) start = A.today();
    const st = A.state;
    st.onboarded = true;
    st.name = (d.name || '').trim();
    st.challengeKey = d.key;
    st.challengeId = d.key === 'custom' ? 'custom' : p.categoryId;
    st.categoryId = p.categoryId;
    st.customGoal = d.key === 'custom' ? (d.customGoal || p.name) : '';
    st.customTask = d.key === 'custom' ? (d.customTask || p.tagline) : '';
    st.challengeName = p.name;
    st.challengeTagline = p.tagline;
    st.difficulty = p.difficulty || d.difficulty || 'Easy';
    st.minutes = d.minutes || p.minutes || 20;
    st.dailyTarget = (d.dailyTarget || '').trim();
    st.startDate = A.iso(start);
    st.completed = [];
    st.notes = {};
    st.reminder = !!d.reminder;
    st.reminderTime = d.reminderTime || '08:00';
    st.timeOfDay = A.timeOfDayFor(st.reminderTime);
    A.save();
    syncReminders({ requestPermission: true });

    screen = 'home';
    view.scrollTop = 0;
    render();
    A.chime('done');
    A.buzz([18, 40, 18]);
    A.toast('Your 21 days start now', 'spark');
  }

  function completeDay(day) {
    if (!A.hasActive()) {
      A.toast('No active challenge', 'spark');
      return;
    }
    day = parseInt(day, 10);
    if (!day) day = route.day;
    if (!day || A.isDone(day)) {
      A.toast('Day ' + day + ' is already complete', 'check');
      return;
    }
    if (day > A.currentDay()) {
      A.toast('That day has not started yet', 'lock');
      return;
    }

    const before = A.metrics().xp;
    const noteEl = document.getElementById('questNote');
    if (noteEl) {
      const value = noteEl.value.trim();
      if (value) A.state.notes[day] = value;
      else delete A.state.notes[day];
    }

    A.state.completed = Array.from(new Set(A.state.completed.concat([day]))).sort(function (a, b) { return a - b; });
    A.save();
    const gain = A.metrics().xp - before;
    syncReminders({ requestPermission: false });

    stopTimer();
    A.chime('done');
    A.buzz([20, 45, 30]);

    if (A.state.completed.length >= 21) {
      const record = A.archiveCurrent();
      lastRecordId = record ? record.id : null;
      justCompleted = { day: day, gain: gain, final: true, recordId: lastRecordId };
      screen = 'home';
      view.scrollTop = 0;
      render();
    } else {
      justCompleted = { day: day, gain: gain, final: false };
      render();
    }
  }

  function abandonCurrent() {
    const st = A.state;
    st.challengeId = null;
    st.challengeKey = null;
    st.categoryId = null;
    st.challengeName = '';
    st.challengeTagline = '';
    st.customGoal = '';
    st.customTask = '';
    st.difficulty = '';
    st.startDate = null;
    st.completed = [];
    st.notes = {};
    st.dailyTarget = '';
    A.abandonArmed = false;
    A.save();
    syncReminders({ requestPermission: false });
    navigate('home');
    A.toast('Challenge left. Your next 21 is ready when you are.', 'spark');
  }

  /* ------------------------------- timer -------------------------------- */

  function resetTimerState(day) {
    clearInterval(timer.id);
    timer.id = null;
    timer.running = false;
    timer.day = day;
    timer.total = A.state.minutes * 60;
    timer.secs = timer.total;
  }

  function startTimer() {
    if (!timer.day) resetTimerState(route.day);
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

  /* ----------------------------- reminders ------------------------------ */

  function syncReminders(opts) {
    if (!window.FLARE_NOTIFY) return;
    const st = A.state;
    const c = A.hasActive() ? A.challenge() : null;
    window.FLARE_NOTIFY.sync({
      active: !!c,
      reminder: st.reminder,
      reminderTime: st.reminderTime,
      startDate: st.startDate,
      completed: st.completed,
      tasks: c ? c.tasks.map(function (t) { return t[0]; }) : [],
      challengeName: c ? c.name : '',
      requestPermission: !!(opts && opts.requestPermission),
    });
  }

  /* ------------------------------ actions ------------------------------- */

  async function shareAchievement(id) {
    const record = id ? A.findHistory(id) : A.findHistory(lastRecordId);
    if (!record) {
      A.toast('Completion not found', 'close');
      return;
    }
    if (!window.FLARE_SHARE) {
      A.toast('Sharing is unavailable on this device', 'close');
      return;
    }
    A.buzz(10);
    try {
      const result = await window.FLARE_SHARE.shareCompletion(record);
      if (result && result.cancelled) return;
      if (result && result.ok) {
        A.toast(result.downloaded ? 'Completion card downloaded' : 'Share sheet opened', 'share');
      } else {
        A.toast('Could not share the card', 'close');
      }
    } catch (err) {
      A.toast('Could not share the card', 'close');
    }
  }

  function restartHistory(id) {
    const r = A.findHistory(id);
    if (!r) return;
    if (r.key === 'custom') {
      openCustom({ name: r.name, task: r.tagline, minutes: r.minutes || 20, difficulty: r.difficulty || 'Easy' });
      return;
    }
    const p = A.DATA.getProgram(r.key);
    if (!p) {
      A.toast('This challenge is no longer available', 'close');
      return;
    }
    openSetup(p, { returnTo: 'achievements', dailyTarget: r.dailyTarget || '' });
  }

  function openCustom(prefill) {
    customDraft = Object.assign({ name: '', task: '', minutes: 20, difficulty: 'Easy' }, prefill || {});
    navigate('custom');
  }

  function goTo(name) {
    if (name === 'custom') { openCustom(); return; }
    navigate(name);
  }

  function handleAction(act, el) {
    switch (act) {
      case 'go-back':
        back();
        break;
      case 'go-home':
        navigate('home');
        break;
      case 'browse':
        if (screen !== 'home') navigate('home');
        requestAnimationFrame(function () {
          const grid = document.querySelector('.cat-grid');
          if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        break;
      case 'continue':
        openDay(A.currentDay());
        break;
      case 'choose-program':
        openSetup(A.DATA.getProgram(el.dataset.id), { returnTo: 'detail' });
        break;
      case 'custom-continue':
        if (!customDraft || customDraft.name.trim().length < 2) {
          A.toast('Give your challenge a name first', 'spark');
          return;
        }
        openSetup(makeCustomProgram(customDraft), { returnTo: 'custom' });
        break;
      case 'custom-difficulty': {
        const value = el.dataset.value;
        customDraft.difficulty = value;
        view.querySelectorAll('.diff-pick').forEach(function (b) {
          b.classList.toggle('sel', b.dataset.value === value);
        });
        A.buzz(5);
        break;
      }
      case 'setup-toggle-reminder': {
        setupDraft.reminder = !setupDraft.reminder;
        el.setAttribute('aria-pressed', setupDraft.reminder ? 'true' : 'false');
        const timeInput = document.getElementById('reminderTime');
        if (timeInput) timeInput.disabled = !setupDraft.reminder;
        A.buzz(5);
        break;
      }
      case 'setup-next':
        setupStep = 2;
        view.scrollTop = 0;
        render();
        break;
      case 'start-challenge':
        startChallenge();
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
      case 'complete-day':
        completeDay(el.dataset.day);
        break;
      case 'celebrate-close':
        overlay.innerHTML = '';
        A.clearConfetti();
        navigate('home');
        break;
      case 'celebrate-journey':
        overlay.innerHTML = '';
        A.clearConfetti();
        navigate('journey');
        break;
      case 'celebrate-finish': {
        const id = el.dataset.record || lastRecordId;
        overlay.innerHTML = '';
        A.clearConfetti();
        if (id && A.findHistory(id)) navigate('complete', { historyId: id });
        else navigate('achievements');
        break;
      }
      case 'close-complete':
        navigate('achievements');
        break;
      case 'share-achievement':
        shareAchievement(el.dataset.record);
        break;
      case 'restart-history':
        restartHistory(el.dataset.record);
        break;
      case 'jump-today':
        requestAnimationFrame(function () {
          const cell = document.querySelector('.cal-day.is-today');
          if (cell) cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        break;
      case 'abandon-challenge':
        if (A.abandonArmed) {
          clearTimeout(abandonTimerId);
          abandonCurrent();
        } else {
          A.abandonArmed = true;
          render();
          A.toast('Tap again to leave this challenge', 'reset');
          clearTimeout(abandonTimerId);
          abandonTimerId = setTimeout(function () {
            A.abandonArmed = false;
            if (screen === 'profile') render();
          }, 4500);
        }
        break;
      case 'reset':
        if (A.resetArmed) {
          clearTimeout(resetTimerId);
          stopTimer();
          A.reset();
          syncReminders({ requestPermission: false });
          screen = 'home';
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
            if (screen === 'profile') render();
          }, 4500);
        }
        break;
      case 'export-backup':
        if (window.FLARE_BACKUP) {
          window.FLARE_BACKUP.exportBackup(A.state).then(function (res) {
            if (res && res.ok) A.toast(res.downloaded ? 'Backup downloaded' : 'Backup shared', 'download');
            else if (!res || !res.cancelled) A.toast('Could not save the backup', 'close');
          }).catch(function () {
            A.toast('Could not save the backup', 'close');
          });
        }
        break;
      case 'import-backup': {
        const input = document.getElementById('importFile');
        if (input) input.click();
        break;
      }
      default:
        break;
    }
  }

  /* ------------------------------- events ------------------------------- */

  view.addEventListener('click', function (e) {
    const go = e.target.closest('[data-go]');
    if (go) { goTo(go.dataset.go); return; }

    const category = e.target.closest('[data-category]');
    if (category) { navigate('explore', { categoryId: category.dataset.category }); return; }

    const program = e.target.closest('[data-program]');
    if (program) { navigate('detail', { programId: program.dataset.program }); return; }

    const history = e.target.closest('[data-history]');
    if (history) { navigate('complete', { historyId: history.dataset.history }); return; }

    const open = e.target.closest('[data-open-day]');
    if (open) { openDay(parseInt(open.dataset.openDay, 10)); return; }

    const toggle = e.target.closest('[data-toggle]');
    if (toggle) {
      const key = toggle.dataset.toggle;
      A.state[key] = !A.state[key];
      A.save();
      toggle.setAttribute('aria-pressed', A.state[key] ? 'true' : 'false');
      document.body.classList.toggle('reduce', !A.state.motion);
      if (key === 'reminder') syncReminders({ requestPermission: true });
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
    if (go) goTo(go.dataset.go);
  });

  view.addEventListener('input', function (e) {
    const id = e.target.id;
    if (id === 'questNote' && route.day) {
      const value = e.target.value.trim();
      if (value) A.state.notes[route.day] = value;
      else delete A.state.notes[route.day];
      A.save();
    } else if (id === 'setupName' && setupDraft) {
      setupDraft.name = e.target.value;
    } else if (id === 'dailyTarget' && setupDraft) {
      setupDraft.dailyTarget = e.target.value;
    } else if (id === 'startDate' && setupDraft) {
      setupDraft.startDate = e.target.value;
    } else if (id === 'reminderTime' && setupDraft) {
      setupDraft.reminderTime = e.target.value;
    } else if (id === 'customName' && customDraft) {
      customDraft.name = e.target.value;
    } else if (id === 'customTask' && customDraft) {
      customDraft.task = e.target.value;
    } else if (id === 'customMinutes' && customDraft) {
      customDraft.minutes = parseInt(e.target.value, 10);
      const num = document.getElementById('customMinutesNum');
      if (num) num.textContent = customDraft.minutes;
      e.target.style.setProperty('--fill', ((customDraft.minutes - 5) / 55) * 100 + '%');
    } else if (id === 'profileName') {
      A.state.name = e.target.value;
      A.save();
    }
  });

  view.addEventListener('change', function (e) {
    const id = e.target.id;
    if (id === 'profileReminderTime') {
      A.state.reminderTime = e.target.value || '08:00';
      A.state.timeOfDay = A.timeOfDayFor(A.state.reminderTime);
      A.save();
      syncReminders({ requestPermission: true });
      A.toast('Reminder set for ' + A.reminderLabel(), 'bell');
    } else if (id === 'reminderTime' && setupDraft) {
      setupDraft.reminderTime = e.target.value || '08:00';
    } else if (id === 'startDate' && setupDraft) {
      setupDraft.startDate = e.target.value;
    } else if (id === 'importFile') {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const raw = window.FLARE_BACKUP.parse(reader.result);
          A.replaceState(raw);
          syncReminders({ requestPermission: false });
          screen = 'home';
          view.scrollTop = 0;
          render();
          A.toast('Backup restored', 'check');
        } catch (err) {
          A.toast('That file is not a FLARE backup', 'close');
        }
      };
      reader.onerror = function () { A.toast('Could not read that file', 'close'); };
      reader.readAsText(file);
      e.target.value = '';
    }
  });

  view.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.active-card[data-act], .empty-challenge[data-act], .cat-card[data-go], .done-card[data-history]');
    if (card && e.target === card) {
      e.preventDefault();
      card.click();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.innerHTML) overlay.innerHTML = '';
  });

  /* Native shell bridge. Returns 'exit' when the back button should leave the app. */
  window.FLARE_NATIVE = {
    back: function () {
      if (overlay.innerHTML) {
        overlay.innerHTML = '';
        return 'overlay';
      }
      if (screen === 'home') return 'exit';
      back();
      return 'handled';
    },
    openToday: function () {
      if (A.hasActive()) openDay(A.currentDay());
      else navigate('home');
    },
  };

  boot();
})();
