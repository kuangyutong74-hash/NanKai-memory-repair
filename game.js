// 题库、阶段名称、建筑故事与照片均由定稿 DOCX 生成。
const stageCatalog = contentData.stageCatalog;
const chapters = contentData.chapters;
const catalogById = Object.fromEntries(stageCatalog.map(stage => [stage.id, stage]));
const stages = chapters.flatMap(chapter => chapter.stageIds.map(id => catalogById[id]));
const irregularFragments = {
  4: [
    { polygon: "polygon(0 0,52% 0,48% 45%,0 55%)", label: [25, 24] },
    { polygon: "polygon(52% 0,100% 0,100% 48%,48% 45%)", label: [75, 24] },
    { polygon: "polygon(0 55%,48% 45%,55% 100%,0 100%)", label: [25, 76] },
    { polygon: "polygon(48% 45%,100% 48%,100% 100%,55% 100%)", label: [76, 76] }
  ],
  5: [
    { polygon: "polygon(0 0,50% 0,52% 30%,38% 36%,0 32%)", label: [23, 16] },
    { polygon: "polygon(50% 0,100% 0,100% 40%,68% 38%,52% 30%)", label: [76, 18] },
    { polygon: "polygon(0 32%,38% 36%,45% 58%,30% 72%,0 68%)", label: [20, 51] },
    { polygon: "polygon(38% 36%,52% 30%,68% 38%,100% 40%,100% 75%,66% 68%,45% 58%)", label: [73, 53] },
    { polygon: "polygon(0 68%,30% 72%,45% 58%,66% 68%,100% 75%,100% 100%,0 100%)", label: [50, 86] }
  ]
};
const mapPositions = {
  // 坐标对应各章背景中石铺空地的视觉中心；需要微调时只改这里。
  origin: [[20, 20], [45, 20], [72, 18], [20, 73], [76, 72]],
  rebuild: [[20, 18], [72, 18], [24, 72], [68, 72]],
  renewal: [[24, 16], [50, 15], [74, 16], [31, 73], [67, 72]]
};
chapters.forEach(chapter => chapter.stageIds.forEach((id, index) => {
  const stage = catalogById[id], [x, y] = mapPositions[chapter.id][index];
  stage.chapterId = chapter.id; stage.x = x; stage.y = y; stage.walkX = x; stage.walkY = y < 50 ? 43 : 91;
}));

const safeStorage = {
  get(key, fallback = null) { try { return window.localStorage?.getItem(key) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { window.localStorage?.setItem(key, value); } catch { /* 无持久存储时保留本轮内存进度 */ } },
  remove(key) { try { window.localStorage?.removeItem(key); } catch { /* 无持久存储时无需清理 */ } }
};
let savedProgress = [];
try { savedProgress = JSON.parse(safeStorage.get("nankai-memory-progress", "[]")); } catch { safeStorage.remove("nankai-memory-progress"); }
if (!Array.isArray(savedProgress)) savedProgress = [];
const state = { completed: savedProgress, selected: 0, question: 0, correct: 0, chosen: null, answered: false, clueUsed: false, wrongStreak: 0, reviewMode: false, timelineOrder: [], answerHistory: [], retryStage: null };
let gameStats = { startedAt: null, finishedAt: null, correct: 0, total: 0, clues: 0 };
let albumState = { unlocked: false, opened: false, readPages: [], currentPage: 0, completedEnding: false, muted: false, record: null };
let gameMusicEnabled = safeStorage.get("nankai-memory-music", "on") !== "off";
let mapCaptionCollapsed = safeStorage.get("nankai-memory-map-caption", "expanded") === "collapsed";
let gameMusicMode = null;
try { gameStats = { ...gameStats, ...JSON.parse(safeStorage.get("nankai-memory-stats", "{}")) }; } catch { safeStorage.remove("nankai-memory-stats"); }
try { albumState = { ...albumState, ...JSON.parse(safeStorage.get("nankai-memory-album", "{}")) }; } catch { safeStorage.remove("nankai-memory-album"); }
const $ = (id) => document.getElementById(id);
function imageCaptionWithoutSource(text = "") {
  return String(text).split("（《")[0].trim().replace(/[（(]\s*资料来源[^）)]*[）)]\s*$/, "");
}
function imageCaptionWithoutContributor(text = "") {
  return String(text)
    .replace(/[；;、]?\s*余老师(?:亦)?提供(?:该照片|原件)?/g, "")
    .replace(/（\s*[；;、]/g, "（")
    .replace(/[；;、]\s*）/g, "）")
    .replace(/（\s*）/g, "")
    .trim();
}
function restorerName() { return window.nankaiAccount?.user?.displayName || "游客修复员"; }
function restorerGender() { return window.nankaiAccount?.user?.gender === "female" ? "female" : "male"; }
function restorerSprite() { return restorerGender() === "female" ? "assets/student-restorer-female.png" : "assets/student-restorer.png"; }
function restorerAlt() { return `${restorerName()}，${restorerGender() === "female" ? "女生" : "男生"}校史记忆修复员`; }
function syncRestorerVisuals() {
  const mapImage = $("studentAvatar")?.querySelector("img");
  if (mapImage) { mapImage.src = restorerSprite(); mapImage.alt = restorerAlt(); }
  if ($("studentLocation")) $("studentLocation").textContent = restorerName();
}
const hebao = new HebaoClient({
  endpoint: window.HEBAO_CONFIG?.endpoint || "/api/agent/event",
  onReply: presentAgent,
  onError: handleAgentError
});
let hebaoChat = null;
let agentNudgeTimer = null;
let mapAgentBubbleTimer = null;
let activeChapterIndex = 0;
let chapterMenuOpen = false;
let chapterMenuFocusIndex = 0;
let accountMode = "login";
let mapHebaoAnimation = null;
let pendingFollowStage = null;
let pendingHebaoAtDestination = false;

function setAccountMessage(message, tone = "") {
  const target = $("accountMessage");
  target.textContent = message;
  target.dataset.tone = tone;
}

function renderAccount() {
  const user = window.nankaiAccount.user;
  $("accountGuest").hidden = Boolean(user);
  $("accountSignedIn").hidden = !user;
  if (!user) {
    $("restorerRecord").textContent = "修复员：游客档案";
    syncRestorerVisuals();
    return;
  }
  $("accountDisplayName").textContent = user.displayName;
  $("restorerRecord").textContent = `修复员：${user.displayName}`;
  syncRestorerVisuals();
}

function setAccountMode(mode) {
  accountMode = mode;
  const registering = mode === "register";
  $("loginTab").classList.toggle("active", !registering);
  $("registerTab").classList.toggle("active", registering);
  $("loginTab").setAttribute("aria-selected", String(!registering));
  $("registerTab").setAttribute("aria-selected", String(registering));
  $("displayNameField").hidden = !registering;
  $("displayName").required = registering;
  $("genderField").hidden = !registering;
  $("accountPassword").autocomplete = registering ? "new-password" : "current-password";
  $("accountSubmit").textContent = registering ? "创建档案并保存进度" : "登录并读取存档";
  setAccountMessage("");
}

async function syncAccountProgress() {
  const remote = await window.nankaiAccount.loadSave();
  const validIds = new Set(stages.map(stage => stage.id));
  const localOwner = safeStorage.get("nankai-memory-owner", "");
  const localProgress = !localOwner || localOwner === window.nankaiAccount.user.username ? state.completed : [];
  const merged = [...new Set([...localProgress, ...(remote.completed || [])])].filter(id => validIds.has(id));
  state.completed = stages.filter(stage => merged.includes(stage.id)).map(stage => stage.id);
  safeStorage.set("nankai-memory-owner", window.nankaiAccount.user.username);
  safeStorage.set("nankai-memory-progress", JSON.stringify(state.completed));
  await window.nankaiAccount.save(state.completed);
  renderMap();
}

async function persistProgress() {
  safeStorage.set("nankai-memory-progress", JSON.stringify(state.completed));
  if (!window.nankaiAccount.user) return;
  safeStorage.set("nankai-memory-owner", window.nankaiAccount.user.username);
  $("accountSyncState").textContent = "正在保存…";
  try {
    await window.nankaiAccount.save(state.completed);
    $("accountSyncState").textContent = "账号存档已同步";
  } catch {
    $("accountSyncState").textContent = "云端暂未同步，本地记录已保留";
  }
}

async function initializeAccount() {
  await window.nankaiAccount.restore();
  renderAccount();
  if (window.nankaiAccount.user) {
    try { await syncAccountProgress(); } catch { $("accountSyncState").textContent = "云端暂未同步，本地记录已保留"; }
    window.nankaiTutorial?.autoFor(window.nankaiAccount.user.username);
  }
}

async function submitAccount(event) {
  event.preventDefault();
  const submit = $("accountSubmit");
  const fields = {
    username: $("accountUsername").value.trim(),
    password: $("accountPassword").value,
    ...(accountMode === "register" ? { displayName: $("displayName").value.trim(), gender: document.querySelector('input[name="gender"]:checked')?.value || "male" } : {})
  };
  submit.disabled = true;
  setAccountMessage(accountMode === "register" ? "正在建立修复员档案…" : "正在核验档案…");
  try {
    if (accountMode === "register") await window.nankaiAccount.register(fields);
    else await window.nankaiAccount.login(fields);
    await syncAccountProgress();
    renderAccount();
    $("accountForm").reset();
    window.nankaiTutorial?.autoFor(window.nankaiAccount.user.username);
  } catch (error) {
    setAccountMessage(error.message, "error");
  } finally {
    submit.disabled = false;
  }
}

function setMapAgentOpen(open, autoClose = false) {
  const agent = $("mapAgent"), handle = $("mapAgentHandle");
  agent.classList.toggle("open", open);
  handle.setAttribute("aria-expanded", String(open));
  clearTimeout(mapAgentBubbleTimer);
  if (open && autoClose) mapAgentBubbleTimer = setTimeout(() => setMapAgentOpen(false), 5200);
}

function handleAgentError(error, request) {
  if (request.surface === "map") {
    $("mapAgent").classList.remove("compact-message");
    $("mapAgentSpeech").textContent = "暂时无法连接荷宝，请稍后重新查阅。地图与档案核验仍可继续。";
    $("mapAgentSource").hidden = true;
    setMapAgentOpen(true);
  }
  hebaoChat?.setAvailability(false);
}

function presentAgent(reply, surface = "quiz") {
  if (surface === "story") {
    hebaoChat?.receiveAgent(reply);
    return;
  }
  if (surface === "quiz") { hebaoChat?.receiveAgent(reply); return; }
  const speech = surface === "intro" ? $("introAgentSpeech") : $("mapAgentSpeech");
  const source = surface === "intro" ? $("introAgentSource") : $("mapAgentSource");
  speech.textContent = reply.text;
  const labels = reply.citations.map(citation => citation.label);
  source.textContent = labels.join("；");
  source.hidden = labels.length === 0;
  if (surface === "map") {
    const compactIntents = new Set(["route-locked", "chapter-preview"]);
    $("mapAgent").classList.toggle("compact-message", compactIntents.has(reply.meta?.intent));
    setMapAgentOpen(true);
  }
}

function show(screen) {
  ["intro", "chapterIntro", "mapScreen", "quizScreen", "storyScreen"].forEach(id => $(id).hidden = id !== screen);
  window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    renderAlbumDock();
    syncChatSurface(screen);
    if (screen === "mapScreen") window.nankaiTutorial?.autoForSurface("map");
    if (screen === "quizScreen") window.nankaiTutorial?.autoForSurface("quiz");
    syncGameMusic(screen);
  });
}

function gameMusicTracks() {
  return { map: $("mapBgm"), quiet: $("stageBgm") };
}
function stopGameMusic(reset = false) {
  Object.values(gameMusicTracks()).forEach(track => {
    if (!track) return;
    track.pause();
    if (reset) track.currentTime = 0;
  });
  gameMusicMode = null;
}
function startGameMusic(mode) {
  if (!gameMusicEnabled || !mode) return;
  const track = gameMusicTracks()[mode];
  if (!track) return;
  if (gameMusicMode === mode && !track.paused) return;
  stopGameMusic();
  track.volume = mode === "map" ? .32 : .27;
  gameMusicMode = mode;
  const playback = track.play();
  if (playback?.catch) playback.catch(() => { /* 浏览器拦截自动播放时，下一次用户操作会再次尝试 */ });
}
function syncMusicButtons() {
  document.querySelectorAll(".music-toggle").forEach(button => {
    button.setAttribute("aria-pressed", String(gameMusicEnabled));
    button.setAttribute("aria-label", gameMusicEnabled ? "关闭游戏音乐" : "开启游戏音乐");
    button.classList.toggle("muted", !gameMusicEnabled);
    const label = button.querySelector("span"); if (label) label.textContent = gameMusicEnabled ? "关闭音乐" : "开启音乐";
  });
}
function syncGameMusic(screen = null) {
  syncMusicButtons();
  if (!gameMusicEnabled || !$('albumOverlay').hidden) { stopGameMusic(); return; }
  const page = screen || (!$('mapScreen').hidden ? "mapScreen" : !$('quizScreen').hidden ? "quizScreen" : !$('storyScreen').hidden ? "storyScreen" : !$('chapterIntro').hidden ? "chapterIntro" : "intro");
  const mode = page === "mapScreen" ? "map" : ["quizScreen", "storyScreen", "chapterIntro"].includes(page) ? "quiet" : null;
  if (mode) startGameMusic(mode); else stopGameMusic();
}
function toggleGameMusic() {
  gameMusicEnabled = !gameMusicEnabled; safeStorage.set("nankai-memory-music", gameMusicEnabled ? "on" : "off");
  if (gameMusicEnabled) syncGameMusic(); else { stopGameMusic(); syncMusicButtons(); }
}
function syncMapCaption() {
  const caption = $("mapCaption"), button = $("mapCaptionToggle");
  if (!caption || !button) return;
  caption.classList.toggle("collapsed", mapCaptionCollapsed);
  button.setAttribute("aria-expanded", String(!mapCaptionCollapsed));
  button.querySelector("b").textContent = mapCaptionCollapsed ? "展开" : "收起";
  button.setAttribute("aria-label", mapCaptionCollapsed ? "展开章节信息" : "收起章节信息");
}
function toggleMapCaption() {
  mapCaptionCollapsed = !mapCaptionCollapsed;
  safeStorage.set("nankai-memory-map-caption", mapCaptionCollapsed ? "collapsed" : "expanded");
  syncMapCaption();
}

function currentPage() {
  if (!$('albumOverlay').hidden) return "review";
  if (!$("quizScreen").hidden) return "quiz";
  if (!$("mapScreen").hidden) return "map";
  if (!$("chapterIntro").hidden) return "chapter";
  if (!$("storyScreen").hidden) return "story";
  return "intro";
}

function selectedAnswerForContext(item) {
  if (state.chosen === null || state.chosen === undefined) return null;
  if (item.type === "sort") return (state.chosen || []).filter(Boolean).map(id => item.options[Number(id.replace("option-", ""))]);
  if (item.type === "judge") return state.chosen === "true" ? "正确" : "错误";
  return item.options[state.chosen] || null;
}

function currentChatContext() {
  const page = currentPage();
  const stage = stages[state.selected] || stages[0];
  const chapterIndex = Math.max(0, chapterIndexForStage(state.selected));
  const chapter = chapters[chapterIndex] || chapters[0];
  const item = page === "quiz" ? stage.questions[state.question] : null;
  const questionSubmitted = Boolean(item && state.answered);
  const question = item ? {
    type: item.type,
    text: item.text,
    options: item.options,
    ...(questionSubmitted || state.reviewMode ? { answer: item.answer, answerText: item.answerText, answerOrder: item.answerOrder, explanation: item.explanation } : {})
  } : null;
  const answerGuard = item && !questionSubmitted && !state.reviewMode ? {
    type: item.type,
    correctOption: item.type === "choice" ? item.options[item.answer] : null,
    correctLetter: item.type === "choice" ? String.fromCharCode(65 + item.answer) : null,
    answerText: item.type === "sort" ? item.answerText : null,
    answerOrder: item.type === "sort" ? item.answerOrder?.map(index => item.options[index]) : null
  } : null;
  const pageLabels = { map: "地图", quiz: state.reviewMode ? "校史回顾" : `第${state.question + 1}份档案`, chapter: "章节序幕", story: "照片修复", review: "校史回顾", intro: "封面" };
  return {
    chapterId: chapter.id,
    chapter: chapter.title,
    landmark: stage.title,
    stageId: stage.id,
    page,
    questionType: item?.type || null,
    questionIndex: item ? state.question : null,
    question,
    answerGuard,
    questionSubmitted,
    wrongStreak: state.wrongStreak,
    selectedAnswer: item ? selectedAnswerForContext(item) : null,
    fragments: state.completed.length,
    unlockedChapters: chapters.filter((_, index) => isChapterUnlocked(index)).map(value => value.title),
    reviewMode: state.reviewMode,
    contextLabel: `${stage.title} · ${pageLabels[page]}`,
    gameRules: "每个地标核验三份档案，至少答对三分之二后获得照片碎片；按路线依次解锁地标，集齐本章碎片可修复章节影像。"
  };
}

function syncChatSurface(screen = currentPage()) {
  if (!hebaoChat) return;
  const chatSlot = screen === "mapScreen" ? $("mapChatSlot") : screen === "quizScreen" ? $("quizChatSlot") : document.body;
  if (hebaoChat.trigger.parentElement !== chatSlot) chatSlot.appendChild(hebaoChat.trigger);
  hebaoChat.trigger.classList.toggle("in-header", chatSlot !== document.body);
  hebaoChat.setVisible(screen !== "intro");
  if (screen !== "intro") {
    const context = currentChatContext();
    hebaoChat.sceneChanged(`已进入${context.contextLabel}`);
  }
}
function showMapWithHebao() {
  show("mapScreen");
  setMapAgentOpen(true);
}
function returnToCover() {
  clearTimeout(agentNudgeTimer);
  closeStagePanel();
  state.reviewMode = false;
  $("quizScreen").classList.remove("review-mode");
  show("intro");
  $("enterGame").focus();
}
function showChapterIntro(chapterIndex) {
  activeChapterIndex = chapterIndex;
  const chapter = chapters[chapterIndex], intro = $("chapterIntro");
  $("chapterIntroPeriod").textContent = `${chapter.title} · ${chapter.subtitle}`;
  $("chapterIntroTitle").textContent = chapter.introTitle;
  $("chapterIntroText").textContent = chapter.introText;
  $("chapterIntroQuote").textContent = `${chapter.quote} 本章影像目标：“${chapter.rewardTitle}”，共${chapter.stageIds.length}块。`;
  $("chapterIntroHighlights").innerHTML = chapter.highlights.map(item => `<span>${item}</span>`).join("");
  intro.style.setProperty("--chapter-image", `url("${chapter.background}")`);
  intro.classList.remove("curtain-open");
  show("chapterIntro");
  requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add("curtain-open")));
  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 720;
  setTimeout(() => $("enterChapter").focus(), delay);
}
function enterActiveChapter() {
  const chapterIndices = chapterStageIndices(activeChapterIndex);
  const targetStage = chapterEntryStageIndex(activeChapterIndex);
  const freshChapterStart = targetStage === chapterIndices[0] && chapterCompletedCount(activeChapterIndex) === 0;
  renderMap();
  showMapWithHebao();
  pendingFollowStage = freshChapterStart ? targetStage : null;
  pendingHebaoAtDestination = false;
  $("followHebao").hidden = !freshChapterStart;
  if (freshChapterStart) {
    placeMapHebao(targetStage, true);
    $("followHebao").textContent = `跟上荷宝，前往${stages[targetStage].title}`;
    $("mapAgentSpeech").textContent = `${chapters[activeChapterIndex].subtitle}的第一份影像正在等待修复。先从${stages[targetStage].title}开始吧，我在那里等你。`;
    $("mapAgentSource").hidden = true;
  } else {
    placeMapHebao(targetStage);
    selectStage(targetStage, false, false);
  }
  setMapAgentOpen(true);
  setTimeout(() => moveCameraTo(targetStage), 80);
}
function isUnlocked(index) { return index === 0 || state.completed.includes(stages[index - 1].id); }
function chapterIndexForStage(index) { return chapters.findIndex(chapter => chapter.stageIds.includes(stages[index]?.id)); }
function chapterStageIndices(chapterIndex = activeChapterIndex) { return chapters[chapterIndex].stageIds.map(id => stages.findIndex(stage => stage.id === id)); }
function chapterEntryStageIndex(chapterIndex = activeChapterIndex) {
  const indices = chapterStageIndices(chapterIndex);
  if (indices.includes(state.selected)) return state.selected;
  return indices.find(index => isUnlocked(index) && !state.completed.includes(stages[index].id)) ?? indices.at(-1);
}
function chapterCompletedCount(chapterIndex) {
  return chapters[chapterIndex].stageIds.filter(id => state.completed.includes(id)).length;
}
function renderChapterPuzzle(container, chapterIndex, earnedStageId = "") {
  const chapter = chapters[chapterIndex];
  const completedPieces = chapter.fragmentStageIds.filter(id => state.completed.includes(id)).length;
  container.innerHTML = "";
  container.dataset.pieces = String(chapter.fragmentStageIds.length);
  container.classList.toggle("complete", completedPieces === chapter.fragmentStageIds.length);
  container.setAttribute("aria-label", `${chapter.rewardTitle}，已收集${completedPieces}/${chapter.fragmentStageIds.length}块`);

  const image = document.createElement("img");
  image.className = "puzzle-base";
  image.src = chapter.rewardImage;
  image.alt = chapter.rewardCaption;
  container.appendChild(image);

  const cover = document.createElement("div");
  cover.className = "puzzle-fragments";
  const shapes = irregularFragments[chapter.fragmentStageIds.length];
  chapter.fragmentStageIds.forEach((stageId, position) => {
    const piece = document.createElement("span");
    const restored = state.completed.includes(stageId);
    const shape = shapes[position];
    piece.className = `puzzle-fragment ${restored ? "restored" : "locked"} ${stageId === earnedStageId ? "just-earned" : ""}`;
    piece.dataset.stageId = stageId;
    piece.style.setProperty("--fragment-shape", shape.polygon);
    piece.style.setProperty("--label-x", `${shape.label[0]}%`);
    piece.style.setProperty("--label-y", `${shape.label[1]}%`);
    piece.style.setProperty("--puzzle-image", `url("${chapter.rewardImage}")`);
    piece.innerHTML = restored ? "" : `<span class="fragment-label"><b>${catalogById[stageId].title}</b><small>${chapter.fragmentNames[position]} · 待寻回</small></span>`;
    cover.appendChild(piece);
  });
  container.appendChild(cover);
}
function isChapterUnlocked(chapterIndex) {
  if (chapterIndex === 0) return true;
  return chapters.slice(0, chapterIndex).every(chapter => chapter.stageIds.every(id => state.completed.includes(id)));
}
function chapterStatus(chapterIndex) {
  const completed = chapterCompletedCount(chapterIndex);
  const total = chapters[chapterIndex].stageIds.length;
  if (!isChapterUnlocked(chapterIndex)) return "未解锁";
  if (completed === total) return "已完成";
  return chapterIndex === activeChapterIndex ? "进行中" : "已解锁";
}
function setChapterMenuOpen(open, focusIndex = activeChapterIndex) {
  chapterMenuOpen = open;
  const trigger = $("chapterSelectTrigger"), menu = $("chapterMenu");
  if (!trigger || !menu) return;
  trigger.setAttribute("aria-expanded", String(open));
  menu.hidden = !open;
  $("chapterNav").classList.toggle("open", open);
  if (!open) return;
  chapterMenuFocusIndex = Math.max(0, Math.min(focusIndex, chapters.length - 1));
  requestAnimationFrame(() => menu.querySelector(`[data-chapter-index="${chapterMenuFocusIndex}"]`)?.focus());
}
function chooseChapter(index, trigger = null) {
  const unlocked = isChapterUnlocked(index);
  activeChapterIndex = index;
  const chapterIndices = chapterStageIndices(index);
  state.selected = chapterIndices.includes(state.selected) ? state.selected : chapterIndices[0];
  closeStagePanel();
  setChapterMenuOpen(false);
  renderMap();
  showMapWithHebao();
  setTimeout(() => moveCameraTo(state.selected), 80);
  if (!unlocked) notifyLockedRoute({ targetChapter: chapters[index] });
  $("chapterSelectTrigger")?.focus();
}
function notifyLockedRoute({ targetStage = null, targetChapter = null, trigger = null }) {
  const targetIndex = targetStage ? stages.indexOf(targetStage) : chapterStageIndices(chapters.indexOf(targetChapter))[0];
  let prerequisite = stages[Math.max(0, targetIndex - 1)];
  if (targetChapter) {
    const targetChapterIndex = chapters.indexOf(targetChapter);
    const blockingChapter = chapters.find((chapter, index) => index < targetChapterIndex && chapter.stageIds.some(id => !state.completed.includes(id)));
    if (blockingChapter) prerequisite = catalogById[blockingChapter.stageIds.at(-1)];
  }
  const nextStage = stages[reachedStageIndex()];
  if (targetChapter) {
    presentAgent({ speaker: "荷宝", text: `可以先看看“${targetChapter.title}”的地图。完成上一阶段“${chapters[chapters.indexOf(targetChapter) - 1].title}”后，就能进入关卡。`, citations: [], meta: { intent: "chapter-preview" } }, "map");
  } else {
    hebao.guardRoute({ targetType: "stage", targetStage, targetChapter, prerequisite, nextStage });
  }
  if (trigger) {
    trigger.classList.remove("denied");
    requestAnimationFrame(() => trigger.classList.add("denied"));
    setTimeout(() => trigger.classList.remove("denied"), 520);
  }
}
function renderChapterNav() {
  const nav = $("chapterNav");
  const activeChapter = chapters[activeChapterIndex];
  const activeCompleted = chapterCompletedCount(activeChapterIndex);
  nav.innerHTML = `<button id="chapterSelectTrigger" class="chapter-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="${chapterMenuOpen}" aria-controls="chapterMenu"><span class="chapter-select-copy"><small>阶段选择</small><strong title="${activeChapter.title}">${activeChapter.title}</strong></span><span class="chapter-select-progress" aria-label="当前阶段碎片进度">${activeCompleted}／${activeChapter.stageIds.length}</span><svg class="chapter-select-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5"/></svg></button><div id="chapterMenu" class="chapter-menu" role="listbox" aria-label="选择校史阶段" ${chapterMenuOpen ? "" : "hidden"}></div>`;
  const trigger = $("chapterSelectTrigger"), menu = $("chapterMenu");
  trigger.addEventListener("click", () => setChapterMenuOpen(!chapterMenuOpen));
  trigger.addEventListener("keydown", event => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === "ArrowUp" || event.key === "End" ? chapters.length - 1 : 0;
    setChapterMenuOpen(true, target);
  });
  chapters.forEach((chapter, index) => {
    const button = document.createElement("button"), chapterIndices = chapterStageIndices(index);
    const completed = chapterIndices.filter(stageIndex => state.completed.includes(stages[stageIndex].id)).length;
    const unlocked = isChapterUnlocked(index);
    const status = chapterStatus(index), complete = completed === chapterIndices.length;
    button.type = "button";
    button.className = `chapter-option ${index === activeChapterIndex ? "active" : ""} ${unlocked ? "" : "locked"} ${complete ? "complete" : ""}`;
    button.dataset.chapterIndex = String(index);
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(index === activeChapterIndex));
    button.setAttribute("aria-current", index === activeChapterIndex ? "page" : "false");
    button.setAttribute("aria-label", `${chapter.title}，${unlocked ? `${completed}/${chapterIndices.length}块碎片已收集，${status}` : "未解锁，可以预览地图，完成上一阶段后解锁关卡"}`);
    button.innerHTML = `<span class="chapter-option-mark" aria-hidden="true">${unlocked ? (complete ? `<svg viewBox="0 0 20 20"><path d="m4 10 4 4 8-9"/></svg>` : `<span></span>`) : `<svg viewBox="0 0 20 20"><rect x="4.5" y="8.5" width="11" height="8" rx="1"/><path d="M7 8.5V6a3 3 0 0 1 6 0v2.5"/></svg>`}</span><span class="chapter-option-copy"><strong title="${chapter.title}">${chapter.title}</strong><small>${unlocked ? status : "可预览地图 · 完成上一阶段后解锁"}</small></span><span class="chapter-option-progress">${unlocked ? `${completed}／${chapterIndices.length}` : "未解锁"}</span>`;
    button.addEventListener("click", () => chooseChapter(index, button));
    button.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.preventDefault(); setChapterMenuOpen(false); trigger.focus(); return; }
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseChapter(index, button); return; }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Home") chapterMenuFocusIndex = 0;
      else if (event.key === "End") chapterMenuFocusIndex = chapters.length - 1;
      else chapterMenuFocusIndex = (index + (event.key === "ArrowDown" ? 1 : -1) + chapters.length) % chapters.length;
      menu.querySelector(`[data-chapter-index="${chapterMenuFocusIndex}"]`)?.focus();
    });
    menu.appendChild(button);
  });
}
function reachedStageIndex() { return Math.min(state.completed.length, stages.length - 1); }
function setStudentPosition(index, animate = false) {
  const avatar = $("studentAvatar"), stage = stages[index];
  avatar.classList.toggle("walking", animate);
  // 修复员在地标右侧落脚，和左侧的荷宝留出清晰的角色间距。
  avatar.style.left = `${Math.max(14, Math.min(88, stage.x + 8))}%`;
  avatar.style.top = `${stage.walkY}%`;
  avatar.setAttribute("aria-label", `${restorerAlt()}，目前位于${stage.title}`);
  $("studentLocation").textContent = restorerName();
  syncRestorerVisuals();
}
function updateMapAgent(index, travelling = false) {
  const context = mapGuideContext(index, travelling), stage = stages[index];
  $("mapAgentSpeech").textContent = `荷宝正在查阅${stage.title}的档案……`;
  $("mapAgentSource").hidden = true;
  hebao.guideMap(context);
}
function mapGuideContext(index, travelling = false) {
  const stage = stages[index], chapterIndex = chapterIndexForStage(index), chapter = chapters[chapterIndex];
  const fragmentPosition = chapter.fragmentStageIds.indexOf(stage.id);
  return {
    stage,
    stageIndex: index,
    completed: state.completed.length,
    total: stages.length,
    travelling,
    rewardTitle: chapter.rewardTitle,
    fragmentName: chapter.fragmentNames[fragmentPosition],
    chapterCollected: chapterCompletedCount(chapterIndex),
    chapterTotal: chapter.stageIds.length
  };
}
function mapHebaoPoint(index, edge = false) {
  const stage = stages[index], world = $("mapWorld"), agent = $("mapAgent");
  // 荷宝从安全边距入场，并在地标左侧停下；不再与右侧修复员重叠。
  const compactMap = world.clientWidth <= 620;
  const xPercent = edge ? (compactMap ? 1 : 8) : Math.max(0, Math.min(82, stage.x - (compactMap ? 20 : 12)));
  // 上、下排地标分别让荷宝停在道路内侧，靠纵向错位避免挤占修复员的站位。
  const restingY = stage.y < 50 ? (compactMap ? 39 : 28) : 74;
  const yPercent = edge ? Math.max(14, Math.min(78, restingY + 4)) : restingY;
  return { left: xPercent / 100 * world.clientWidth, top: yPercent / 100 * world.clientHeight, maxLeft: Math.max(8, world.clientWidth - agent.offsetWidth - 8), maxTop: Math.max(8, world.clientHeight - agent.offsetHeight - 8) };
}
function applyMapHebaoPoint(point) {
  const agent = $("mapAgent"), world = $("mapWorld");
  const left = Math.min(Math.max(8, point.left), point.maxLeft), top = Math.min(Math.max(8, point.top), point.maxTop);
  agent.style.left = `${left}px`; agent.style.top = `${top}px`; agent.style.right = "auto"; agent.style.bottom = "auto";
  agent.classList.toggle("bubble-right", left < world.clientWidth / 2);
}
function placeMapHebao(index, edge = false) {
  mapHebaoAnimation?.cancel(); mapHebaoAnimation = null;
  applyMapHebaoPoint(mapHebaoPoint(index, edge));
}
function scatterFootprints(from, to) {
  const world = $("mapWorld");
  world.querySelectorAll(".hebao-footprint").forEach(node => node.remove());
  for (let step = 1; step <= 6; step++) {
    const footprint = document.createElement("i"), progress = step / 7;
    footprint.className = "hebao-footprint";
    footprint.style.left = `${from.left + (to.left - from.left) * progress + (step % 2 ? -5 : 5)}px`;
    footprint.style.top = `${from.top + (to.top - from.top) * progress}px`;
    footprint.style.setProperty("--footprint-angle", `${step % 2 ? -10 : 10}deg`);
    footprint.style.animationDelay = `${step * 80}ms`;
    world.appendChild(footprint);
  }
  setTimeout(() => world.querySelectorAll(".hebao-footprint").forEach(node => node.remove()), 2600);
}
function guideMapHebao(index, onComplete = null) {
  const agent = $("mapAgent"), world = $("mapWorld"), current = agent.getBoundingClientRect(), parent = world.getBoundingClientRect();
  const from = { left: current.left - parent.left, top: current.top - parent.top }, to = mapHebaoPoint(index);
  scatterFootprints(from, to); moveCameraTo(index);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !agent.animate) { applyMapHebaoPoint(to); onComplete?.(); return; }
  mapHebaoAnimation?.cancel();
  mapHebaoAnimation = agent.animate([
    { left: `${from.left}px`, top: `${from.top}px`, transform: "translateY(0)" },
    { left: `${to.left}px`, top: `${to.top}px`, transform: "translateY(-5px)", offset: .5 },
    { left: `${to.left}px`, top: `${to.top}px`, transform: "translateY(0)" }
  ], { duration: 1800, easing: "steps(12, end)", fill: "forwards" });
  mapHebaoAnimation.onfinish = () => { applyMapHebaoPoint(to); mapHebaoAnimation?.cancel(); mapHebaoAnimation = null; onComplete?.(); };
}
function renderMap(studentIndex = reachedStageIndex()) {
  const chapter = chapters[activeChapterIndex], visibleIndices = chapterStageIndices(), nodes = $("stageNodes"); nodes.innerHTML = "";
  const chapterUnlocked = isChapterUnlocked(activeChapterIndex);
  const chapterCollected = chapterCompletedCount(activeChapterIndex);
  $("chapterMapTitle").textContent = chapter.title; $("chapterMapSubtitle").textContent = chapter.subtitle;
  $("chapterRewardProgress").textContent = `${chapter.rewardTitle} · ${chapterCollected}/${chapter.stageIds.length}块`;
  $("mapRepairTitle").textContent = chapter.rewardTitle;
  $("mapRepairCount").textContent = `${chapterCollected} / ${chapter.stageIds.length}`;
  $("mapRepairPercent").textContent = `修复程度 ${Math.round(chapterCollected / chapter.stageIds.length * 100)}%`;
  $("mapRepairMeter").style.transform = `scaleX(${chapterCollected / chapter.stageIds.length})`;
  $("mapHud").textContent = chapterUnlocked
    ? "点击已抵达的建筑进入关卡 · 完成修复后前往下一站"
    : "地图预览模式 · 可查看地标样式，完成前置章节后方可体验";
  $("mapViewport").setAttribute("aria-label", chapterUnlocked
    ? "可移动的南开记忆路线图，不代表真实地理比例"
    : `${chapter.title}章节地图预览，关卡尚未解锁`);
  renderChapterPuzzle($("mapPuzzle"), activeChapterIndex);
  $("mapWorld").style.backgroundImage = `url("${chapter.background}")`;
  renderChapterNav();
  visibleIndices.forEach(index => {
    const stage = stages[index];
    const completed = state.completed.includes(stage.id), unlocked = isUnlocked(index);
    const button = document.createElement("button");
    button.className = `stage-node ${completed ? "completed" : unlocked ? "active" : "locked"}`;
    button.dataset.stageIndex = String(index);
    button.style.left = `${stage.x}%`; button.style.top = `${stage.y}%`;
    button.setAttribute("aria-label", `${stage.title}，${completed ? "已修复，可回顾题目与校史" : unlocked ? "可进入" : "尚未解锁，点击听取荷宝提示"}`);
    const visual = stage.sprite ? `<img class="landmark-sprite" src="${stage.sprite}" alt="">` : `<span class="landmark-placeholder"><b>${stage.title}</b><small>建筑影像待补充</small></span>`;
    button.innerHTML = `${visual}<span class="pin"><b>${completed ? "✓" : unlocked ? index + 1 : "×"}</b></span><span class="node-label">${stage.title}</span>`;
    button.addEventListener("click", event => {
      event.stopPropagation();
      if (!unlocked) { closeStagePanel(); notifyLockedRoute({ targetStage: stage, trigger: button }); return; }
      toggleStagePanel(index);
    });
    nodes.appendChild(button);
  });
  const restored = state.completed.length, reached = reachedStageIndex(), reachedStage = stages[reached];
  $("restoredCount").textContent = restored; $("overallProgress").style.transform = `scaleX(${restored / stages.length})`;
  const studentInChapter = stages[studentIndex]?.chapterId === chapter.id;
  $("studentAvatar").hidden = !studentInChapter;
  if (studentInChapter) setStudentPosition(studentIndex, false);
  placeMapHebao(studentInChapter ? studentIndex : visibleIndices[0]);
  if (chapterUnlocked) updateMapAgent(studentInChapter ? reached : visibleIndices[0]);
  if (!visibleIndices.includes(state.selected)) state.selected = visibleIndices[0];
  selectStage(state.selected, false, false);
}
function selectStage(index, focus = true, openPanel = true) {
  state.selected = index; const stage = stages[index], completed = state.completed.includes(stage.id), unlocked = isUnlocked(index);
  const retrying = state.retryStage === stage.id;
  const chapterIndex = chapterIndexForStage(index), chapter = chapters[chapterIndex], fragmentPosition = chapter.fragmentStageIds.indexOf(stage.id);
  $("stageRoute").textContent = `记忆路线 · 第${index + 1}站`; $("stageTitle").textContent = stage.title; $("stageSubtitle").textContent = stage.subtitle;
  $("stageRewardTitle").textContent = `本章目标 · ${chapter.rewardTitle}`;
  renderChapterPuzzle($("stagePuzzle"), chapterIndex);
  $("stageStatus").textContent = completed ? `已取得${chapter.fragmentNames[fragmentPosition]}碎片` : retrying ? "本轮核验未通过，碎片尚未取得" : unlocked ? `完成后获得${chapter.fragmentNames[fragmentPosition]}碎片` : "尚未解锁"; $("stageScore").textContent = completed ? "已归档" : retrying ? "可以再次挑战" : `0 / ${stage.questions.length} 题`;
  $("startStage").disabled = !unlocked; $("startStage").classList.toggle("retry-button", retrying); $("startStage").textContent = completed ? "回顾题目与校史" : retrying ? "重新寻迹" : unlocked ? "进入档案现场" : "完成上一地标后解锁";
  document.querySelectorAll(".stage-node").forEach(node => node.classList.toggle("selected", Number(node.dataset.stageIndex) === index));
  if (openPanel) { setMapAgentOpen(false); $("stagePanel").classList.add("open"); }
}
function closeStagePanel() { $("stagePanel").classList.remove("open"); }
function toggleStagePanel(index) { if (state.selected === index && $("stagePanel").classList.contains("open")) { closeStagePanel(); return; } selectStage(index, false, true); }
function startStage() {
  if (!isUnlocked(state.selected)) { closeStagePanel(); notifyLockedRoute({ targetStage: stages[state.selected] }); return; }
  const s = stages[state.selected];
  state.question = 0; state.correct = 0; state.chosen = null; state.answered = false; state.clueUsed = false; state.wrongStreak = 0; state.answerHistory = [];
  state.reviewMode = state.completed.includes(s.id);
  if (!state.reviewMode) state.retryStage = null;
  $("quizScreen").classList.toggle("review-mode", state.reviewMode);
  $("quizStageRoute").textContent = `第${state.selected + 1}站 · ${state.reviewMode ? "校史回顾" : "档案核验"}`;
  $("quizStageTitle").textContent = s.title;
  show("quizScreen");
  renderQuestion();
}
function renderQuestion() {
  if (state.reviewMode) { renderReviewQuestion(); return; }
  const stage = stages[state.selected], item = stage.questions[state.question]; state.chosen = null; state.answered = false; state.clueUsed = false;
  const assisted = state.wrongStreak >= 2;
  $("previousQuestion").hidden = state.question === 0 || !state.answerHistory[state.question - 1];
  $("previousReview").hidden = true;
  $("questionCounter").textContent = `${state.question + 1} / ${stage.questions.length}`; $("difficulty").textContent = assisted ? "问荷宝可获得进阶线索" : item.difficulty; $("submitAnswer").disabled = true; $("submitAnswer").textContent = "确认核验"; $("feedback").className = "feedback"; $("feedback").hidden = true;
  $("options").innerHTML = "";
  renderQuestionMedia(item);
  if (item.type === "judge") renderEvidenceJudgement(item);
  else if (item.type === "sort") renderTimelineSort(item);
  else renderWalkChoice(item, assisted);
  hebaoChat?.sceneChanged(`已进入${stage.title}·第${state.question + 1}份档案`);
}

function renderQuestionMedia(item) {
  const media = $("questionMedia");
  media.hidden = !item.image;
  if (!item.image) return;
  $("questionImage").src = item.image;
  $("questionImage").alt = item.imageCaption || `${item.code} 档案图片`;
  $("questionImageCaption").textContent = item.imageCaption || "校史档案影像";
}

function renderWalkChoice(item, assisted) {
  $("questionType").textContent = "走近核验";
  $("questionText").textContent = item.text;
  const area = $("gameplayArea");
  area.className = "gameplay-area choice-arena";
  area.dataset.position = "start";
  area.innerHTML = `<div class="arena-vignette"></div><img class="arena-player" src="${restorerSprite()}" alt="${restorerAlt()}"><div class="choice-lecterns" role="radiogroup" aria-label="档案选项"></div><p class="arena-instruction">点击档案台走近核验 · 键盘可按 1—4</p>`;
  const lecterns = area.querySelector(".choice-lecterns");
  item.options.forEach((text, index) => {
    const button = document.createElement("button");
    button.className = "archive-lectern";
    button.innerHTML = `<span class="lectern-key">${String.fromCharCode(65 + index)}</span><span>${text}</span>`;
    button.addEventListener("click", () => chooseWalkOption(index));
    lecterns.appendChild(button);
  });
  if (assisted) {
    const eliminated = item.options.findIndex((_, index) => index !== item.answer);
    lecterns.children[eliminated].disabled = true;
    lecterns.children[eliminated].classList.add("eliminated");
    lecterns.children[eliminated].setAttribute("aria-label", `${item.options[eliminated]}，该选项已被线索排除，不能选择`);
    lecterns.children[eliminated].insertAdjacentHTML("beforeend", '<small class="eliminated-label">该选项已被线索排除</small>');
  }
}

function chooseWalkOption(index) {
  if (state.answered) return;
  state.chosen = index;
  const area = $("gameplayArea"), buttons = [...area.querySelectorAll(".archive-lectern")];
  buttons.forEach((button, i) => button.classList.toggle("selected", i === index));
  area.dataset.position = String(index);
  $("submitAnswer").disabled = false;
}

function evidenceClaim(item) {
  if (item.options.length === 2 && item.options[0] === "正确" && item.options[1] === "错误") {
    return { truth: item.answer === 0, text: item.text };
  }
  const truth = state.selected % 2 === 0;
  const claimIndex = truth ? item.answer : item.options.findIndex((_, index) => index !== item.answer);
  return { truth, text: `${item.text} 给出的答案是“${item.options[claimIndex]}”。` };
}

function renderEvidenceJudgement(item) {
  $("questionType").textContent = "判断题";
  const claim = evidenceClaim(item);
  $("questionText").textContent = "判断下面的说法是否正确";
  const area = $("gameplayArea");
  area.className = "gameplay-area evidence-lab";
  area.innerHTML = `<div class="claim-slip"><small>题目陈述</small><strong>${claim.text}</strong></div><div class="judgement-actions" role="group" aria-label="请选择正确或错误"><button data-verdict="true">正确</button><button data-verdict="false">错误</button></div><p class="arena-instruction">阅读陈述后，直接选择“正确”或“错误”</p>`;
  area.querySelectorAll("[data-verdict]").forEach(button => button.addEventListener("click", () => {
    if (state.answered) return;
    state.chosen = button.dataset.verdict;
    area.querySelectorAll("[data-verdict]").forEach(itemButton => itemButton.classList.toggle("selected", itemButton === button));
    $("submitAnswer").disabled = false;
  }));
}

function renderTimelineSort(item) {
  $("questionType").textContent = "推箱归档";
  $("questionText").textContent = item.text;
  const records = item.options.map((title, index) => ({ id: `option-${index}`, title }));
  state.timelineOrder = item.answerOrder.map(index => `option-${index}`);
  const mixed = [...records];
  const area = $("gameplayArea");
  area.className = "gameplay-area timeline-room";
  area.style.setProperty("--sort-count", records.length);
  area.innerHTML = `<div class="timeline-rail" aria-label="从早到晚的四个档案位置"></div><div class="crate-yard" aria-label="待放置档案箱"><p class="yard-label">待放置档案</p></div><img class="timeline-player" src="${restorerSprite()}" alt="${restorerAlt()}"><p class="arena-instruction" aria-live="polite">拖动下方档案箱，放入上方对应的档案位</p>`;
  const rail = area.querySelector(".timeline-rail"), yard = area.querySelector(".crate-yard");
  mixed.forEach((record, index) => {
    const slot = document.createElement("div");
    slot.className = "timeline-slot";
    slot.dataset.slotIndex = String(index);
    slot.tabIndex = 0;
    slot.setAttribute("role", "button");
    slot.setAttribute("aria-label", `顺序位 ${index + 1}`);
    slot.innerHTML = `<span class="slot-label"><small>顺序位</small><b>${index + 1}</b></span>`;
    slot.addEventListener("dragover", event => { event.preventDefault(); slot.classList.add("drop-target"); });
    slot.addEventListener("dragleave", () => slot.classList.remove("drop-target"));
    slot.addEventListener("drop", event => { event.preventDefault(); slot.classList.remove("drop-target"); placeCrate(event.dataTransfer.getData("text/plain"), index); });
    slot.addEventListener("click", () => placeArmedCrate(index));
    slot.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); placeArmedCrate(index); } });
    rail.appendChild(slot);
    const crate = document.createElement("button"); crate.className = "archive-crate"; crate.draggable = true; crate.dataset.id = record.id; crate.innerHTML = `<span class="crate-seal">${String.fromCharCode(65 + index)}</span><b>${record.title}</b><small>顺序待核</small>`;
    crate.addEventListener("dragstart", event => event.dataTransfer.setData("text/plain", record.id));
    crate.addEventListener("click", event => { event.stopPropagation(); armCrate(crate); });
    yard.appendChild(crate);
  });
  yard.addEventListener("dragover", event => event.preventDefault());
  yard.addEventListener("drop", event => { event.preventDefault(); returnCrateToYard(event.dataTransfer.getData("text/plain")); });
  state.chosen = Array(records.length).fill(null);
  $("submitAnswer").disabled = true;
}

function placeCrate(crateId, slotIndex) {
  if (state.answered || !crateId) return;
  const previousSlot = state.chosen.indexOf(crateId);
  const displacedId = state.chosen[slotIndex];
  if (previousSlot >= 0) state.chosen[previousSlot] = displacedId || null;
  state.chosen[slotIndex] = crateId;
  renderTimelinePlacement();
}

function armCrate(crate) {
  if (state.answered) return;
  const selected = crate.classList.contains("armed");
  $("gameplayArea").querySelectorAll(".archive-crate").forEach(item => item.classList.remove("armed"));
  if (!selected) crate.classList.add("armed");
  $("gameplayArea").querySelector(".arena-instruction").textContent = selected ? "拖动档案箱，放入上方对应的档案位" : "已选中档案箱，请点击一个档案位放置";
}

function placeArmedCrate(slotIndex) {
  const crate = $("gameplayArea").querySelector(".archive-crate.armed");
  if (crate) placeCrate(crate.dataset.id, slotIndex);
}

function returnCrateToYard(crateId) {
  if (state.answered || !crateId) return;
  const slotIndex = state.chosen.indexOf(crateId);
  if (slotIndex >= 0) state.chosen[slotIndex] = null;
  renderTimelinePlacement();
}

function renderTimelinePlacement() {
  const area = $("gameplayArea"), yard = area.querySelector(".crate-yard");
  area.querySelectorAll(".archive-crate").forEach(crate => { crate.classList.remove("armed"); if (!state.chosen.includes(crate.dataset.id)) yard.appendChild(crate); });
  state.chosen.forEach((id, index) => {
    const slot = area.querySelector(`.timeline-slot[data-slot-index="${index}"]`);
    slot.classList.toggle("filled", Boolean(id));
    if (id) slot.appendChild(area.querySelector(`.archive-crate[data-id="${id}"]`));
  });
  const placed = state.chosen.filter(Boolean).length;
  $("submitAnswer").disabled = placed < state.timelineOrder.length;
  area.querySelector(".arena-instruction").textContent = placed === state.timelineOrder.length ? "四份档案已放好，可以确认排序" : `已放置 ${placed} / ${state.timelineOrder.length} 份档案`;
}
function renderReviewQuestion() {
  clearTimeout(agentNudgeTimer);
  const stage = stages[state.selected], item = stage.questions[state.question];
  state.chosen = item.answer; state.answered = true; state.clueUsed = false;
  $("questionCounter").textContent = `${state.question + 1} / ${stage.questions.length}`;
  $("questionText").textContent = item.text;
  $("questionType").textContent = "校史回顾";
  renderQuestionMedia(item);
  $("gameplayArea").className = "gameplay-area";
  $("gameplayArea").innerHTML = "";
  $("difficulty").textContent = "校史回顾";
  $("previousQuestion").hidden = true;
  $("previousReview").hidden = true;
  $("submitAnswer").disabled = false;
  $("submitAnswer").textContent = state.question === stage.questions.length - 1 ? "结束回顾，返回地图" : "下一份档案";
  const options = $("options"); options.innerHTML = "";
  item.options.forEach((text, index) => {
    const option = document.createElement("button");
    option.className = `option review-option ${(item.type === "sort" ? item.answerOrder.includes(index) : index === item.answer) ? "correct" : ""}`;
    option.disabled = true;
    option.innerHTML = `<span class="option-key">${String.fromCharCode(65 + index)}</span><span>${text}</span>`;
    options.appendChild(option);
  });
  $("feedback").hidden = false;
  const archivedAnswer = item.type === "sort" ? item.answerText : `${String.fromCharCode(65 + item.answer)} · ${item.options[item.answer]}`;
  $("feedback").innerHTML = `<strong>归档答案：${archivedAnswer}</strong><br>${item.explanation}`;
  hebaoChat?.sceneChanged(`已进入${stage.title}·第${state.question + 1}份档案回顾`);
}
function chooseOption(index) { if (state.answered) return; state.chosen = index; [...$("options").children].forEach((el, i) => el.classList.toggle("selected", i === index)); $("submitAnswer").disabled = false; }
function answerSummary(item) {
  if (item.type === "sort") return state.chosen.map(id => item.options[Number(id.replace("option-", ""))]).join(" → ");
  if (item.type === "judge") return state.chosen === "true" ? "正确" : "错误";
  return `${String.fromCharCode(65 + state.chosen)} · ${item.options[state.chosen]}`;
}
function showPreviousQuestion() {
  const record = state.answerHistory[state.question - 1];
  if (!record) return;
  $("previousReviewIndex").textContent = `第 ${record.index + 1} 题 · 已封存`;
  $("previousReviewQuestion").textContent = record.question;
  $("previousReviewAnswer").textContent = record.answer;
  $("previousReviewExplanation").textContent = record.explanation;
  const verdict = $("previousReviewVerdict");
  verdict.className = `previous-review-verdict ${record.right ? "is-correct" : "is-wrong"}`;
  verdict.innerHTML = `<strong>${record.right ? "核验正确" : "核验错误"}</strong><span>${record.right ? "答案与档案记录一致" : "答案与档案记录不符"}</span>`;
  $("previousReview").hidden = false;
  $("closePreviousReview").focus();
}
function closePreviousQuestion() { $("previousReview").hidden = true; $("previousQuestion").focus(); }
function submitAnswer() {
  if (state.reviewMode) { nextReviewQuestion(); return; }
  if (state.chosen === null) return; if (state.answered) { nextQuestion(); return; }
  clearTimeout(agentNudgeTimer); state.answered = true; const item = stages[state.selected].questions[state.question];
  const right = item.type === "choice" ? state.chosen === item.answer : item.type === "judge" ? (state.chosen === "true") === evidenceClaim(item).truth : state.chosen.every((id, index) => id === state.timelineOrder[index]);
  gameStats.total++; if (right) gameStats.correct++; saveGameStats();
  if (right) { state.correct++; state.wrongStreak = 0; } else state.wrongStreak++;
  if (item.type === "choice") $("gameplayArea").querySelectorAll(".archive-lectern").forEach((el, i) => { el.disabled = true; if (i === item.answer) el.classList.add("correct"); if (i === state.chosen && !right) el.classList.add("wrong"); });
  if (item.type === "judge") $("gameplayArea").classList.add(right ? "verified" : "contradicted");
  if (item.type === "sort") $("gameplayArea").querySelectorAll(".archive-crate").forEach(crate => { const index = state.chosen.indexOf(crate.dataset.id); crate.classList.toggle("correct", index >= 0 && crate.dataset.id === state.timelineOrder[index]); });
  const timelineExplanation = item.type === "sort" ? `正确顺序：${item.answerOrder.map(index => item.options[index]).join(" → ")}。${item.explanation}` : item.explanation;
  state.answerHistory[state.question] = { index: state.question, question: $("questionText").textContent, answer: answerSummary(item), right, explanation: timelineExplanation };
  $("feedback").className = `feedback ${right ? "feedback-correct" : "feedback-wrong"}`;
  $("feedback").hidden = false; $("feedback").innerHTML = `<strong>${right ? "核验正确" : "核验错误"}</strong><span>${right ? "答案与档案记录一致" : "答案与档案记录不符"}</span><p>${timelineExplanation}</p>`; $("submitAnswer").textContent = state.question === stages[state.selected].questions.length - 1 ? "完成修复" : "下一份档案"; $("submitAnswer").disabled = false;
  requestAnimationFrame(() => $("feedback").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }));
  hebao.reviewAnswer({ stage: stages[state.selected], question: item, right, clueUsed: state.clueUsed, wrongStreak: state.wrongStreak });
}
function nextReviewQuestion() {
  const stage = stages[state.selected];
  if (state.question < stage.questions.length - 1) { state.question++; renderReviewQuestion(); return; }
  state.reviewMode = false;
  $("quizScreen").classList.remove("review-mode");
  activeChapterIndex = chapterIndexForStage(state.selected);
  renderMap(); show("mapScreen"); moveCameraTo(state.selected); selectStage(state.selected, false, true);
  presentAgent({ speaker: "荷宝", text: `${stage.title}的${stage.questions.length}份档案已经回顾完毕，原有通关记录和照片碎片保持不变。`, citations: [{ label: stage.source }], meta: { intent: "review-complete" } }, "map");
}
function nextQuestion() {
  const stage = stages[state.selected];
  if (state.question < stage.questions.length - 1) { state.question++; renderQuestion(); return; }
  const requiredCorrect = Math.ceil(stage.questions.length * .67);
  if (state.correct < requiredCorrect) {
    state.retryStage = stage.id;
    state.question = 0; state.correct = 0; state.answerHistory = [];
    activeChapterIndex = chapterIndexForStage(state.selected);
    renderMap(); showMapWithHebao(); moveCameraTo(state.selected); selectStage(state.selected, false, true);
    presentAgent({ speaker:"荷宝", text:`这次还差一点。取得照片碎片至少需要答对${requiredCorrect}题，档案卡上已经出现“重新寻迹”，准备好后我们再试一次。`, citations:[], meta:{ intent:"retry" } }, "map");
    return;
  }
  finishStage();
}
function finishStage() {
  clearTimeout(agentNudgeTimer);
  const stage = stages[state.selected], newlyCompleted = !state.completed.includes(stage.id); if (newlyCompleted) { state.completed.push(stage.id); persistProgress(); }
  state.retryStage = null;
  const chapterIndex = chapterIndexForStage(state.selected), chapter = chapters[chapterIndex];
  const fragmentPosition = chapter.fragmentStageIds.indexOf(stage.id), chapterComplete = chapterCompletedCount(chapterIndex) === chapter.stageIds.length;
  $("storyYear").textContent = stage.year; $("storyTitle").textContent = stage.storyTitle; $("storyText").textContent = stage.story;
  $("storyMedia").hidden = !stage.storyImage;
  if (stage.storyImage) { $("storyImage").src = stage.storyImage; $("storyImage").alt = stage.storyCaption || `${stage.title}校史图片`; $("storyImageCaption").textContent = imageCaptionWithoutSource(stage.storyCaption || stage.title); }
  $("rewardStatus").textContent = chapterComplete ? "章节影像完整显影" : "获得章节照片碎片";
  renderChapterPuzzle($("rewardPuzzle"), chapterIndex, stage.id);
  $("restoredCaption").textContent = imageCaptionWithoutSource(chapter.rewardCaption);
  $("fragmentEarned").textContent = chapterComplete ? `已集齐 ${chapter.stageIds.length} 块不规则碎片，“${chapter.rewardTitle}”完整归档。` : `新碎片 +1｜${stage.title}核验完成，寻回“${chapter.rewardTitle}”的${chapter.fragmentNames[fragmentPosition]}。`;
  $("continueJourney").textContent = chapterComplete ? (state.selected === stages.length - 1 ? "收录完整影像，完成修复" : "收录完整影像，开启下一章") : "收好碎片，继续寻迹";
  $("agentReview").hidden = true;
  hebao.summarizeStage({ stage, correct: state.correct, chapterComplete, rewardTitle: chapter.rewardTitle, fragmentName: chapter.fragmentNames[fragmentPosition] });
  const nextStageIndex = state.selected + 1;
  if (!chapterComplete && nextStageIndex < stages.length) {
    hebao.prefetchMapGuide(mapGuideContext(nextStageIndex, true));
  }
  show("storyScreen");
  if (newlyCompleted && state.completed.length === stages.length) {
    const firstUnlock = !albumState.unlocked;
    gameStats.finishedAt = Date.now(); saveGameStats();
    albumState.record = { ...gameStats, completed: state.completed.length }; saveAlbumState();
    if (firstUnlock) setTimeout(() => unlockAlbum(true), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 750);
    else { renderAlbumDock(); showAlbumHint("这一轮的校史记忆也已经完整归档。相册中的通关记录已更新，随时可以再次翻阅。", true); }
  }
}

function moveCameraTo(index) {
  const viewport = $("mapViewport"), world = $("mapWorld"), stage = stages[index];
  const targetX = stage.x / 100 * world.offsetWidth - viewport.clientWidth * .42;
  const targetY = stage.y / 100 * world.offsetHeight - viewport.clientHeight * .48;
  viewport.scrollTo({ left: Math.max(0, targetX), top: Math.max(0, targetY), behavior: "smooth" });
}

function journeyToNextStage() {
  const from = state.selected, next = Math.min(from + 1, stages.length - 1), isFinal = from === stages.length - 1;
  state.selected = next;
  const nextChapterIndex = chapterIndexForStage(next), changesChapter = nextChapterIndex !== activeChapterIndex;
  if (changesChapter) activeChapterIndex = nextChapterIndex;
  renderMap(from);
  showMapWithHebao();
  closeStagePanel();
  if (isFinal) { setStudentPosition(from); updateMapAgent(from); return; }
  if (changesChapter) {
    pendingFollowStage = next;
    pendingHebaoAtDestination = false;
    showChapterIntro(nextChapterIndex);
    return;
  }
  pendingFollowStage = null;
  pendingHebaoAtDestination = false;
  $("followHebao").hidden = true;
  $("mapWorld").classList.add("hebao-guiding");
  updateMapAgent(next, true);
  guideMapHebao(next, () => {
    $("mapWorld").classList.remove("hebao-guiding");
    $("mapWorld").classList.add("awaiting-follow");
    pendingFollowStage = next;
    pendingHebaoAtDestination = true;
    $("followHebao").textContent = `跟上荷宝，前往${stages[next].title}`;
    $("followHebao").hidden = false;
    setMapAgentOpen(true);
  });
}

const albumPages = [
  { title: "从旧时光出发", period: "1919—1948 · 从哪里来", image: chapters[0].rewardImage, caption: chapters[0].rewardCaption, text: "那时的校园尚未拥有今天的模样，许多道路还没有名字，许多故事也才刚刚开始。\n\n但正是在并不宽阔的天地里，一群人把目光投向了更远的地方。他们相信，教育能够改变个人的命运，也能够回应一个时代的追问。\n\n岁月带走了当年的声音，却没有带走那份出发时的坚定。我们今天走过的路，正从他们迈出的第一步延伸而来。" },
  { title: "在风雨中守望", period: "1949—1978 · 经历了什么", image: chapters[1].rewardImage, caption: chapters[1].rewardCaption, text: "历史从来不只由鲜花和掌声写成。风雨到来时，书桌也许简陋，前路也许未明，但求知的灯火从未真正熄灭。\n\n一代代师生在动荡中守住课堂，在困顿中守住理想。他们留下的，不只是某一次选择或某一段经历，而是一种面对时代时不肯退后的姿态。\n\n所谓传承，或许正是多年以后，我们仍能从这张照片里感受到那份沉默而坚定的力量。" },
  { title: "把记忆交给未来", period: "1979—今 · 将走向哪里", image: chapters[2].rewardImage, caption: chapters[2].rewardCaption, text: "照片停住了一个瞬间，时间却仍在继续向前。曾经站在镜头前的人，或许未曾见过今天的校园，却把他们相信的事情留给了后来者。\n\n如今，我们在同一片土地上读书、行走，也在用自己的经历续写新的篇章。校史并不是一册合上后便沉默的旧书，它藏在每一次选择、每一份坚持，也藏在年轻目光望向未来的方向里。\n\n当你记住这些故事，你也已经成为故事的一部分。" }
];
const memorialText = "恭喜你，完成了这场跨越时光的校史探寻。\n\n那些散落在旧照片、文字和往事中的记忆，因为你的寻找，再次变得清晰。\n\n历史并不只停留在过去。当它被看见、被理解、被记住，也就有了新的回声。";
const endingText = "谢谢你，让这些沉睡的记忆再次被看见。\n\n相册可以合上，故事却仍在继续。\n\n愿你带着从历史中得到的勇气与温度，走向属于自己的远方。";
let albumPageIndex = 0, typewriterTimer = null, typewriterText = "", typewriterTarget = null, lastAlbumFocus = null, audioContext = null;

function saveGameStats() { safeStorage.set("nankai-memory-stats", JSON.stringify(gameStats)); }
function saveAlbumState() { safeStorage.set("nankai-memory-album", JSON.stringify(albumState)); }
function albumUnlocked() { return albumState.unlocked || state.completed.length === stages.length; }
function formatDuration(startedAt, finishedAt) {
  if (!startedAt || !finishedAt) return "";
  const seconds = Math.max(0, Math.round((finishedAt - startedAt) / 1000));
  return `${Math.floor(seconds / 60)}分${String(seconds % 60).padStart(2, "0")}秒`;
}
function renderAlbumDock() {
  const dock = $("albumDock"), button = $("albumButton"), unlocked = albumUnlocked();
  dock.hidden = $("intro").hidden === false;
  button.classList.toggle("unlocked", unlocked);
  button.setAttribute("aria-label", unlocked ? "校史相册，已经解锁，可以打开" : `校史相册，尚未解锁，已收集${state.completed.length}/${stages.length}块碎片`);
  $("albumDockStatus").textContent = unlocked ? (albumState.completedEnding ? "已珍藏" : "已解锁") : `${state.completed.length}／${stages.length}`;
}
function showAlbumHint(text, action = false) {
  $("albumHintText").textContent = text;
  $("albumHintAction").hidden = !action;
  $("albumHintMenu").hidden = true;
  $("albumHint").hidden = false;
}
function unlockAlbum(firstTime = true) {
  if (!albumState.unlocked) {
    albumState.unlocked = true;
    albumState.record = { ...gameStats, finishedAt: gameStats.finishedAt || (firstTime ? Date.now() : null), completed: state.completed.length };
    saveAlbumState();
  }
  renderAlbumDock();
  if (!firstTime) return;
  $("albumButton").classList.add("unlocking");
  setTimeout(() => $("albumButton").classList.remove("unlocking"), 1250);
  showAlbumHint("同学，你找到的每一条线索，都已经回到了它应在的位置。\n\n那本等待已久的相册，也终于被重新唤醒了。\n\n去打开它吧，这一次，它记录的不只是校史，也记录着你的旅程。", true);
}
function playTypeClick(index) {
  if (albumState.muted || index % 2 !== 0 || !window.AudioContext) return;
  try {
    audioContext ||= new AudioContext();
    if (audioContext.state === "suspended") audioContext.resume();
    const now = audioContext.currentTime;
    const noise = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * .045), audioContext.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) samples[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * .007));
    const strike = audioContext.createBufferSource(), strikeFilter = audioContext.createBiquadFilter(), strikeGain = audioContext.createGain();
    strike.buffer = noise; strikeFilter.type = "bandpass"; strikeFilter.frequency.value = 1650 + (index % 5) * 95; strikeFilter.Q.value = .72;
    strikeGain.gain.setValueAtTime(.055, now); strikeGain.gain.exponentialRampToValueAtTime(.0001, now + .042);
    strike.connect(strikeFilter).connect(strikeGain).connect(audioContext.destination); strike.start(now);
    const body = audioContext.createOscillator(), bodyGain = audioContext.createGain();
    body.type = "square"; body.frequency.setValueAtTime(118 + (index % 3) * 9, now); body.frequency.exponentialRampToValueAtTime(72, now + .028);
    bodyGain.gain.setValueAtTime(.018, now); bodyGain.gain.exponentialRampToValueAtTime(.0001, now + .035);
    body.connect(bodyGain).connect(audioContext.destination); body.start(now); body.stop(now + .04);
  } catch { /* 音频不可用不影响文字 */ }
}
function playAlbumMusic() {
  const music = $("albumSchoolSong");
  if (!music) return;
  music.volume = .34;
  const playback = music.play();
  playback?.catch?.(() => { /* 浏览器若阻止自动播放，保留无声相册体验 */ });
}
function stopAlbumMusic() {
  const music = $("albumSchoolSong");
  if (!music) return;
  music.pause();
  music.currentTime = 0;
}
function stopTypewriter(showFull = false) {
  clearTimeout(typewriterTimer); typewriterTimer = null;
  if (typewriterTarget) {
    if (showFull) typewriterTarget.textContent = typewriterText;
    typewriterTarget.classList.remove("typing");
  }
}
function typeText(target, text, onComplete) {
  stopTypewriter(); typewriterTarget = target; typewriterText = text;
  const alreadyRead = albumState.readPages.includes(albumPageIndex) || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (alreadyRead) { target.textContent = text; target.classList.remove("typing"); onComplete?.(); return; }
  target.textContent = ""; target.classList.add("typing"); let index = 0;
  const step = () => {
    if (index >= text.length) {
      target.classList.remove("typing");
      albumState.readPages = [...new Set([...albumState.readPages, albumPageIndex])]; saveAlbumState(); onComplete?.(); return;
    }
    const character = text[index++]; target.textContent += character;
    if (!/[，。！？；：\n]/.test(character)) playTypeClick(index);
    const delay = character === "\n" ? 280 : /[。！？]/.test(character) ? 260 : /[，；：]/.test(character) ? 140 : 50;
    typewriterTimer = setTimeout(step, delay);
  };
  step();
}
function completeCurrentAlbumText() {
  if (!typewriterTimer) return false;
  stopTypewriter(true);
  albumState.readPages = [...new Set([...albumState.readPages, albumPageIndex])]; saveAlbumState();
  revealAlbumCompletion(); return true;
}
function albumRecord() {
  const record = albumState.record || gameStats, entries = [];
  const player = window.nankaiAccount?.user?.displayName || "南开记忆守护者";
  entries.push(["探索者", player], ["通关日期", record.finishedAt ? new Date(record.finishedAt).toLocaleDateString("zh-CN") : ""]);
  const duration = formatDuration(record.startedAt, record.finishedAt); if (duration) entries.push(["总用时", duration]);
  if (record.completed) entries.push(["完成关卡", `${record.completed}／${stages.length}`]);
  if (record.total) entries.push(["答题正确率", `${Math.round(record.correct / record.total * 100)}%`]);
  if (record.clues) entries.push(["调阅线索", `${record.clues}次`]);
  return entries.filter(([,value]) => value !== "");
}
function revealAlbumCompletion() {
  const reveal = albumPageIndex === 0 ? $("albumRevealText") : albumPageIndex === 4 ? $("albumEndingReveal") : $("albumPhotoReveal");
  reveal.hidden = true;
  if (albumPageIndex === 0) $("albumStats").classList.add("visible");
  if (albumPageIndex === 4) $("albumEndingActions").hidden = false;
}
function renderAlbumPage(replay = false) {
  stopTypewriter(); albumState.currentPage = albumPageIndex; saveAlbumState();
  if (replay) albumState.readPages = albumState.readPages.filter(page => page !== albumPageIndex);
  $("albumMemorial").hidden = albumPageIndex !== 0; $("albumPhotoPage").hidden = albumPageIndex < 1 || albumPageIndex > 3; $("albumEnding").hidden = albumPageIndex !== 4;
  $("albumPrevious").disabled = albumPageIndex === 0; $("albumNext").hidden = albumPageIndex === 4;
  $("albumProgress").textContent = albumPageIndex === 0 ? "纪念页" : albumPageIndex === 4 ? "最后一页" : `${String(albumPageIndex).padStart(2, "0")}／03`;
  $("albumPageNumber").textContent = $("albumProgress").textContent;
  if (albumPageIndex === 0) {
    $("albumNext").textContent = "开始翻阅"; $("albumStats").classList.remove("visible"); $("albumRevealText").hidden = false;
    $("albumStats").innerHTML = albumRecord().map(([term,value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join("");
    typeText($("albumTypedText"), memorialText, revealAlbumCompletion);
  } else if (albumPageIndex <= 3) {
    const page = albumPages[albumPageIndex - 1]; $("albumNext").textContent = albumPageIndex === 3 ? "翻到最后一页" : "继续翻阅"; $("albumPhotoReveal").hidden = false;
    const albumCaption = imageCaptionWithoutContributor(page.caption);
    $("albumPhoto").src = page.image; $("albumPhoto").alt = albumCaption; $("albumPhotoCaption").textContent = page.title; $("albumPhotoSource").textContent = albumCaption;
    $("albumPhotoPeriod").textContent = page.period; $("albumPhotoTitle").textContent = page.title; typeText($("albumPhotoText"), page.text, revealAlbumCompletion);
  } else {
    $("albumEndingActions").hidden = true; $("albumEndingReveal").hidden = false; typeText($("albumEndingText"), endingText, revealAlbumCompletion);
  }
}
function openAlbum(startAt = null) {
  if (!albumUnlocked()) {
    $("albumButton").classList.remove("denied"); requestAnimationFrame(() => $("albumButton").classList.add("denied"));
    $("albumHint").hidden = true;
    presentAgent({ speaker:"荷宝", text:"这本相册里，似乎封存着一段还没有被完整找回的记忆。等我们收集完全部线索，再回来看看吧。", citations:[], meta:{ intent:"album-locked" } }, "map");
    setMapAgentOpen(true);
    return;
  }
  lastAlbumFocus = document.activeElement; albumState.opened = true; saveAlbumState(); $("albumHint").hidden = true;
  albumPageIndex = startAt ?? (albumState.completedEnding ? 0 : Math.min(albumState.currentPage || 0, 4));
  stopGameMusic(); $("albumOverlay").hidden = false; document.body.classList.add("album-open"); renderAlbumPage(); playAlbumMusic(); $("albumClose").focus();
  hebaoChat?.setVisible(true); hebaoChat?.sceneChanged(`已进入${stages[state.selected]?.title || "南开"}·校史回顾`);
}
function closeAlbum(completed = false) {
  stopTypewriter(); stopAlbumMusic(); $("albumOverlay").hidden = true; document.body.classList.remove("album-open");
  if (completed) { albumState.completedEnding = true; saveAlbumState(); renderAlbumDock(); showAlbumHint("相册已经替你珍藏好了这段旅程。\n你可以回到走过的地方，再看看曾经找到的线索；也可以重新出发，看看下一次是否会发现不同的细节。"); $("albumHintMenu").hidden = false; }
  syncGameMusic();
  lastAlbumFocus?.focus?.();
}
function changeAlbumPage(direction) {
  if (typewriterTimer) { completeCurrentAlbumText(); return; }
  albumPageIndex = Math.max(0, Math.min(4, albumPageIndex + direction)); renderAlbumPage();
}
function resetCurrentGame() {
  state.completed = []; state.selected = 0; activeChapterIndex = 0;
  gameStats = { startedAt: null, finishedAt: null, correct: 0, total: 0, clues: 0 }; saveGameStats(); persistProgress(); renderMap(); renderAlbumDock();
  hebaoChat?.clear();
}

function enableMapMovement() {
  const viewport = $("mapViewport"); let dragging = false, startX = 0, startY = 0, startScrollX = 0, startScrollY = 0;
  viewport.addEventListener("pointerdown", event => { if (event.target.closest("button")) return; dragging = true; startX = event.clientX; startY = event.clientY; startScrollX = viewport.scrollLeft; startScrollY = viewport.scrollTop; viewport.setPointerCapture(event.pointerId); });
  viewport.addEventListener("pointermove", event => { if (dragging) { viewport.scrollLeft = startScrollX - (event.clientX - startX); viewport.scrollTop = startScrollY - (event.clientY - startY); } });
  viewport.addEventListener("pointerup", () => dragging = false); viewport.addEventListener("pointercancel", () => dragging = false);
  viewport.addEventListener("keydown", event => { if (["ArrowRight", "d", "D"].includes(event.key)) viewport.scrollBy({ left: 280, behavior: "smooth" }); if (["ArrowLeft", "a", "A"].includes(event.key)) viewport.scrollBy({ left: -280, behavior: "smooth" }); if (["ArrowDown", "s", "S"].includes(event.key)) viewport.scrollBy({ top: 220, behavior: "smooth" }); if (["ArrowUp", "w", "W"].includes(event.key)) viewport.scrollBy({ top: -220, behavior: "smooth" }); });
}

$("enterGame").addEventListener("click", () => { if (!gameStats.startedAt || gameStats.finishedAt) { gameStats.startedAt = Date.now(); gameStats.finishedAt = null; saveGameStats(); } state.selected = Math.min(state.completed.length, stages.length - 1); activeChapterIndex = Math.max(0, chapterIndexForStage(state.selected)); showChapterIntro(activeChapterIndex); });
$("enterChapter").addEventListener("click", enterActiveChapter);
$("followHebao").addEventListener("click", () => {
  const targetStage = pendingFollowStage ?? chapterEntryStageIndex(activeChapterIndex);
  const moveStudent = () => {
    $("mapWorld").classList.remove("awaiting-follow");
    setStudentPosition(targetStage, true);
    moveCameraTo(targetStage);
    setTimeout(() => {
      $("studentAvatar").classList.remove("walking");
      $("mapWorld").classList.remove("hebao-guiding");
      pendingFollowStage = null;
      pendingHebaoAtDestination = false;
      updateMapAgent(targetStage);
      selectStage(targetStage, false, true);
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 1900);
  };
  $("followHebao").hidden = true;
  $("mapWorld").classList.add("hebao-guiding");
  setMapAgentOpen(false);
  if (pendingHebaoAtDestination) moveStudent();
  else guideMapHebao(targetStage, moveStudent);
});
$("resetGame").addEventListener("click", resetCurrentGame);
$("startStage").addEventListener("click", startStage); $("backToMap").addEventListener("click", () => { clearTimeout(agentNudgeTimer); state.reviewMode = false; $("quizScreen").classList.remove("review-mode"); activeChapterIndex = Math.max(0, chapterIndexForStage(state.selected)); renderMap(); showMapWithHebao(); moveCameraTo(state.selected); }); $("previousQuestion").addEventListener("click", showPreviousQuestion); $("closePreviousReview").addEventListener("click", closePreviousQuestion); $("submitAnswer").addEventListener("click", submitAnswer); $("continueJourney").addEventListener("click", journeyToNextStage);
$("closeStagePanel").addEventListener("click", closeStagePanel);
document.querySelectorAll(".return-cover").forEach(button => button.addEventListener("click", returnToCover));
$("mapViewport").addEventListener("click", event => { if (!event.target.closest(".stage-node")) closeStagePanel(); });
document.addEventListener("pointerdown", event => {
  if (chapterMenuOpen && !event.target.closest("#chapterNav")) setChapterMenuOpen(false);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && chapterMenuOpen) {
    event.preventDefault();
    setChapterMenuOpen(false);
    $("chapterSelectTrigger")?.focus();
  }
});
enableMapMovement();
$("mapAgentHandle").addEventListener("click", event => { event.stopPropagation(); setMapAgentOpen(!$("mapAgent").classList.contains("open")); });
$("mapAgentDismiss").addEventListener("click", event => { event.stopPropagation(); setMapAgentOpen(false); $("mapAgentHandle").focus(); });
$("mapAgent").addEventListener("click", event => event.stopPropagation());
hebaoChat = new HebaoChat({
  client: hebao,
  contextProvider: currentChatContext,
  onOpenChange(open) {
    $("game").classList.toggle("chat-open", open);
    document.body.classList.toggle("hebao-chat-open", open);
    if (open) mapHebaoAnimation?.pause(); else mapHebaoAnimation?.play();
  }
});
syncChatSurface();

$("albumButton").addEventListener("click", () => openAlbum());
$("albumHintAction").addEventListener("click", () => openAlbum(0));
$("albumHintReview").addEventListener("click", () => { $("albumHint").hidden = true; activeChapterIndex = 0; state.selected = 0; renderMap(); showMapWithHebao(); });
$("albumHintReopen").addEventListener("click", () => openAlbum(0));
$("albumHintRestart").addEventListener("click", () => { if (!window.confirm("重新开始后，本轮答题进度和用时将被清除，但已经解锁的校史相册仍会为你保留。确定重新开始吗？")) return; $("albumHint").hidden = true; resetCurrentGame(); show("intro"); });
$("albumClose").addEventListener("click", () => closeAlbum());
$("albumPrevious").addEventListener("click", () => changeAlbumPage(-1));
$("albumNext").addEventListener("click", () => changeAlbumPage(1));
[$("albumTypedText"), $("albumPhotoText"), $("albumEndingText"), $("albumRevealText"), $("albumPhotoReveal"), $("albumEndingReveal")].forEach(element => element.addEventListener("click", completeCurrentAlbumText));
$("albumReplay").addEventListener("click", () => renderAlbumPage(true));
$("albumMute").addEventListener("click", () => { albumState.muted = !albumState.muted; saveAlbumState(); $("albumMute").setAttribute("aria-pressed", String(albumState.muted)); $("albumMute").textContent = albumState.muted ? "开启打字音效" : "关闭打字音效"; });
$("albumFinish").addEventListener("click", () => closeAlbum(true));
$("albumReviewStages").addEventListener("click", () => { closeAlbum(true); activeChapterIndex = 0; state.selected = 0; renderMap(); showMapWithHebao(); });
$("albumReadAgain").addEventListener("click", () => { albumPageIndex = 0; renderAlbumPage(); });
$("albumRestart").addEventListener("click", () => { if (!window.confirm("重新开始后，本轮答题进度和用时将被清除，但已经解锁的校史相册仍会为你保留。确定重新开始吗？")) return; closeAlbum(true); resetCurrentGame(); show("intro"); });
let albumTouchX = null;
$("albumBook").addEventListener("touchstart", event => { albumTouchX = event.touches[0]?.clientX ?? null; }, { passive:true });
$("albumBook").addEventListener("touchend", event => { if (albumTouchX === null) return; const delta = (event.changedTouches[0]?.clientX ?? albumTouchX) - albumTouchX; albumTouchX = null; if (Math.abs(delta) > 70) changeAlbumPage(delta < 0 ? 1 : -1); }, { passive:true });

$("loginTab").addEventListener("click", () => setAccountMode("login"));
$("registerTab").addEventListener("click", () => setAccountMode("register"));
$("accountForm").addEventListener("submit", submitAccount);
$("logoutButton").addEventListener("click", async () => {
  await hebaoChat?.clear();
  await window.nankaiAccount.logout();
  safeStorage.remove("nankai-memory-owner");
  safeStorage.remove("nankai-memory-progress");
  state.completed = [];
  state.selected = 0;
  activeChapterIndex = 0;
  renderMap();
  renderAccount();
  setAccountMode("login");
});
setAccountMode("login");
initializeAccount();
if (state.completed.length === stages.length && !albumState.unlocked) unlockAlbum(false);
$("albumMute").setAttribute("aria-pressed", String(albumState.muted));
$("albumMute").textContent = albumState.muted ? "开启打字音效" : "关闭打字音效";
document.querySelectorAll(".music-toggle").forEach(button => button.addEventListener("click", toggleGameMusic));
syncMusicButtons();
$("mapCaptionToggle").addEventListener("click", toggleMapCaption);
syncMapCaption();
renderAlbumDock();

document.addEventListener("keydown", (event) => { if (!$("quizScreen").hidden && !state.reviewMode && !state.answered && state.question === 0 && /^[1-4]$/.test(event.key)) chooseWalkOption(Number(event.key) - 1); });
document.addEventListener("keydown", event => {
  if ($("albumOverlay").hidden) return;
  if (event.key === "Escape") { event.preventDefault(); closeAlbum(); return; }
  if (event.key === "ArrowRight") { event.preventDefault(); changeAlbumPage(1); return; }
  if (event.key === "ArrowLeft") { event.preventDefault(); changeAlbumPage(-1); return; }
  if (event.key !== "Tab") return;
  const focusable = [...$("albumOverlay").querySelectorAll("button:not([disabled]):not([hidden]),[tabindex='0']")].filter(element => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0], last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

