(() => {
  'use strict';

  const icons = {
    cube:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-6h6v6"/>',
    book:'<path d="M12 5a9 9 0 0 0-9-1v15a9 9 0 0 1 9 1 9 9 0 0 1 9-1V4a9 9 0 0 0-9 1v15Z"/>',
    shuffle:'<path d="M3 6h3c4 0 7 12 12 12h3m-3-3 3 3-3 3M3 18h3c2 0 4-3 5-5m2-3c2-3 3-4 5-4h3m-3-3 3 3-3 3"/>',
    undo:'<path d="M3 10h12a6 6 0 0 1 0 12H8M3 10l5-5M3 10l5 5" transform="translate(0 -2)"/>',
    list:'<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    moon:'<path d="M21 13.2A9 9 0 1 1 10.8 3a7.1 7.1 0 0 0 10.2 10.2Z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>',
    right:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    left:'<path d="M20 12H4m6-6-6 6 6 6"/>',
    film:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16m10-16v16M3 9h4m-4 6h4m10-6h4m-4 6h4"/>',
    layout:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
    pen:'<path d="m3 21 4-12 9-5 4 4-5 9-12 4Zm0 0 7-7m5-9 4 4"/><circle cx="11" cy="13" r="1.3"/>',
    box:'<path d="m3 7 3-4h12l3 4v13H3zm0 0h18M9 11h6"/>',
    monitor:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 17v4m-5 0h10"/>',
    external:'<path d="M14 3h7v7m0-7-9 9m7 0v8H4V5h8"/>',
    save:'<path d="M5 4h12l3 3v13H4V4zM8 4v6h8V4m-8 16v-6h8v6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    play:'<path d="M8 5v14l11-7z"/>',
    doc:'<path d="M6 3h8l5 5v13H6zM14 3v5h5M9 13h7M9 17h7"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
  const byId = id => document.getElementById(id);
  const noteById = new Map(notes.map(item => [item.id,item]));
  const unitById = new Map(units.map(item => [item.id,item]));
  const questionById = new Map(questions.map(item => [item.id,item]));
  const primaryNav = [
    ['home','홈','home'],['notes','개념 학습','book'],['summary','요약 노트','doc'],
    ['exam','랜덤 모의고사','shuffle'],['wrong','오답 노트','undo'],['hints','시험 힌트','list']
  ];
  const main = byId('main');
  const mobile = matchMedia('(max-width: 768px)');
  const storageKey = subject.storage;
  const freshState = () => ({session:null, latest:null, wrong:{}});
  let storageAvailable = true;
  let state = readState();
  let showWrongOnly = false;
  let selectedRoute = '';

  function readState() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (stored && typeof stored.wrong === 'object' && stored.wrong) {
        for (const key of ['session','latest']) {
          if (!stored[key]?.items?.length || stored[key].items.some(item => !questionById.has(item.id))) stored[key] = null;
        }
        for (const id of Object.keys(stored.wrong)) {
          if (!questionById.has(id)) delete stored.wrong[id];
        }
        return stored;
      }
    } catch {
      storageAvailable = false;
    }
    return freshState();
  }

  function saveState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      storageAvailable = false;
      byId('storage-label').textContent = '현재 탭에만 기록 유지';
    }
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function renderSource(source) {
    if (!source) return '';
    const reference = `<a class="text-link" href="${source.url}" target="_blank" rel="noopener noreferrer">${source.label} ${icon('external')}</a>`;
    if (!source.image) return `<p class="source-line">${reference}</p>`;
    return `<details class="excel-example">
      <summary>${subject.exampleLabel}</summary>
      <figure>
        <img loading="lazy" referrerpolicy="no-referrer" src="${source.image}" alt="${source.alt}">
        <figcaption>${reference}</figcaption>
      </figure>
    </details>`;
  }

  const noteHref = id => '#learn/' + id;
  const unitStyle = unit => `style="--unit:${unit.color}"`;
  const unitIcon = unit => `<span class="unit-icon" ${unitStyle(unit)}>${icon(unit.icon)}</span>`;
  const noteLink = id => `<a class="text-link" href="${noteHref(id)}">개념 보기 ${icon('right')}</a>`;
  const questionUnit = question => unitById.get(noteById.get(question.noteId).unit);

  const {introLabel} = subject;
  const hasSummaryStep = false;
  const pageLabel = note => note.page;
  const noteResources = note => renderSource(note.source);

  function renderIntro(note) {
    const [question,answer] = note.sheet;
    const hidden = lessons.recall && !lesson.revealed.has('sheet');
    return `<p class="step-kicker">${subject.hintLabel} ${pad(hintNumber.get(note.id))}번 · ${note.page}</p>
      <h2 class="step-title"><span class="q-mark" aria-hidden="true">Q</span>${question}</h2>
      ${hidden ? revealButton('sheet','정답 확인하기') : `<div class="answer-box" data-revealed="sheet" tabindex="-1">
        <span class="answer-label">정답</span>
        <p>${answer.split(' / ').map(part => `<span>${part}</span>`).join('')}</p>
      </div>
      <div class="callout"><strong>암기 단서</strong> ${note.cue}</div>`}`;
  }

  function setNavOpen(open) {
    const sidebar = byId('sidebar');
    const menuButton = byId('mobile-menu');
    const wasOpen = sidebar.classList.contains('open');
    sidebar.classList.toggle('open',open);
    byId('nav-overlay').classList.toggle('open',open);
    document.body.classList.toggle('menu-open',open);
    menuButton.setAttribute('aria-expanded',String(open));
    if (open) {
      sidebar.inert = false;
      byId('close-menu').focus({preventScroll:true});
      byId('shell').inert = true;
    } else {
      byId('shell').inert = false;
      if (wasOpen && mobile.matches) menuButton.focus({preventScroll:true});
      sidebar.inert = mobile.matches;
    }
  }

  const lessonKey = storageKey.replace('-study-','-lessons-');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const stepCache = new Map();
  const hintNumber = new Map();
  hints.forEach((hint,index) => { if (!hintNumber.has(hint[2])) hintNumber.set(hint[2],index + 1); });
  const pad = number => String(number).padStart(2,'0');
  const unitNotes = unitId => notes.filter(note => note.unit === unitId);
  const noteQuestions = id => questions.filter(question => question.noteId === id);
  const doneCount = list => list.filter(note => lessons.done[note.id]).length;
  const nextNote = note => notes[notes.indexOf(note) + 1] ?? null;
  const revealButton = (key,label) => `<button type="button" class="reveal" data-reveal="${key}">${icon('eye')} ${label}</button>`;
  let lessons = readLessons();
  let lesson = null;
  let suppressClickUntil = 0;

  function readLessons() {
    try {
      const stored = JSON.parse(localStorage.getItem(lessonKey));
      if (stored && typeof stored.done === 'object' && stored.done) {
        for (const id of Object.keys(stored.done)) {
          if (!noteById.has(id)) delete stored.done[id];
        }
        const last = stored.last && noteById.has(stored.last.id) ? stored.last : null;
        return {done:stored.done, last, recall:Boolean(stored.recall)};
      }
    } catch {}
    return {done:{}, last:null, recall:false};
  }

  function saveLessons() {
    try { localStorage.setItem(lessonKey, JSON.stringify(lessons)); } catch {}
  }

  function resumeNote(list = notes) {
    const last = lessons.last ? noteById.get(lessons.last.id) : null;
    const inList = Boolean(last) && list.includes(last);
    if (inList && !lessons.done[last.id]) return last;
    const start = inList ? list.indexOf(last) + 1 : 0;
    return [...list.slice(start), ...list.slice(0,start)].find(note => !lessons.done[note.id]) ?? null;
  }

  function lessonCta(list = notes) {
    const note = resumeNote(list);
    if (!note) return {href:'#learn/' + list[0].id, label:'처음부터 복습', note:null};
    const started = list.some(item => lessons.done[item.id] || lessons.last?.id === item.id);
    return {href:'#learn/' + note.id, label:started ? '이어서 학습' : '학습 시작', note};
  }

  function renderSidebar(view, unit, noteId) {
    const inCourse = view === 'notes' || view === 'learn';
    byId('sidebar').innerHTML = `
      <div class="sidebar-head">
        <a class="brand" href="#home"><span class="brand-mark">${icon(subject.icon)}</span><span><strong>${subject.name}</strong><small>${subject.tagline}</small></span></a>
        <button class="icon-button drawer-close" id="close-menu" type="button" aria-label="메뉴 닫기">${icon('close')}</button>
      </div>
      <div class="side-label">학습</div>
      <nav class="side-nav" aria-label="학습 기능">
        <a class="side-link" href="index.html">${icon('left')}과목 책장</a>
        ${primaryNav.map(([id,title,symbol]) => {
          const current = view === id || (id === 'exam' && view === 'result') || (id === 'notes' && view === 'learn');
          return `<a href="#${id}" class="side-link" ${current ? 'aria-current="page"' : ''}>${icon(symbol)}${title}</a>`;
        }).join('')}
      </nav>
      <div class="side-label">단원</div>
      <nav class="side-nav" aria-label="단원 목록">
        ${units.map(item => {
          const list = unitNotes(item.id);
          const open = inCourse && item.id === unit;
          const current = open ? (view === 'notes' ? 'aria-current="page"' : 'aria-current="true"') : '';
          return `<a href="#notes/${item.id}" class="side-link" ${current}><span class="topic-dot" ${unitStyle(item)}></span><span class="side-text">${item.title}</span><span class="side-count">${doneCount(list)}/${list.length}</span></a>
          ${open ? `<div class="side-lessons">${list.map(note => `<a href="#learn/${note.id}" class="side-lesson ${lessons.done[note.id] ? 'done' : ''}" ${note.id === noteId ? 'aria-current="page"' : ''}><span class="side-check">${lessons.done[note.id] ? icon('check') : ''}</span><span>${note.title}</span></a>`).join('')}</div>` : ''}`;
        }).join('')}
      </nav>
      <div class="side-foot">${icon('save')} <span id="storage-label">${storageAvailable ? '이 브라우저에 학습 기록 저장' : '현재 탭에만 기록 유지'}</span></div>`;
  }

  function renderHome() {
    const latest = state.latest;
    const done = doneCount(notes);
    const cta = lessonCta(notes);
    const examLabel = state.session ? '모의고사 이어 풀기' : '모의고사 풀기';
    const ctaLabel = cta.note ? (cta.label === '학습 시작' ? '개념 학습 시작' : cta.label) : cta.label;
    main.innerHTML = `
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-art" aria-hidden="true">${subject.heroArt}</div>
        <div class="hero-content">
          <h1 class="hero-title" id="hero-title">${subject.heroTitle}</h1>
          <p>${subject.lede}</p>
          <div class="actions">
            <a class="button primary" href="${cta.href}">${icon('play')} ${ctaLabel}</a>
            <a class="button" href="#exam">${icon('shuffle')} ${examLabel}</a>
          </div>
          ${cta.note ? `<p class="hero-next">다음 개념 · <a href="${cta.href}">${cta.note.title}</a></p>` : ''}
        </div>
      </section>
      <div class="home-stats">
        <a class="stat-card" href="#notes"><span>개념 학습</span><strong>${done}/${notes.length}</strong><span class="progress-line" aria-hidden="true"><i style="width:${done / notes.length * 100}%"></i></span></a>
        <a class="stat-card" href="${latest ? '#result' : '#exam'}"><span>최근 점수</span><strong>${latest ? latest.score + '점' : '—'}</strong></a>
        <a class="stat-card" href="#wrong"><span>다시 풀 오답</span><strong>${Object.keys(state.wrong).length}문제</strong></a>
        <a class="stat-card" href="#hints"><span>시험 힌트</span><strong>${hints.length}개</strong></a>
      </div>
      <section aria-labelledby="home-notes">
        <div class="section-head"><h2 id="home-notes">단원별 개념 학습</h2><a class="text-link" href="#notes">전체 보기 ${icon('right')}</a></div>
        <div class="unit-grid home-unit-grid">
          ${units.map(unit => {
            const list = unitNotes(unit.id);
            const count = doneCount(list);
            return `<a class="unit-card" href="#notes/${unit.id}" ${unitStyle(unit)}>
              ${unitIcon(unit)}<span class="unit-card-text"><strong>${unit.title}</strong><small>${unit.subtitle}</small><span class="progress-line" aria-hidden="true"><i style="width:${count / list.length * 100}%"></i></span></span><span class="unit-count" aria-label="${list.length}개 중 ${count}개 완료">${count}/${list.length}</span>
            </a>`;
          }).join('')}
        </div>
      </section>`;
  }

  function renderCourse() {
    const total = notes.length;
    const done = doneCount(notes);
    const cta = lessonCta(notes);
    const percent = Math.round(done / total * 100);
    const headline = done === total ? '모든 개념을 학습했어요' : done ? `${total - done}개 개념이 남았어요` : '첫 개념부터 시작해 보세요';
    main.innerHTML = pageHead('개념 학습',`${total}개 개념을 한 단계씩 넘기며 익혀요. ${subject.flow} 순서로 진행합니다.`) + `
      <section class="course-banner" aria-label="전체 진도">
        <div class="ring" style="--p:${percent}" role="img" aria-label="${total}개 중 ${done}개 완료"><span><b>${done}</b><small>/${total}</small></span></div>
        <div class="course-copy"><strong>${headline}</strong>${cta.note ? `<span class="small muted">다음 · ${cta.note.title}</span>` : '<span class="small muted">모의고사로 실력을 점검해 보세요.</span>'}</div>
        <a class="button primary" href="${cta.href}">${icon('play')} ${cta.label}</a>
      </section>
      <div class="section-head"><h2>단원</h2><a class="text-link" href="#summary">요약 노트로 훑어보기 ${icon('right')}</a></div>
      <div class="course-units">
        ${units.map(unit => {
          const list = unitNotes(unit.id);
          const count = doneCount(list);
          return `<a class="course-unit" href="#notes/${unit.id}" ${unitStyle(unit)}>
            ${unitIcon(unit)}
            <span class="course-unit-text"><strong>${unit.title}</strong><small>${unit.subtitle}</small><span class="progress-line" aria-hidden="true"><i style="width:${count / list.length * 100}%"></i></span></span>
            <span class="course-unit-count" aria-label="${list.length}개 중 ${count}개 완료">${count}/${list.length}</span>
          </a>`;
        }).join('')}
      </div>`;
  }

  function renderUnit(unit) {
    const list = unitNotes(unit.id);
    const count = doneCount(list);
    const cta = lessonCta(list);
    const quizCount = list.reduce((sum,note) => sum + noteQuestions(note.id).length,0);
    main.innerHTML = `
      <header class="unit-head" ${unitStyle(unit)}>
        <a class="lesson-back" href="#notes">${icon('left')} 개념 학습</a>
        <div class="unit-head-row">${unitIcon(unit)}<div><h1>${unit.title}</h1><p>${unit.subtitle} · 개념 ${list.length}개 · 확인 문제 ${quizCount}개</p></div></div>
        <div class="unit-progress"><span class="progress-line" aria-hidden="true"><i style="width:${count / list.length * 100}%"></i></span><span>${list.length}개 중 ${count}개 완료</span></div>
        <div class="actions">
          <a class="button primary" href="${cta.href}">${icon('play')} ${cta.label}</a>
          <a class="button" href="#exam/${unit.id}">${icon('shuffle')} 단원 모의고사</a>
        </div>
      </header>
      <ol class="lesson-list" ${unitStyle(unit)} aria-label="${unit.title} 개념 목록">
        ${list.map((note,index) => {
          const record = lessons.done[note.id];
          const upNext = cta.note === note;
          const score = record?.answered ? ` · ${record.answered}문제 중 ${record.correct}문제 정답` : '';
          return `<li><a class="lesson-row ${record ? 'done' : ''}" href="#learn/${note.id}" ${upNext ? 'data-next' : ''}>
            <span class="lesson-index" aria-hidden="true">${record ? icon('check') : index + 1}</span>
            <span class="lesson-row-text"><strong>${note.title}</strong><small>${record ? '완료 · ' : ''}${pageLabel(note)} · 확인 문제 ${noteQuestions(note.id).length}개${score}</small></span>
            ${upNext ? '<span class="lesson-badge">다음</span>' : ''}${icon('chevron')}
          </a></li>`;
        }).join('')}
      </ol>
      <p><a class="text-link" href="#summary/${unit.id}">이 단원 요약 노트 ${icon('right')}</a></p>`;
  }

  function renderSummary(unit, openId) {
    const displayed = unit ? [unitById.get(unit)] : units;
    main.innerHTML = pageHead('요약 노트','모든 개념을 한 페이지에 모은 요약본입니다. 시험 직전에 빠르게 훑어볼 때 쓰고, 처음 익힐 때는 단계별 학습을 이용하세요.') + `
      <nav class="pills" aria-label="요약 노트 단원 선택">
        <a class="pill" href="#summary" ${!unit ? 'aria-current="page"' : ''}>전체</a>
        ${units.map(item => `<a class="pill" href="#summary/${item.id}" ${item.id === unit ? 'aria-current="page"' : ''}>${item.title}</a>`).join('')}
      </nav>
      ${displayed.map(item => `<section class="concept-group" aria-labelledby="head-${item.id}">
        <div class="group-head">${unitIcon(item)}<h2 id="head-${item.id}">${item.title}</h2></div>
        ${unitNotes(item.id).map(note => {
          const resources = noteResources(note);
          return `
          <details class="note" id="${note.id}" ${note.id === openId ? 'open' : ''}>
            <summary><span class="note-text"><span class="note-title">${note.title}</span><small class="note-sub">${note.sheet ? note.sheet[1] : note.cue}</small></span><span class="note-page">${lessons.done[note.id] ? '완료 · ' : ''}${pageLabel(note)}</span>${icon('chevron')}</summary>
            <div class="note-body">
              <dl class="terms">${note.terms.map(([term,definition]) => `<div class="term"><dt>${term}</dt><dd>${definition}</dd></div>`).join('')}</dl>
              <div class="callout"><strong>암기 단서</strong> ${note.cue}</div>
              ${resources ? `<div class="note-resources">${resources}</div>` : ''}
              <div class="note-actions"><a class="text-link" href="#learn/${note.id}">단계별 학습 ${icon('right')}</a><a class="text-link" href="#exam/${item.id}">이 단원 문제 풀기 ${icon('right')}</a></div>
            </div>
          </details>`;
        }).join('')}
      </section>`).join('')}`;
    if (openId) byId(openId).scrollIntoView({block:'start'});
  }

  function lessonSteps(note) {
    if (stepCache.has(note.id)) return stepCache.get(note.id);
    const steps = [{kind:'intro', label:introLabel}];
    const chunks = [];
    let chunk = [];
    let size = 0;
    for (const term of note.terms) {
      const length = term[0].length + term[1].length;
      if (chunk.length && (chunk.length === 3 || size + length > 180)) {
        chunks.push(chunk);
        chunk = [];
        size = 0;
      }
      chunk.push(term);
      size += length;
    }
    if (chunk.length) chunks.push(chunk);
    let termIndex = 0;
    chunks.forEach((terms,index) => {
      const label = hasSummaryStep ? (chunks.length > 1 ? `개념 ${index + 1}/${chunks.length}` : '개념') : '자세히 보기';
      steps.push({kind:'terms', label, terms, first:termIndex, last:index === chunks.length - 1});
      termIndex += terms.length;
    });
    if (hasSummaryStep) steps.push({kind:'summary', label:'한눈에 정리'});
    const quiz = noteQuestions(note.id);
    quiz.forEach((question,index) => steps.push({kind:'quiz', label:`확인 문제 ${index + 1}/${quiz.length}`, question}));
    steps.push({kind:'done', label:'완료'});
    stepCache.set(note.id,steps);
    return steps;
  }

  function choiceOrder(question) {
    if (!lesson.orders.has(question.id)) {
      lesson.orders.set(question.id, question.type === 'O/X' ? [0,1] : shuffle(question.options.map((_,index) => index)));
    }
    return lesson.orders.get(question.id);
  }

  function renderTermsStep(step) {
    const note = lesson.note;
    const resources = !hasSummaryStep && step.last ? noteResources(note) : '';
    return `
      <dl class="lesson-terms">
        ${step.terms.map(([term,definition],index) => {
          const key = 't' + (step.first + index);
          const hidden = lessons.recall && !lesson.revealed.has(key);
          return `<div class="lesson-term"><dt class="term-name">${term}</dt><dd class="term-def" data-revealed="${key}" tabindex="-1">${hidden ? revealButton(key,'뜻 확인하기') : definition}</dd></div>`;
        }).join('')}
      </dl>
      ${resources ? `<div class="resources">${resources}</div>` : ''}`;
  }

  function renderSummaryStep() {
    const note = lesson.note;
    const resources = noteResources(note);
    return `
      <h2 class="step-title">핵심 한 줄</h2>
      <p class="cue-line">${note.cue}</p>
      <p class="step-lead">아래 용어를 말로 설명할 수 있다면 확인 문제로 넘어가세요.</p>
      <ul class="keyword-chips">${note.terms.map(([term]) => `<li>${term}</li>`).join('')}</ul>
      ${resources ? `<div class="resources">${resources}</div>` : ''}`;
  }

  function renderQuizStep(step) {
    const question = step.question;
    const order = choiceOrder(question);
    const answered = lesson.answers.has(question.id);
    const choice = lesson.answers.get(question.id);
    const correct = answered && choice === question.answer;
    const isOX = question.type === 'O/X';
    const optionLabel = option => isOX ? (option === 0 ? '맞다 (O)' : '틀리다 (X)') : question.options[option];
    return `<p class="step-kicker">${question.type}</p>
      <h2 class="quiz-prompt" id="quiz-prompt">${question.prompt}</h2>
      <div class="quiz-choices" role="group" aria-labelledby="quiz-prompt">
        ${order.map((option,index) => {
          const status = !answered ? '' : option === question.answer ? 'correct' : option === choice ? 'wrong' : 'dim';
          const mark = status === 'correct' ? icon('check') : status === 'wrong' ? icon('close') : '';
          return `<button type="button" class="quiz-choice ${status}" data-answer="${option}" ${answered ? 'aria-disabled="true"' : ''}>
            <span class="choice-key" aria-hidden="true">${isOX ? question.options[option] : index + 1}</span><span class="choice-text">${optionLabel(option)}</span>${mark}
          </button>`;
        }).join('')}
      </div>
      <div class="feedback ${answered ? (correct ? 'good' : 'bad') : ''}" id="quiz-feedback" tabindex="-1">${answered ? `
        <strong>${icon(correct ? 'check' : 'close')} ${correct ? '정답이에요' : '아쉬워요, 정답은 ' + optionLabel(question.answer)}</strong>
        <p>${question.explanation}</p>${correct ? '' : '<p class="small muted">이 문제는 오답 노트에 담았어요.</p>'}` : ''}</div>`;
  }

  function renderDoneStep() {
    const note = lesson.note;
    const unit = unitById.get(note.unit);
    const record = lessons.done[note.id];
    const next = nextNote(note);
    const missed = [...lesson.answers].filter(([id,choice]) => questionById.get(id).answer !== choice).length;
    const score = record?.answered ? `확인 문제 ${record.answered}문제 중 <b>${record.correct}문제</b>를 맞혔어요.` : '확인 문제는 건너뛰었어요. 모의고사에서 다시 확인해 보세요.';
    return `<div class="done-mark">${icon('check')}</div>
      <p class="step-kicker">개념 완료</p>
      <h2 class="step-title">${note.title}</h2>
      <p class="done-score">${score}</p>
      ${missed ? `<p><a class="text-link" href="#wrong">틀린 ${missed}문제는 오답 노트에서 다시 풀 수 있어요 ${icon('right')}</a></p>` : ''}
      ${next ? `<a class="next-card" href="#learn/${next.id}"><span><small>다음 개념 · ${unitById.get(next.unit).title}</small><strong>${next.title}</strong></span>${icon('right')}</a>`
        : `<a class="next-card" href="#exam"><span><small>마지막 개념까지 마쳤어요</small><strong>전체 모의고사로 점검하기</strong></span>${icon('right')}</a>`}
      <div class="actions">
        <a class="button" href="#exam/${unit.id}">${icon('shuffle')} ${unit.title} 모의고사</a>
        <a class="button" href="#notes/${unit.id}">${icon('list')} 단원 목차</a>
      </div>`;
  }

  function renderStep(step) {
    switch (step.kind) {
      case 'intro': return renderIntro(lesson.note);
      case 'terms': return renderTermsStep(step);
      case 'summary': return renderSummaryStep();
      case 'quiz': return renderQuizStep(step);
      default: return renderDoneStep();
    }
  }

  function markDone() {
    const note = lesson.note;
    const answered = [...lesson.answers];
    const correct = answered.filter(([id,choice]) => questionById.get(id).answer === choice).length;
    if (answered.length || !lessons.done[note.id]) {
      lessons.done[note.id] = {at:Date.now(), correct, answered:answered.length, total:noteQuestions(note.id).length};
    }
    renderSidebar('learn',note.unit,note.id);
  }

  function updateLessonChrome() {
    const {steps,step} = lesson;
    byId('step-bar').querySelectorAll('button').forEach((button,index) => {
      const item = steps[index];
      const answered = item.kind === 'quiz' && lesson.answers.has(item.question.id);
      const correct = answered && lesson.answers.get(item.question.id) === item.question.answer;
      button.classList.toggle('seen',lesson.seen.has(index));
      button.classList.toggle('good',correct);
      button.classList.toggle('bad',answered && !correct);
      if (index === step) button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    });
    const current = steps[step];
    byId('step-name').textContent = current.label;
    byId('lesson-pos').textContent = `${step + 1} / ${steps.length}`;
    byId('lesson-prev').disabled = step === 0;
    const next = byId('lesson-next');
    let label = '다음';
    if (current.kind === 'quiz' && !lesson.answers.has(current.question.id)) label = '건너뛰기';
    if (current.kind === 'done') label = nextNote(lesson.note) ? '다음 개념' : '모의고사';
    next.innerHTML = `${label} ${icon('right')}`;
    next.classList.toggle('primary',!(current.kind === 'quiz' && label === '건너뛰기'));
    byId('step-status').textContent = `${steps.length}단계 중 ${step + 1}단계, ${current.label}`;
  }

  function drawStep(direction = 0) {
    const stage = byId('lesson-stage');
    if (!stage || !lesson) return;
    const step = lesson.steps[lesson.step];
    lesson.seen.add(lesson.step);
    if (step.kind === 'done') markDone();
    lessons.last = {id:lesson.note.id, step:lesson.step, at:Date.now()};
    saveLessons();
    stage.style.transition = '';
    stage.style.transform = '';
    stage.style.opacity = '';
    stage.dataset.kind = step.kind;
    stage.innerHTML = renderStep(step);
    updateLessonChrome();
    if (direction && !reduceMotion.matches) {
      stage.animate([
        {transform:`translateX(${direction * 36}px)`, opacity:0},
        {transform:'none', opacity:1}
      ], {duration:320, easing:'cubic-bezier(.2,.8,.2,1)'});
    }
  }

  function goStep(index, direction = index > lesson?.step ? 1 : -1) {
    if (!lesson || index < 0 || index >= lesson.steps.length || index === lesson.step) return;
    lesson.step = index;
    history.replaceState(null,'',`#learn/${lesson.note.id}/${index + 1}`);
    selectedRoute = location.hash;
    drawStep(direction);
    const head = main.querySelector('.lesson-head');
    if (head && head.getBoundingClientRect().top < 0) head.scrollIntoView({block:'start', behavior:reduceMotion.matches ? 'auto' : 'smooth'});
  }

  function advance() {
    if (!lesson) return;
    if (lesson.step < lesson.steps.length - 1) {
      goStep(lesson.step + 1,1);
      return;
    }
    const next = nextNote(lesson.note);
    location.hash = next ? '#learn/' + next.id : '#exam';
  }

  function retreat() {
    if (lesson && lesson.step > 0) goStep(lesson.step - 1,-1);
  }

  function answerQuiz(choice) {
    const step = lesson?.steps[lesson.step];
    if (step?.kind !== 'quiz' || lesson.answers.has(step.question.id)) return;
    const question = step.question;
    lesson.answers.set(question.id,choice);
    if (choice === question.answer) delete state.wrong[question.id];
    else state.wrong[question.id] = {choice, misses:(state.wrong[question.id]?.misses ?? 0) + 1};
    saveState();
    drawStep(0);
    const feedback = byId('quiz-feedback');
    feedback.focus({preventScroll:true});
    feedback.scrollIntoView({block:'nearest', behavior:reduceMotion.matches ? 'auto' : 'smooth'});
  }

  function reveal(key) {
    lesson.revealed.add(key);
    drawStep(0);
    main.querySelector(`[data-revealed="${key}"]`)?.focus({preventScroll:true});
  }

  function toggleRecall(button) {
    lessons.recall = !lessons.recall;
    lesson.revealed.clear();
    saveLessons();
    button.setAttribute('aria-pressed',String(lessons.recall));
    drawStep(0);
  }

  function bindSwipe(stage) {
    let drag = null;
    const reset = () => {
      stage.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1), opacity .25s';
      stage.style.transform = '';
      stage.style.opacity = '';
    };
    stage.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' || !event.isPrimary) return;
      drag = {x:event.clientX, y:event.clientY, time:event.timeStamp, id:event.pointerId, dx:0, active:false};
    });
    stage.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.active) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        if (Math.abs(dy) >= Math.abs(dx)) {
          drag = null;
          return;
        }
        drag.active = true;
        try { stage.setPointerCapture(event.pointerId); } catch {}
      }
      drag.dx = dx > 0 && lesson.step === 0 ? dx / 4 : dx;
      stage.style.transition = 'none';
      stage.style.transform = `translateX(${drag.dx}px)`;
      stage.style.opacity = String(1 - Math.min(Math.abs(drag.dx) / stage.offsetWidth,1) * .35);
    });
    const finish = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const {dx,active,time} = drag;
      drag = null;
      if (!active) return;
      suppressClickUntil = Date.now() + 400;
      const distance = Math.abs(dx);
      const velocity = distance / Math.max(1,event.timeStamp - time);
      const forward = dx < 0;
      const allowed = forward || lesson.step > 0;
      const commit = event.type === 'pointerup' && allowed && (distance > Math.min(90,stage.offsetWidth * .22) || (velocity > .5 && distance > 30));
      if (!commit) {
        reset();
        return;
      }
      const go = () => forward ? advance() : retreat();
      if (reduceMotion.matches) {
        go();
        return;
      }
      stage.style.transition = 'transform .18s ease-in, opacity .18s ease-in';
      stage.style.transform = `translateX(${(forward ? -1 : 1) * stage.offsetWidth * .6}px)`;
      stage.style.opacity = '0';
      setTimeout(go,170);
    };
    stage.addEventListener('pointerup',finish);
    stage.addEventListener('pointercancel',finish);
    stage.addEventListener('click', event => {
      if (Date.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }

  function renderLesson(note, stepParam) {
    const steps = lessonSteps(note);
    let step = Number.parseInt(stepParam,10) - 1;
    if (!(step >= 0 && step < steps.length)) {
      step = lessons.last?.id === note.id && !lessons.done[note.id] ? Math.min(lessons.last.step,steps.length - 1) : 0;
    }
    if (lesson?.note !== note) {
      lesson = {note, steps, step, answers:new Map(), orders:new Map(), revealed:new Set(), seen:new Set()};
      for (let index = 0; index < step; index++) lesson.seen.add(index);
    } else {
      lesson.step = step;
    }
    const unit = unitById.get(note.unit);
    const position = notes.indexOf(note) + 1;
    main.innerHTML = `
      <div class="lesson" ${unitStyle(unit)}>
        <header class="lesson-head">
          <a class="lesson-back" href="#notes/${unit.id}">${icon('left')} ${unit.title}</a>
          <h1 class="lesson-title">${note.title}</h1>
          <p class="lesson-sub">${position}번째 개념 · 전체 ${notes.length}개 · ${pageLabel(note)}</p>
          <div class="step-bar" id="step-bar" role="group" aria-label="학습 단계로 이동">
            ${steps.map((item,index) => `<button type="button" data-goto="${index}" aria-label="${index + 1}단계 ${item.label}" title="${item.label}"><span></span></button>`).join('')}
          </div>
          <div class="step-label"><b id="step-name"></b>
            <button type="button" class="recall-toggle" data-action="recall" aria-pressed="${lessons.recall}" title="뜻과 정답을 가리고 떠올려 본 뒤 확인합니다">${icon('eye')} 가리고 외우기</button>
          </div>
        </header>
        <div class="lesson-viewport"><section class="step-card" id="lesson-stage" aria-label="학습 카드"></section></div>
        <nav class="lesson-nav" aria-label="단계 이동">
          <button class="button" type="button" id="lesson-prev" data-action="prev">${icon('left')} 이전</button>
          <span class="lesson-pos" id="lesson-pos" aria-hidden="true"></span>
          <button class="button primary" type="button" id="lesson-next" data-action="next"></button>
        </nav>
        <p class="lesson-tip"><span class="keys">← → 방향키로 넘기고, 숫자 키로 답을 고를 수 있어요.</span><span class="touch">카드를 옆으로 밀어서 넘길 수 있어요.</span></p>
        <p class="sr-only" id="step-status" aria-live="polite"></p>
      </div>`;
    bindSwipe(byId('lesson-stage'));
    drawStep(0);
  }

  function lessonKeydown(event) {
    if (!lesson || !byId('lesson-stage') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (document.querySelector('dialog[open]') || document.body.classList.contains('menu-open')) return;
    if (event.target instanceof Element && event.target.closest('input, select, textarea, [contenteditable]')) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      advance();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      retreat();
    } else if (/^[1-4]$/.test(event.key)) {
      const step = lesson.steps[lesson.step];
      if (step.kind !== 'quiz') return;
      const option = choiceOrder(step.question)[Number(event.key) - 1];
      if (option !== undefined) answerQuiz(option);
    }
  }

  function handleLessonClick(button) {
    if (!lesson) return false;
    if (button.dataset.goto !== undefined) goStep(Number(button.dataset.goto));
    else if (button.dataset.answer !== undefined) answerQuiz(Number(button.dataset.answer));
    else if (button.dataset.reveal) reveal(button.dataset.reveal);
    else if (button.dataset.action === 'prev') retreat();
    else if (button.dataset.action === 'next') advance();
    else if (button.dataset.action === 'recall') toggleRecall(button);
    else return false;
    return true;
  }

  function renderRoute(forceFocus = false) {
    let [requested = '',detail,stepParam] = location.hash.slice(1).split('/');
    if (requested === 'notes' && noteById.has(detail)) {
      history.replaceState(null,'','#learn/' + detail);
      requested = 'learn';
    }
    let view = ['notes','learn','summary','exam','wrong','hints','result'].includes(requested) ? requested : 'home';
    const note = view === 'learn' || view === 'summary' ? noteById.get(detail) ?? null : null;
    if (view === 'learn' && !note) {
      history.replaceState(null,'','#notes');
      view = 'notes';
    }
    if (view !== 'learn') lesson = null;
    const unit = note?.unit ?? (unitById.has(detail) ? detail : '');
    const unitItem = unitById.get(unit);
    const title = primaryNav.find(([key]) => key === view)?.[1] ?? '모의고사 결과';
    const trail = view === 'learn' ? ['개념 학습',unitItem.title,note.title] : view === 'notes' && unitItem ? ['개념 학습',unitItem.title] : [title];
    const changed = selectedRoute !== location.hash;
    selectedRoute = location.hash;
    setNavOpen(false);
    renderSidebar(view,unit,note?.id);
    byId('breadcrumb').innerHTML = [subject.name,...trail].map((part,index,all) => index === all.length - 1 ? `<b>${part}</b>` : `<span>${part}</span>${icon('chevron')}`).join('');
    if (changed || forceFocus) {
      main.focus({preventScroll:true});
      window.scrollTo(0,0);
    }
    switch (view) {
      case 'notes': unitItem ? renderUnit(unitItem) : renderCourse(); break;
      case 'learn': renderLesson(note,stepParam); break;
      case 'summary': renderSummary(unit,note?.id); break;
      case 'hints': renderHints(); break;
      case 'exam':
        if (state.session && !unit) renderExam();
        else renderConfig(unit || 'all',Boolean(state.session));
        break;
      case 'result': renderResult(); break;
      case 'wrong': renderWrong(); break;
      default: renderHome();
    }
  }

  function updateSearch() {
    const query = byId('search-input').value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = notes.filter(note => {
      const searchable = [note.title,note.page,note.cue,...note.terms.flat(),...(note.sheet ?? []),unitById.get(note.unit).title].join(' ').toLowerCase();
      return query.every(word => searchable.includes(word));
    });
    byId('search-results').innerHTML = matches.map(note => `<a class="search-result" href="${noteHref(note.id)}"><strong>${note.title}</strong><small>${lessons.done[note.id] ? '완료 · ' : ''}${pageLabel(note)}</small></a>`).join('') || '<p class="small muted">일치하는 개념이 없습니다.</p>';
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const toggle = byId('theme-toggle');
    const label = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
    toggle.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    try { localStorage.setItem(subject.theme,theme); } catch {}
  }

  function pageHead(title, description) {
    return `<header class="page-head"><h1>${title}</h1><p>${description}</p></header>`;
  }

  function renderHints() {
    main.innerHTML = pageHead('시험 힌트',subject.hintsDescription) + `
      <table class="hint-table" aria-label="시험 힌트 ${hints.length}개">
        <thead><tr><th scope="col">번호</th><th scope="col">${subject.hintColumn}</th><th scope="col">출처</th></tr></thead>
        <tbody>${hints.map(([title,page,id,detail],index) => `<tr>
          <td>${String(index + 1).padStart(2,'0')}</td>
          <td><a href="${noteHref(id)}">${title}</a>${detail ? `<small>${detail}</small>` : ''}</td>
          <td>${page}</td>
        </tr>`).join('')}</tbody>
      </table>`;
  }

  function chooseQuestions(pool,count) {
    const groups = new Map();
    for (const question of shuffle(pool)) {
      if (!groups.has(question.noteId)) groups.set(question.noteId,[]);
      groups.get(question.noteId).push(question);
    }
    const picked = [];
    while (picked.length < count) {
      for (const group of shuffle(groups.values())) {
        if (group.length) picked.push(group.pop());
        if (picked.length === count) break;
      }
    }
    return shuffle(picked);
  }

  function startExam(pool,count,label) {
    if (!pool.length) return;
    state.session = {
      items:chooseQuestions(pool, Math.min(pool.length,count)).map(question => ({
        id:question.id,
        order:question.type === 'O/X' ? [0,1] : shuffle([0,1,2,3]),
        choice:null
      })),
      index:0,
      started:Date.now(),
      label
    };
    saveState();
    if (location.hash === '#exam') renderRoute(true);
    else location.hash = '#exam';
  }

  function getPool(unit) {
    return unit === 'all' ? questions : questions.filter(question => questionUnit(question).id === unit);
  }

  function renderConfig(unit, replacing = false) {
    main.innerHTML = pageHead('랜덤 모의고사','단원과 문항 수를 고르면 객관식과 O/X 문제 중에서 무작위로 출제합니다. 제출하면 점수와 해설을 볼 수 있어요.') + `
      <form class="panel exam-config" id="exam-config">
        ${replacing ? '<p class="callout">새 모의고사를 시작하면 풀고 있던 회차가 교체됩니다.</p>' : ''}
        <div class="form-grid">
          <label>시험 범위<select id="exam-scope" name="scope"><option value="all">전체 단원</option>
            ${units.map(item => `<option value="${item.id}" ${item.id === unit ? 'selected' : ''}>${item.title}</option>`).join('')}
          </select></label>
          <label>문항 수<select id="exam-count" name="count"></select></label>
        </div>
        <p class="small muted" id="pool-info"></p>
        <div class="actions">
          <button class="button primary" type="submit">${icon('shuffle')} 모의고사 시작</button>
          ${replacing ? `<button class="button" type="button" data-action="resume">이어 풀기</button>` : ''}
          ${state.latest ? `<a class="text-link" href="#result">최근 결과 보기 ${icon('right')}</a>` : ''}
        </div>
      </form>`;

    function updateCounts() {
      const size = getPool(byId('exam-scope').value).length;
      const options = [5,10,15,20].filter(count => count < size);
      byId('exam-count').innerHTML = options.map(count => `<option value="${count}">${count}문항</option>`).join('') + `<option value="${size}">전체 ${size}문항</option>`;
      byId('exam-count').value = String(Math.min(size,byId('exam-scope').value === 'all' ? notes.length : 10));
      byId('pool-info').textContent = `이 범위의 문제 은행에 ${size}문제가 있습니다.` + (byId('exam-scope').value === 'all' ? ` 전체 범위에서 ${notes.length}문항을 선택하면 ${subject.hintLabel} 항목마다 한 문제씩 출제됩니다.` : '');
    }

    byId('exam-scope').addEventListener('change', updateCounts);
    byId('exam-config').addEventListener('submit', event => {
      event.preventDefault();
      const scope = byId('exam-scope').value;
      startExam(getPool(scope), Number(byId('exam-count').value), unitById.get(scope)?.title ?? '전체 단원');
    });
    updateCounts();
  }

  const countAnswered = session => session.items.filter(item => item.choice !== null).length;
  function elapsedLabel(ms) {
    const seconds = Math.max(0,Math.floor(ms/1000));
    return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  }

  function renderSheet(session) {
    return `
      <div class="sheet-grid">
        ${session.items.map((item,index) => {
          const answered = item.choice !== null;
          return `<button type="button" data-jump="${index}" class="${answered ? 'answered' : ''}" aria-label="${index + 1}번 문제, ${answered ? '응답함' : '미응답'}" ${index === session.index ? 'aria-current="step"' : ''}>${index + 1}</button>`;
        }).join('')}
      </div>
      <p class="muted small sheet-legend">색이 채워진 번호는 답을 고른 문제입니다.</p>
      <div class="sheet-actions">
        <button type="button" class="button primary" data-action="submit">제출하기</button>
        <button type="button" class="button" data-action="new-config">새 시험 설정</button>
      </div>`;
  }

  function openSheet() {
    const dialog = byId('sheet-dialog');
    byId('sheet-dialog-content').innerHTML = renderSheet(state.session);
    dialog.showModal();
    dialog.querySelector('[aria-current="step"]').scrollIntoView({block:'nearest'});
  }

  function renderExam() {
    const session = state.session;
    const current = session.items[session.index];
    const question = questionById.get(current.id);
    const unit = questionUnit(question);
    const total = session.items.length;
    main.innerHTML = pageHead('랜덤 모의고사', session.label + ' · ' + total + '문항') + `
      <div class="exam-top">
        <div class="exam-status"><span id="exam-progress" aria-live="polite"></span><span class="tabular" aria-label="경과 시간">${icon('clock')} <span id="elapsed"></span></span></div>
        <div class="progress-track" role="progressbar" aria-label="응답 진행률" aria-valuemin="0" aria-valuemax="${total}"><span></span></div>
      </div>
      <div class="exam-grid">
        <section class="panel" aria-labelledby="question-heading">
          <div class="question-meta"><b>${session.index+1} / ${total}</b> ${unit.title} · ${question.type}</div>
          <h2 class="question-title" id="question-heading" tabindex="-1">${question.prompt}</h2>
          <div class="choices" role="radiogroup" aria-labelledby="question-heading">
            ${current.order.map((option,index) => `<label class="choice">
              <input type="radio" name="answer" value="${option}" ${current.choice === option ? 'checked' : ''}>
              <span class="choice-key" aria-hidden="true">${question.type === 'O/X' ? question.options[option] : index+1}</span>
              <span>${question.type === 'O/X' ? (option === 0 ? '맞다 (O)' : '틀리다 (X)') : question.options[option]}</span>
            </label>`).join('')}
          </div>
          <div class="actions exam-nav">
            <button class="button" type="button" data-jump="${session.index - 1}" ${session.index === 0 ? 'disabled' : ''}>${icon('left')} 이전</button>
            <button class="button mobile-sheet" type="button" data-action="open-sheet" aria-haspopup="dialog" aria-controls="sheet-dialog">${icon('list')} 답안지</button>
            ${session.index < total - 1 ? `<button class="button" type="button" data-jump="${session.index + 1}">다음 ${icon('right')}</button>` : `<button class="button primary" type="button" data-action="submit">제출하기</button>`}
          </div>
        </section>
        <aside class="panel sheet" aria-labelledby="sheet-heading">
          <h2 id="sheet-heading">답안지</h2>
          ${renderSheet(session)}
        </aside>
      </div>
      <dialog id="sheet-dialog" aria-labelledby="sheet-dialog-title">
        <div class="dialog-inner">
          <div class="sheet-header">
            <h2 id="sheet-dialog-title">답안지</h2>
            <button class="icon-button" type="button" data-action="close-sheet" aria-label="답안지 닫기" autofocus>${icon('close')}</button>
          </div>
          <div id="sheet-dialog-content"></div>
        </div>
      </dialog>`;
    updateExamStatus();
    updateClock();
  }

  function updateExamStatus() {
    const session = state.session;
    const count = countAnswered(session);
    const total = session.items.length;
    byId('exam-progress').textContent = `${total}문항 중 ${count}문항 응답`;
    const track = main.querySelector('.progress-track');
    track.setAttribute('aria-valuenow', count);
    track.firstElementChild.style.width = (count / total * 100) + '%';
    const answered = session.items[session.index].choice !== null;
    const current = main.querySelector('.sheet [aria-current="step"]');
    current.classList.toggle('answered',answered);
    current.setAttribute('aria-label',`${session.index + 1}번 문제, ${answered ? '응답함' : '미응답'}`);
  }

  function updateClock() {
    const clock = byId('elapsed');
    if (clock && state.session) clock.textContent = elapsedLabel(Date.now()-state.session.started);
  }

  function openSubmit() {
    const session = state.session;
    const blank = session.items.length-countAnswered(session);
    byId('submit-message').textContent = blank ? `미응답 ${blank}문항은 오답으로 처리됩니다.` : '모든 문항에 답했습니다.';
    byId('submit-dialog').showModal();
  }

  function gradeExam() {
    const session = state.session;
    if (!session) return;
    let correct = 0;
    for (const item of session.items) {
      if (item.choice === questionById.get(item.id).answer) {
        correct++;
        delete state.wrong[item.id];
      } else {
        state.wrong[item.id] = {choice:item.choice, misses:(state.wrong[item.id]?.misses ?? 0)+1};
      }
    }
    state.latest = {
      ...session,
      correct,
      score:Math.round(correct/session.items.length*100),
      duration:Date.now()-session.started
    };
    state.session = null;
    showWrongOnly = false;
    saveState();
    byId('submit-dialog').close();
    location.hash = '#result';
  }

  function reviewItem(item,label,open=false) {
    const question = questionById.get(item.id);
    const note = noteById.get(question.noteId);
    const correct = item.choice === question.answer;
    const tag = correct ? '정답' : item.choice === null ? '미응답' : '오답';
    return `<details class="review-item" ${open ? 'open' : ''}>
      <summary>${label ? `<span class="muted">${label}</span>` : ''}<span class="result-tag ${correct ? 'good' : 'bad'}">${tag}</span> ${question.prompt}</summary>
      <div class="review-body">
        <p>내 답 <strong>${item.choice === null ? '미응답' : question.options[item.choice]}</strong></p>
        <p>정답 <strong class="review-answer">${question.options[question.answer]}</strong></p>
        <p>${question.explanation}</p>
        <div class="note-actions">${noteLink(note.id)}</div>
      </div>
    </details>`;
  }

  function renderResult() {
    const result = state.latest;
    if (!result) {
      main.innerHTML = pageHead('모의고사 결과','제출한 모의고사의 점수와 해설을 확인할 수 있습니다.') +
        empty('아직 제출한 모의고사가 없어요','먼저 모의고사를 한 회 풀어 보세요.','exam','모의고사 풀기','list');
      return;
    }
    const total = result.items.length;
    main.innerHTML = pageHead('모의고사 결과',result.label + ' · ' + total + '문항') + `
      <section class="score-banner" aria-label="채점 결과">
        <div><h2>${result.score}점</h2><p>${total}문항 중 ${result.correct}문항 정답 · 경과 시간 ${elapsedLabel(result.duration)}</p></div>
        <div class="actions"><a class="button primary" href="#exam">${icon('shuffle')} 새 모의고사</a><a class="button" href="#wrong">오답 노트</a></div>
      </section>
      <div class="section-head review-title"><h2>문항별 해설</h2><label class="small"><input type="checkbox" id="filter-wrong" ${showWrongOnly ? 'checked' : ''}> 틀린 문제만</label></div>
      <div class="review-list" id="review-results"></div>`;
    renderReviewResults();
  }

  function renderReviewResults() {
    const items = state.latest.items.map((item,index) => ({...item,number:index+1}));
    const filtered = items.filter(item => !showWrongOnly || item.choice !== questionById.get(item.id).answer);
    byId('review-results').innerHTML = filtered.map(item => reviewItem(item,item.number + '번')).join('') || '<p class="panel small muted">이번 시험에서 틀린 문제가 없어요.</p>';
  }

  function empty(title,description,route,label,symbol) {
    return `<section class="panel empty">${icon(symbol)}<h2>${title}</h2><p class="small">${description}</p><a class="button primary" href="#${route}">${label}</a></section>`;
  }

  function renderWrong() {
    const missed = Object.entries(state.wrong);
    main.innerHTML = pageHead('오답 노트','틀렸거나 건너뛴 문제를 모아 둡니다. 다시 풀어서 맞히면 목록에서 빠집니다.');
    if (!missed.length) {
      main.innerHTML += empty('다시 풀 오답이 없어요','모의고사를 제출하면 틀린 문제가 이곳에 모입니다.','exam','모의고사 풀기','check');
      return;
    }
    main.innerHTML += `<div class="section-head"><h2>${missed.length}문제</h2>
        <button class="button primary" data-action="retry-wrong" ${state.session ? 'disabled' : ''}>${icon('undo')} 오답 다시 풀기</button></div>
      ${state.session ? '<p class="callout" style="margin:0 0 12px">풀고 있는 시험을 제출하면 오답을 다시 풀 수 있어요. <a class="text-link" href="#exam">이어 풀기 →</a></p>' : ''}
      <div class="review-list">
        ${missed.map(([id,entry]) => reviewItem({id,...entry},entry.misses + '회')).join('')}
      </div>`;
  }

  function openSearch() {
    const dialog = byId('search-dialog');
    if (dialog.open || byId('submit-dialog').open) return;
    byId('search-input').value = '';
    updateSearch();
    dialog.showModal();
    byId('search-input').focus();
  }

  byId('mobile-menu').innerHTML = icon('menu');
  byId('mobile-menu').addEventListener('click', () => setNavOpen(true));
  byId('sidebar').addEventListener('click', event => {
    if (mobile.matches && event.target.closest('a, #close-menu')) setNavOpen(false);
  });
  byId('nav-overlay').addEventListener('click', () => setNavOpen(false));
  mobile.addEventListener('change', () => {
    setNavOpen(false);
    byId('sheet-dialog')?.close();
  });
  byId('search-trigger').innerHTML = icon('search') + '<span>개념 검색</span><kbd>Ctrl K</kbd>';
  byId('search-trigger').setAttribute('aria-label','개념 검색');
  byId('search-trigger').addEventListener('click',openSearch);
  byId('search-input').addEventListener('input',updateSearch);
  byId('search-input').addEventListener('keydown', event => {
    if (event.key === 'Enter') byId('search-results').querySelector('a')?.click();
  });
  byId('search-results').addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    byId('search-dialog').close();
    if (event.target.closest('a').hash === location.hash) renderRoute(true);
  });
  byId('theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  document.querySelectorAll('.close-dialog').forEach(button => {
    button.innerHTML ||= icon('close');
    button.addEventListener('click', () => button.closest('dialog').close());
  });
  byId('confirm-submit').addEventListener('click',gradeExam);
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
    }
    if (event.key === 'Escape' && byId('sidebar').classList.contains('open')) setNavOpen(false);
    lessonKeydown(event);
  });
  document.querySelector('.skip-link').addEventListener('click',event => {
    event.preventDefault();
    main.focus();
  });
  main.addEventListener('change',event => {
    if (event.target.name === 'answer' && state.session) {
      state.session.items[state.session.index].choice = Number(event.target.value);
      saveState();
      updateExamStatus();
    }
    if (event.target.id === 'filter-wrong') {
      showWrongOnly = event.target.checked;
      renderReviewResults();
    }
  });
  main.addEventListener('click',event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    button.closest('#sheet-dialog')?.close();
    if (handleLessonClick(button)) return;
    if (button.dataset.jump !== undefined && state.session) {
      state.session.index = Number(button.dataset.jump);
      saveState();
      renderExam();
      const heading = byId('question-heading');
      heading.focus({preventScroll:true});
      heading.scrollIntoView({block:'start'});
    }
    switch (button.dataset.action) {
      case 'open-sheet': openSheet(); break;
      case 'submit': openSubmit(); break;
      case 'new-config': renderConfig('all',true); byId('exam-scope').focus(); break;
      case 'resume':
        if (location.hash === '#exam') renderRoute(true);
        else location.hash = '#exam';
        break;
      case 'retry-wrong': {
        const missed = Object.keys(state.wrong).map(id => questionById.get(id));
        startExam(missed,missed.length,'오답 다시 풀기');
        break;
      }
    }
  });

  window.addEventListener('hashchange',() => renderRoute(true));
  setTheme(document.documentElement.dataset.theme);
  renderRoute();
  setInterval(updateClock,1000);
})();
