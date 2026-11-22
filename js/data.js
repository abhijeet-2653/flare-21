/* FLARE — content & challenge data */
window.FLARE = (function () {
  const categories = [
    {
      id: 'move',
      name: 'Move',
      short: 'Fitness, exercise, walking and physical activity.',
      tagline: 'Sweat a little, mark it down',
      color: '#E8451F',
      colorSoft: 'rgba(232,69,31,.14)',
      icon: 'bolt',
      kicker: 'For the body',
      blurb: 'Twenty-one days of tiny movement rituals. No gym bro energy required.',
      tasks: [
        ['5-minute stretch', 'Loosen the hinges — neck, shoulders, hips.'],
        ['1,000-step walk', 'Around the block counts. So does the hallway.'],
        ['10 squats, 10 push-ups', 'Two rounds. Bad form still counts as showing up.'],
        ['Dance to one song', 'Loud. Windows open. No choreography needed.'],
        ['10-minute walk outside', 'Leave the headphones. Listen to the street.'],
        ['Plank for 30 seconds', 'Three rounds. Breathe through the shake.'],
        ['Stairs instead of the lift', 'Every flight is a tiny victory.'],
        ['15-minute stretch flow', 'Slow it down — hips, hamstrings, spine.'],
        ['20 jumping jacks', 'Wake the engine. Three sets, shake it out.'],
        ['Walk 2,000 steps', "Take the long way to wherever you're going."],
        ['5-minute mobility', 'Ankles, wrists, shoulders — the forgotten joints.'],
        ['One-minute wall sit', 'Thighs parallel. Smile through it.'],
        ['Dance break ×2', 'Two songs. Full main-character energy.'],
        ['12-minute brisk walk', 'Push the pace, not the panic.'],
        ['15 squats + 15 glute bridges', 'Slow reps. Feel the burn.'],
        ['Stretch before bed', 'Five minutes. Phone in the other room.'],
        ['3,000 steps', 'A park, a loop, a wandering mind.'],
        ['10 push-ups (any kind)', 'Knees, wall, full — they all count.'],
        ['20-minute walk + podcast', 'One episode. One loop. Zero guilt.'],
        ['Full-body stretch', 'Ten minutes for the whole machine.'],
        ['Move for 21 minutes', 'One minute for every day you showed up.'],
      ],
    },
    {
      id: 'mind',
      name: 'Mind',
      short: 'Meditation, mindfulness, reading and mental wellness.',
      tagline: 'Soft focus, sharp calm',
      color: '#2F49D1',
      colorSoft: 'rgba(47,73,209,.13)',
      icon: 'lotus',
      kicker: 'For the head',
      blurb: 'A little less noise, a little more you. Tiny pauses that change the day.',
      tasks: [
        ['3-minute breath', "In for four, out for six. That's it."],
        ['Write 3 gratitudes', 'Tiny things count. Coffee counts.'],
        ['5-minute meditation', 'Sit. Breathe. Get distracted. Come back.'],
        ['One screen-free hour', 'No scrolling. No notifications. Just you.'],
        ['10-minute body scan', "Head to toes. Notice, don't fix."],
        ['Journal one page', 'Messy handwriting strongly encouraged.'],
        ['4-7-8 breathing', 'Four rounds before bed.'],
        ['Mindful coffee', 'No phone. Just the cup and the steam.'],
        ['10-minute meditation', 'Same seat. Slightly longer quiet.'],
        ['Name 5 feelings', 'Out loud or on paper. No judgement.'],
        ['Walk without headphones', 'Let the brain wander a little.'],
        ['Let one thing go', 'Write it down, then literally cross it out.'],
        ['15-minute meditation', 'Set a timer. Let it be boring.'],
        ['Digital sunset', 'No screens 30 minutes before bed.'],
        ['Write a kind note to yourself', "Say what you'd say to a friend."],
        ['5-minute breath + stretch', 'The nervous system loves a good stretch.'],
        ['Sit in silence for 10', 'Nothing to do. Nowhere to be.'],
        ['Three deep breaths, three times', 'Morning, midday, night.'],
        ['20-minute meditation', "The long sit. You're ready."],
        ['Write your 21-day reflection', 'What shifted? What stayed?'],
        ['21 minutes of stillness', 'One minute for every day you showed up.'],
      ],
    },
    {
      id: 'make',
      name: 'Make',
      short: 'Creativity, writing and learning.',
      tagline: 'Make something from nothing',
      color: '#E3A11C',
      colorSoft: 'rgba(227,161,28,.18)',
      icon: 'brush',
      kicker: 'For the hands',
      blurb: 'Make bad art on purpose. Twenty-one small acts of creation, zero perfectionism.',
      tasks: [
        ['Doodle for 5 minutes', 'No eraser. No rules.'],
        ['Write 6 bad ideas', 'Bad ideas are the door to good ones.'],
        ['Snap 3 photos of one color', 'Hunt the color. Frame the world.'],
        ['One-page comic', 'Four panels. Stick figures welcome.'],
        ['Make a 30-second video', 'Anything. Your desk. Your walk.'],
        ['Write a 6-word story', 'Six words. One feeling.'],
        ['Design a fake album cover', 'Paper, pen, or phone.'],
        ['Build a playlist of 7 songs', 'One for each mood.'],
        ['Sketch your dream room', "Don't worry about straight lines."],
        ['Write 10 headlines', 'For a movie about your week.'],
        ['Make a collage', 'Old magazines, receipts, tape.'],
        ['Write a letter to future you', 'Seal it. Date it. Keep it.'],
        ['Draw your day as a map', 'Landmarks, detours, snacks.'],
        ['Create a 5-line poem', 'Rhyme optional. Honesty required.'],
        ['Make a mini zine', 'One sheet, folded. Eight tiny pages.'],
        ['Photograph 5 textures', 'Bark, fabric, concrete, skin, sky.'],
        ['Design a sticker', 'Round, bold, yours.'],
        ['Rewrite a bad memory', 'Same facts. Better ending.'],
        ['Make a 1-minute animation', 'Flipbook or phone. Keep it crude.'],
        ['Finish the unfinished thing', 'That one. You know the one.'],
        ['Make a 21-piece collection', 'One tiny piece for every day.'],
      ],
    },
    {
      id: 'unplug',
      name: 'Unplug',
      short: 'Digital detox and reducing screen time.',
      tagline: 'Log off, live on',
      color: '#5C7F68',
      colorSoft: 'rgba(92,127,104,.17)',
      icon: 'moon',
      kicker: 'For the attention',
      blurb: 'Twenty-one gentle experiments in being here. Your feed will survive without you.',
      tasks: [
        ['Phone in another room for 1 hour', 'Out of sight, out of pings.'],
        ['Turn off 5 notifications', "You don't need to know instantly."],
        ['No-phone morning', 'First 30 minutes — screens off.'],
        ["Delete one app you don't love", 'Break up gently.'],
        ['Leave the phone when you walk', 'Just keys and thoughts.'],
        ['Grayscale for an hour', 'Watch the pull fade with the color.'],
        ['One-screen meal', 'No second screen at the table.'],
        ['Airplane hour', 'Not flying. Just quiet.'],
        ['No-phone bathroom', 'We both know.'],
        ['Unsubscribe from 10 emails', 'Clean the digital attic.'],
        ['Read 10 pages, on paper', 'A real book. Real pages.'],
        ['No-phone queue', 'Look up. Notice the world.'],
        ['Photo-free day', 'Let your eyes keep it.'],
        ['Call instead of text', 'One voice note or actual call.'],
        ['Bedroom phone ban', 'Charge it outside the room.'],
        ['2-hour screen fast', 'Pick a window. Close the tabs.'],
        ['No-phone first hour', 'Morning belongs to you.'],
        ['One-app day', 'Only the essentials.'],
        ['3-hour detox', 'Go do something worth telling.'],
        ['Digital declutter', 'Home screen down to 8 apps max.'],
        ['One screen-light day', "You've earned the quiet."],
      ],
    },
  ];

  const customCategory = {
    id: 'custom',
    name: 'Custom',
    short: 'Create a personalized challenge.',
    tagline: 'Your rules, your 21',
    color: '#E3A11C',
    colorSoft: 'rgba(227,161,28,.18)',
    icon: 'spark',
    kicker: 'For you',
    blurb: 'Name your own daily practice. Keep it small enough to repeat.',
    tasks: [],
  };

  /* ------------------------- predefined challenges ------------------------ */

  const programs = [
    /* ------------------------------- MOVE -------------------------------- */
    {
      id: 'move-walk',
      categoryId: 'move',
      name: 'Walk 10,000 steps',
      tagline: 'One long walk, every day',
      description: 'Start at 5,000 steps and build to 10,000. No pace targets, no gym — just you, the pavement and a little more distance each week.',
      minutes: 45,
      difficulty: 'Medium',
      icon: 'route',
      targetHint: 'e.g. 10,000 steps',
      benefits: [
        'Builds a simple daily movement habit',
        'Easy to fit around work or errands',
        'Low impact, no equipment needed',
      ],
      instructions: 'Put your shoes on before you have time to negotiate. Any steps count — errands, commutes, a long loop around the block.',
      phases: [
        { until: 7, title: 'Walk 5,000 steps', note: 'Build the habit before the distance.' },
        { until: 14, title: 'Walk 7,500 steps', note: 'The middle stretch. Keep the pace easy.' },
        { until: 21, title: 'Walk 10,000 steps', note: 'The full target, one step at a time.' },
      ],
      twists: [
        'Take the long way to the shop.',
        'Walk after dinner, phone in your pocket.',
        "Find a route you've never taken.",
        'One loop around the park, no headphones.',
        'Walk to the shop instead of driving.',
        'Take a 15-minute stroll at lunch.',
        'Pick a direction and wander for 20 minutes.',
      ],
    },
    {
      id: 'move-strength',
      categoryId: 'move',
      name: 'Exercise for 30 minutes',
      tagline: 'Bodyweight, no gym',
      description: 'A short, honest session you can do at home. Start with 15 minutes and build to a full 30 by week three.',
      minutes: 30,
      difficulty: 'Medium',
      icon: 'bolt',
      targetHint: 'e.g. 3 rounds',
      benefits: [
        'Builds strength without a gym membership',
        'Short enough for a busy day',
        'Scales up or down to your energy',
      ],
      instructions: 'Warm up for two minutes, then pick a circuit. Stop while you still feel good — showing up is the point.',
      phases: [
        { until: 7, title: 'Exercise for 15 minutes', note: 'Leave something in the tank.' },
        { until: 14, title: 'Exercise for 22 minutes', note: 'Add one more round if it feels easy.' },
        { until: 21, title: 'Exercise for 30 minutes', note: 'The full session. You built this.' },
      ],
      twists: [
        'Follow a short bodyweight circuit.',
        'Upper body: push-ups, rows, shoulder taps.',
        'Lower body: squats, lunges, glute bridges.',
        'Core: plank, dead bug, side plank.',
        'Take a brisk walk as your warm-up.',
        'Repeat your favourite circuit twice.',
        'Full-body flow — five moves, three rounds.',
      ],
    },

    /* ------------------------------- MIND -------------------------------- */
    {
      id: 'mind-meditate',
      categoryId: 'mind',
      name: 'Meditate for 10 minutes',
      tagline: 'Sit still, gently',
      description: 'Start with five quiet minutes and grow to ten. No perfect state required — just a little space between you and the noise.',
      minutes: 10,
      difficulty: 'Easy',
      icon: 'lotus',
      targetHint: 'e.g. 10 minutes',
      benefits: [
        'Creates a small daily pause',
        'Easy to do anywhere, no equipment',
        'Builds attention without forcing calm',
      ],
      instructions: 'Set a gentle timer. Sit somewhere you will not be interrupted. When your mind wanders, come back to the breath — that is the practice.',
      phases: [
        { until: 7, title: 'Meditate for 5 minutes', note: 'Short enough to actually do.' },
        { until: 14, title: 'Meditate for 8 minutes', note: 'A little more quiet each week.' },
        { until: 21, title: 'Meditate for 10 minutes', note: 'The full sit. Let it be boring.' },
      ],
      twists: [
        'Sit by a window. Keep your eyes soft.',
        'Use a guided session if sitting still feels hard.',
        'Count ten slow breaths, then start again.',
        'Try a body scan from head to toes.',
        'Same seat, same time. Build the cue.',
        'Let sounds come and go without naming them.',
        'Skip the timer. Sit until the bell feels right.',
      ],
    },
    {
      id: 'mind-read',
      categoryId: 'mind',
      name: 'Read for 20 minutes',
      tagline: 'Paper pages, no feed',
      description: 'Ten minutes becomes twenty. Pick one book and let it be the only thing in front of you.',
      minutes: 20,
      difficulty: 'Easy',
      icon: 'book',
      targetHint: 'e.g. 20 pages',
      benefits: [
        'Trades scrolling for a slower attention span',
        'Works with any book you already own',
        'A quiet ritual you can repeat anywhere',
      ],
      instructions: 'Phone in another room. One book, one timer. If you miss a day, pick up where you left off — no catching up required.',
      phases: [
        { until: 7, title: 'Read for 10 minutes', note: 'Short enough to start today.' },
        { until: 14, title: 'Read for 15 minutes', note: 'Stay past the first urge to check your phone.' },
        { until: 21, title: 'Read for 20 minutes', note: 'The full sit. One book, no feed.' },
      ],
      twists: [
        'Read the first thing on your shelf.',
        'Take a paper book to a café.',
        'Read one chapter, then close it.',
        'Try a genre you usually avoid.',
        'Read outside for a change of scene.',
        'Re-read a page you loved.',
        'Finish the chapter before you move.',
      ],
    },

    /* ------------------------------- MAKE -------------------------------- */
    {
      id: 'make-write',
      categoryId: 'make',
      name: 'Write 200 words',
      tagline: 'Messy first drafts',
      description: 'A daily page that nobody has to read. Start with 100 words and build to 200 by the final week.',
      minutes: 20,
      difficulty: 'Medium',
      icon: 'note',
      targetHint: 'e.g. 200 words',
      benefits: [
        'Turns ideas into something concrete',
        'Low-pressure creative practice',
        'A written record of your 21 days',
      ],
      instructions: 'No editing while you write. Set a timer, keep the pen moving, and stop when the words are done. Bad writing still counts.',
      phases: [
        { until: 7, title: 'Write 100 words', note: 'Lower the bar until you start.' },
        { until: 14, title: 'Write 150 words', note: 'Stay for one more paragraph.' },
        { until: 21, title: 'Write 200 words', note: 'The full page. Messy is fine.' },
      ],
      twists: [
        'Write about the first thing you noticed today.',
        'Describe a room without naming it.',
        'Write a letter you will never send.',
        'Start with the line “I remember…”.',
        'Write the scene from someone else’s eyes.',
        'Make a list of ten tiny observations.',
        'Write the ending first, then the start.',
      ],
    },
    {
      id: 'make-sketch',
      categoryId: 'make',
      name: 'Sketch one thing',
      tagline: 'Look, then draw',
      description: 'Ten minutes of looking closely. No eraser, no masterpiece — just a daily date with a pencil.',
      minutes: 15,
      difficulty: 'Easy',
      icon: 'brush',
      targetHint: 'e.g. one sketch',
      benefits: [
        'Trains your eye to notice detail',
        'No expensive materials required',
        'A gentle antidote to perfectionism',
      ],
      instructions: 'Pick one object. Look at it for a full minute before your pencil moves. When the timer ends, stop — even if it is unfinished.',
      phases: [
        { until: 7, title: 'Sketch for 10 minutes', note: 'One object, one pencil.' },
        { until: 14, title: 'Sketch for 15 minutes', note: 'Add a little more detail.' },
        { until: 21, title: 'Sketch for 20 minutes', note: 'The long look. Let it be imperfect.' },
      ],
      twists: [
        'Draw your coffee cup.',
        'Sketch the view from your window.',
        'Draw your hand without looking at the page.',
        'Pick something from your bag.',
        'Sketch a plant or a leaf.',
        'Draw the same object from three angles.',
        'Make a tiny comic of your day.',
      ],
    },

    /* ------------------------------ UNPLUG ------------------------------- */
    {
      id: 'unplug-social',
      categoryId: 'unplug',
      name: 'Avoid social media for one hour',
      tagline: 'One quiet hour',
      description: 'Start with 30 minutes and build to a full hour away from the feed. The apps will still be there.',
      minutes: 60,
      difficulty: 'Medium',
      icon: 'moon',
      targetHint: 'e.g. 60 minutes',
      benefits: [
        'Breaks the automatic scroll loop',
        'Creates space for something you chose',
        'No willpower marathon — just one hour',
      ],
      instructions: 'Pick the hour before you start. Put the apps out of reach, not just closed. When you feel the pull, notice it and do one small thing instead.',
      phases: [
        { until: 7, title: 'Stay off social for 30 minutes', note: 'A short, clean window.' },
        { until: 14, title: 'Stay off social for 45 minutes', note: 'The pull gets quieter.' },
        { until: 21, title: 'Stay off social for 1 hour', note: 'The full hour. You choose what fills it.' },
      ],
      twists: [
        'Leave your phone in another room.',
        'Take a walk without your phone.',
        'Make tea and sit with it.',
        'Read ten pages instead.',
        'Tidy one small surface.',
        'Write down what you reached for.',
        'Call someone instead of scrolling.',
      ],
    },
    {
      id: 'unplug-morning',
      categoryId: 'unplug',
      name: 'Phone-free morning',
      tagline: 'Start before the scroll',
      description: 'Give your first minutes to yourself instead of the feed. Start with 15 and build to 45 minutes.',
      minutes: 30,
      difficulty: 'Easy',
      icon: 'sunrise',
      targetHint: 'e.g. 30 minutes',
      benefits: [
        'Starts the day on your own terms',
        'Reduces the morning dopamine rush',
        'Easy to pair with coffee or stretching',
      ],
      instructions: 'Charge your phone outside the bedroom. When you wake, leave it there until your phone-free window is over.',
      phases: [
        { until: 7, title: 'First 15 minutes phone-free', note: 'Just the first quarter hour.' },
        { until: 14, title: 'First 30 minutes phone-free', note: 'Coffee, shower, breathe.' },
        { until: 21, title: 'First 45 minutes phone-free', note: 'The whole slow start.' },
      ],
      twists: [
        'Make coffee before you unlock anything.',
        'Stretch by the window.',
        'Eat breakfast without a screen.',
        'Write three lines about the day ahead.',
        'Step outside for two minutes.',
        'Read one page before the feed.',
        'Sit in silence with your first drink.',
      ],
    },
  ];

  programs.forEach(function (p) {
    p.category = categories.find(function (c) { return c.id === p.categoryId; });
    p.color = p.category.color;
    p.colorSoft = p.category.colorSoft;
  });

  /* The original category programs remain available as the club classics. */
  const classics = categories.map(function (c) {
    return {
      id: c.id,
      categoryId: c.id,
      category: c,
      name: c.name + ' Daily',
      tagline: c.tagline,
      description: c.blurb,
      minutes: 20,
      difficulty: 'Medium',
      icon: c.icon,
      targetHint: 'optional daily note',
      benefits: [
        'A different tiny task every day',
        'Made for low-energy days',
        'The original FLARE 21-day program',
      ],
      instructions: 'Each day gives you one small task. Do the version you can keep on a bad day — that is the whole trick.',
      tasks: c.tasks,
      classic: true,
      color: c.color,
      colorSoft: c.colorSoft,
    };
  });

  const allPrograms = programs.concat(classics);

  function buildPhaseTasks(program) {
    const tasks = [];
    for (let day = 1; day <= 21; day++) {
      let phase = program.phases[program.phases.length - 1];
      for (let i = 0; i < program.phases.length; i++) {
        if (day <= program.phases[i].until) { phase = program.phases[i]; break; }
      }
      const twist = program.twists[(day - 1) % program.twists.length];
      tasks.push([phase.title, twist + ' ' + phase.note]);
    }
    return tasks;
  }

  programs.forEach(function (p) {
    p.tasks = buildPhaseTasks(p);
  });

  function getCategory(id) {
    if (id === 'custom') return customCategory;
    return categories.find(function (c) { return c.id === id; }) || null;
  }

  function getProgram(id) {
    return allPrograms.find(function (p) { return p.id === id; }) || null;
  }

  function programsFor(categoryId) {
    return allPrograms.filter(function (p) { return p.categoryId === categoryId; });
  }

  const customTasks = function (goal, minutes) {
    const g = goal || 'my thing';
    const titles = [
      ['Write down why this matters', 'One honest sentence about what you want.'],
      ['Set up your space', 'Remove one obstacle before you begin.'],
      ['Do the smallest version', 'So small it feels almost silly.'],
      ['Ten focused minutes', 'Timer on. Notifications off.'],
      ['Make it easier', 'What would make tomorrow effortless?'],
      ['Tell someone', 'Say it out loud — witness makes it real.'],
      ['Week one reflection', 'What worked? What felt heavy?'],
      ['Add five minutes', 'A little more room for the thing.'],
      ['Remove one obstacle', 'Delete, move, or delegate it.'],
      ['Do it badly on purpose', 'Permission to be a beginner.'],
      ['Pair it with a ritual', 'Attach it to something you already do.'],
      ['Twelve-minute session', 'Slightly longer, slightly deeper.'],
      ['Teach it back', 'Explain what you learned to anyone.'],
      ['Halfway check-in', 'Look how far the small steps got you.'],
      ['Change the scenery', 'Same practice, new place.'],
      ['Fifteen-minute push', 'Stay past the first urge to stop.'],
      ['Notice the progress', 'Write three things that are easier now.'],
      ['Share the work', 'Show one person the messy middle.'],
      ['Twenty-minute deep dive', 'The long session. You built up to this.'],
      ['Make a plan for after', 'How does this live beyond day 21?'],
      ['Celebrate the streak', 'Twenty-one minutes. One for every day.'],
    ];
    return titles.map(function (pair) {
      return [pair[0], pair[1] + ' · ' + minutes + ' min toward ' + g + '.'];
    });
  };

  const quotes = [
    ['Small hinges swing big doors.', 'Tally'],
    ['You do not need a new life. Just a new Tuesday.', 'Tally'],
    ['Consistency is just a decision you repeat.', 'Tally'],
    ['Show up ugly. The receipt still counts.', 'Tally'],
    ['Tiny wins are still wins with a receipt.', 'Tally'],
    ['Momentum loves a mediocre first step.', 'Tally'],
    ['Do it for the plot. And the streak.', 'Tally'],
    ['Future you is watching. Wave.', 'Tally'],
    ['One day off is a rest. Two is a plot twist.', 'Tally'],
    ['Your pace is the right pace.', 'Tally'],
  ];

  const badges = [
    { id: 'first', name: 'First Mark', desc: 'Complete 1 day', icon: 'bolt', color: '#E8451F', test: (m) => m.done >= 1 },
    { id: 'glow3', name: 'Three in a Row', desc: 'Hit a 3-day streak', icon: 'flame', color: '#E3A11C', test: (m) => m.bestStreak >= 3 || m.streak >= 3 },
    { id: 'notes', name: 'Note Taker', desc: 'Write 3 daily notes', icon: 'brush', color: '#5C7F68', test: (m) => m.notes >= 3 },
    { id: 'week', name: 'Week One', desc: 'Complete 7 days', icon: 'star', color: '#2F49D1', test: (m) => m.done >= 7 },
    { id: 'half', name: 'Halfway', desc: 'Complete 11 days', icon: 'lotus', color: '#E8451F', test: (m) => m.done >= 11 },
    { id: 'sunrise', name: 'Sunrise Club', desc: '5 morning quests', icon: 'sunrise', color: '#2F49D1', test: (m) => m.done >= 5 && m.timeOfDay === 'sunrise' },
    { id: 'final', name: 'Full Twenty-One', desc: 'Finish all 21 days', icon: 'spark', color: '#E8451F', test: (m) => m.done >= 21 },
  ];

  return {
    categories: categories,
    customCategory: customCategory,
    getCategory: getCategory,
    programs: programs,
    classics: classics,
    allPrograms: allPrograms,
    getProgram: getProgram,
    programsFor: programsFor,
    customTasks: customTasks,
    quotes: quotes,
    badges: badges,
  };
})();
