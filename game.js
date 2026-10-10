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

function q(text, options, answer, explanation, clue) { return { text, options, answer, explanation, clue }; }

const safeStorage = {
  get(key, fallback = null) { try { return window.localStorage?.getItem(key) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { window.localStorage?.setItem(key, value); } catch { /* 无持久存储时保留本轮内存进度 */ } },
  remove(key) { try { window.localStorage?.removeItem(key); } catch { /* 无持久存储时无需清理 */ } }
};
let savedProgress = [];
try { savedProgress = JSON.parse(safeStorage.get("nankai-memory-progress", "[]")); } catch { safeStorage.remove("nankai-memory-progress"); }
if (!Array.isArray(savedProgress)) savedProgress = [];
const state = { completed: savedProgress, selected: 0, question: 0, correct: 0, chosen: null, answered: false, clueUsed: false, wrongStreak: 0, reviewMode: false, timelineOrder: [], answerHistory: [] };
const $ = (id) => document.getElementById(id);
const hebao = new HebaoClient({ endpoint: window.HEBAO_CONFIG?.endpoint || "/api/agent/event", onReply: presentAgent });
let agentNudgeTimer = null;
let mapAgentBubbleTimer = null;
let activeChapterIndex = 0;

function setMapAgentOpen(open, autoClose = false) {
  const agent = $("mapAgent"), handle = $("mapAgentHandle");
  agent.classList.toggle("open", open);
  handle.setAttribute("aria-expanded", String(open));
  clearTimeout(mapAgentBubbleTimer);
  if (open && autoClose) mapAgentBubbleTimer = setTimeout(() => setMapAgentOpen(false), 5200);
}

function presentAgent(reply, surface = "quiz") {
  if (surface === "story") {
    $("agentReview").textContent = `荷宝：${reply.text}${reply.citations[0] ? `（${reply.citations[0].label}）` : ""}`;
    return;
  }
  const speech = surface === "map" ? $("mapAgentSpeech") : $("agentSpeech");
  const source = surface === "map" ? $("mapAgentSource") : $("agentSource");
  speech.textContent = reply.text;
  const labels = reply.citations.map(citation => citation.label);
  source.textContent = labels.join("；");
  source.hidden = labels.length === 0;
  if (surface === "map") setMapAgentOpen(true, true);
}

function show(screen) { ["intro", "chapterIntro", "mapScreen", "quizScreen", "storyScreen"].forEach(id => $(id).hidden = id !== screen); window.scrollTo(0, 0); }
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
  renderMap();
  show("mapScreen");
  setTimeout(() => moveCameraTo(state.selected), 80);
}
function isUnlocked(index) { return index === 0 || state.completed.includes(stages[index - 1].id); }
function chapterIndexForStage(index) { return chapters.findIndex(chapter => chapter.stageIds.includes(stages[index]?.id)); }
function chapterStageIndices(chapterIndex = activeChapterIndex) { return chapters[chapterIndex].stageIds.map(id => stages.findIndex(stage => stage.id === id)); }
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
function notifyLockedRoute({ targetStage = null, targetChapter = null, trigger = null }) {
  const targetIndex = targetStage ? stages.indexOf(targetStage) : chapterStageIndices(chapters.indexOf(targetChapter))[0];
  let prerequisite = stages[Math.max(0, targetIndex - 1)];
  if (targetChapter) {
    const targetChapterIndex = chapters.indexOf(targetChapter);
    const blockingChapter = chapters.find((chapter, index) => index < targetChapterIndex && chapter.stageIds.some(id => !state.completed.includes(id)));
    if (blockingChapter) prerequisite = catalogById[blockingChapter.stageIds.at(-1)];
  }
  const nextStage = stages[reachedStageIndex()];
  const reply = hebao.guardRoute({
    targetType: targetChapter ? "chapter" : "stage",
    targetStage,
    targetChapter,
    prerequisite,
    nextStage
  });
  presentAgent(reply, "map");
  if (trigger) {
    trigger.classList.remove("denied");
    requestAnimationFrame(() => trigger.classList.add("denied"));
    setTimeout(() => trigger.classList.remove("denied"), 520);
  }
}
function renderChapterNav() {
  const nav = $("chapterNav"); nav.innerHTML = "";
  chapters.forEach((chapter, index) => {
    const button = document.createElement("button"), chapterIndices = chapterStageIndices(index);
    const completed = chapterIndices.filter(stageIndex => state.completed.includes(stages[stageIndex].id)).length;
    const unlocked = isChapterUnlocked(index);
    button.className = `chapter-tab ${index === activeChapterIndex ? "active" : ""} ${unlocked ? "" : "locked"}`;
    button.setAttribute("aria-current", index === activeChapterIndex ? "page" : "false");
    button.setAttribute("aria-label", `${chapter.title}，${unlocked ? `${completed}/${chapterIndices.length}块碎片已收集` : "尚未解锁，可以预览地图，不能进入关卡"}`);
    button.innerHTML = `<strong>${chapter.title}</strong><span>${unlocked ? `${completed}/${chapterIndices.length}` : "地图预览"}</span>`;
    button.addEventListener("click", () => {
      activeChapterIndex = index;
      state.selected = chapterIndices.includes(state.selected) ? state.selected : chapterIndices[0];
      closeStagePanel();
      if (unlocked) { showChapterIntro(index); return; }
      renderMap();
      show("mapScreen");
      setTimeout(() => moveCameraTo(state.selected), 80);
      notifyLockedRoute({ targetChapter: chapter, trigger: document.querySelector(`.chapter-tab:nth-child(${index + 1})`) });
    });
    nav.appendChild(button);
  });
}
function reachedStageIndex() { return Math.min(state.completed.length, stages.length - 1); }
function setStudentPosition(index, animate = false) {
  const avatar = $("studentAvatar"), stage = stages[index];
  avatar.classList.toggle("walking", animate);
  avatar.style.left = `${stage.walkX}%`;
  avatar.style.top = `${stage.walkY}%`;
  avatar.setAttribute("aria-label", `校史记忆修复员，目前位于${stage.title}`);
  $("studentLocation").textContent = `修复员 · ${stage.title}`;
}
function updateMapAgent(index, travelling = false) {
  const stage = stages[index], chapterIndex = chapterIndexForStage(index), chapter = chapters[chapterIndex];
  const fragmentPosition = chapter.fragmentStageIds.indexOf(stage.id);
  presentAgent(hebao.guideMap({
    stage,
    stageIndex: index,
    completed: state.completed.length,
    total: stages.length,
    travelling,
    rewardTitle: chapter.rewardTitle,
    fragmentName: chapter.fragmentNames[fragmentPosition],
    chapterCollected: chapterCompletedCount(chapterIndex),
    chapterTotal: chapter.stageIds.length
  }), "map");
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
  if (chapterUnlocked) updateMapAgent(studentInChapter ? reached : visibleIndices[0]);
  if (!visibleIndices.includes(state.selected)) state.selected = visibleIndices[0];
  selectStage(state.selected, false, false);
}
function selectStage(index, focus = true, openPanel = true) {
  state.selected = index; const stage = stages[index], completed = state.completed.includes(stage.id), unlocked = isUnlocked(index);
  const chapterIndex = chapterIndexForStage(index), chapter = chapters[chapterIndex], fragmentPosition = chapter.fragmentStageIds.indexOf(stage.id);
  $("stageRoute").textContent = `记忆路线 · 第${index + 1}站`; $("stageTitle").textContent = stage.title; $("stageSubtitle").textContent = stage.subtitle; $("stageBrief").textContent = stage.brief;
  $("stageRewardTitle").textContent = `本章目标 · ${chapter.rewardTitle}`;
  renderChapterPuzzle($("stagePuzzle"), chapterIndex);
  $("stageStatus").textContent = completed ? `已取得${chapter.fragmentNames[fragmentPosition]}碎片` : unlocked ? `完成后获得${chapter.fragmentNames[fragmentPosition]}碎片` : "尚未解锁"; $("stageScore").textContent = completed ? "已归档" : `0 / ${stage.questions.length} 题`;
  $("startStage").disabled = !unlocked; $("startStage").textContent = completed ? "回顾题目与校史" : unlocked ? "进入档案现场" : "完成上一地标后解锁";
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
  $("quizScreen").classList.toggle("review-mode", state.reviewMode);
  $("quizStageRoute").textContent = `第${state.selected + 1}站 · ${state.reviewMode ? "校史回顾" : "档案核验"}`;
  $("quizStageTitle").textContent = s.title;
  show("quizScreen");
  renderQuestion();
}
function scheduleAgentNudge() {
  clearTimeout(agentNudgeTimer);
  agentNudgeTimer = setTimeout(() => {
    if (!$("quizScreen").hidden && !state.answered && state.chosen === null) {
      const stage = stages[state.selected], question = stage.questions[state.question];
      presentAgent(hebao.nudge({ stage, question }));
    }
  }, 9000);
}
function renderQuestion() {
  if (state.reviewMode) { renderReviewQuestion(); return; }
  const stage = stages[state.selected], item = stage.questions[state.question]; state.chosen = null; state.answered = false; state.clueUsed = false;
  const assisted = state.wrongStreak >= 2;
  const introduction = hebao.introduceQuestion({ stage, question: item, questionIndex: state.question, wrongStreak: state.wrongStreak });
  $("clueButton").hidden = false;
  $("previousQuestion").hidden = state.question === 0 || !state.answerHistory[state.question - 1];
  $("previousReview").hidden = true;
  $("questionCounter").textContent = `${state.question + 1} / ${stage.questions.length}`; $("difficulty").textContent = assisted ? "智能体辅助" : item.difficulty; $("submitAnswer").disabled = true; $("submitAnswer").textContent = "确认核验"; $("clueButton").disabled = false; $("feedback").className = "feedback"; $("feedback").hidden = true; presentAgent(introduction);
  $("options").innerHTML = "";
  renderQuestionMedia(item);
  if (item.type === "judge") renderEvidenceJudgement(item);
  else if (item.type === "sort") renderTimelineSort(item);
  else renderWalkChoice(item, assisted);
  scheduleAgentNudge();
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
  area.innerHTML = `<div class="arena-vignette"></div><img class="arena-player" src="assets/student-restorer.png" alt="校史记忆修复员"><div class="choice-lecterns" role="radiogroup" aria-label="档案选项"></div><p class="arena-instruction">点击档案台走近核验 · 键盘可按 1—4</p>`;
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
  area.innerHTML = `<div class="timeline-rail" aria-label="从早到晚的四个档案位置"></div><div class="crate-yard" aria-label="待放置档案箱"><p class="yard-label">待放置档案</p></div><img class="timeline-player" src="assets/student-restorer.png" alt="校史记忆修复员"><p class="arena-instruction" aria-live="polite">拖动下方档案箱，放入上方对应的档案位</p>`;
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
  $("clueButton").hidden = true;
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
  presentAgent({ speaker: "荷宝", text: `这处地标已经完成修复。现在不用重新作答，我们直接查看第${state.question + 1}份档案的答案与校史依据。`, citations: [{ label: stage.source }], meta: { intent: "review" } });
}
function chooseOption(index) { if (state.answered) return; state.chosen = index; [...$("options").children].forEach((el, i) => el.classList.toggle("selected", i === index)); $("submitAnswer").disabled = false; }
function useClue() { if (state.answered) return; clearTimeout(agentNudgeTimer); const stage = stages[state.selected], item = stage.questions[state.question]; state.clueUsed = true; presentAgent(hebao.giveClue({ stage, question: item })); $("clueButton").disabled = true; $("clueButton").firstChild.textContent = "线索已调阅 "; }
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
  if (right) { state.correct++; state.wrongStreak = 0; } else state.wrongStreak++;
  if (item.type === "choice") $("gameplayArea").querySelectorAll(".archive-lectern").forEach((el, i) => { el.disabled = true; if (i === item.answer) el.classList.add("correct"); if (i === state.chosen && !right) el.classList.add("wrong"); });
  if (item.type === "judge") $("gameplayArea").classList.add(right ? "verified" : "contradicted");
  if (item.type === "sort") $("gameplayArea").querySelectorAll(".archive-crate").forEach(crate => { const index = state.chosen.indexOf(crate.dataset.id); crate.classList.toggle("correct", index >= 0 && crate.dataset.id === state.timelineOrder[index]); });
  const timelineExplanation = item.type === "sort" ? `正确顺序：${item.answerOrder.map(index => item.options[index]).join(" → ")}。${item.explanation}` : item.explanation;
  state.answerHistory[state.question] = { index: state.question, question: $("questionText").textContent, answer: answerSummary(item), right, explanation: timelineExplanation };
  $("feedback").className = `feedback ${right ? "feedback-correct" : "feedback-wrong"}`;
  $("feedback").hidden = false; $("feedback").innerHTML = `<strong>${right ? "核验正确" : "核验错误"}</strong><span>${right ? "答案与档案记录一致" : "答案与档案记录不符"}</span><p>${timelineExplanation}</p>`; $("submitAnswer").textContent = state.question === stages[state.selected].questions.length - 1 ? "完成修复" : "下一份档案"; $("submitAnswer").disabled = false; $("clueButton").disabled = true;
  presentAgent(hebao.reviewAnswer({ stage: stages[state.selected], question: item, right, clueUsed: state.clueUsed, wrongStreak: state.wrongStreak }));
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
    state.question = 0; state.correct = 0; state.answerHistory = []; renderQuestion();
    presentAgent(hebao.reply(`本轮只完成了部分核验。取得照片碎片至少需要答对${requiredCorrect}题，我们带着刚才的解释再核对一次。`, [], { intent: "retry" }));
    return;
  }
  finishStage();
}
function finishStage() {
  clearTimeout(agentNudgeTimer);
  const stage = stages[state.selected]; if (!state.completed.includes(stage.id)) { state.completed.push(stage.id); safeStorage.set("nankai-memory-progress", JSON.stringify(state.completed)); }
  const chapterIndex = chapterIndexForStage(state.selected), chapter = chapters[chapterIndex];
  const fragmentPosition = chapter.fragmentStageIds.indexOf(stage.id), chapterComplete = chapterCompletedCount(chapterIndex) === chapter.stageIds.length;
  $("storyYear").textContent = stage.year; $("storyTitle").textContent = stage.storyTitle; $("storyText").textContent = stage.story; $("storySource").textContent = `资料来源：${stage.source}`;
  $("storyMedia").hidden = !stage.storyImage;
  if (stage.storyImage) { $("storyImage").src = stage.storyImage; $("storyImage").alt = stage.storyCaption || `${stage.title}校史图片`; $("storyImageCaption").textContent = stage.storyCaption; }
  $("rewardStatus").textContent = chapterComplete ? "章节影像完整显影" : "获得章节照片碎片";
  renderChapterPuzzle($("rewardPuzzle"), chapterIndex, stage.id);
  $("restoredCaption").textContent = chapter.rewardCaption;
  $("fragmentEarned").textContent = chapterComplete ? `已集齐 ${chapter.stageIds.length} 块不规则碎片，“${chapter.rewardTitle}”完整归档。` : `新碎片 +1｜${stage.title}核验完成，寻回“${chapter.rewardTitle}”的${chapter.fragmentNames[fragmentPosition]}。`;
  $("continueJourney").textContent = chapterComplete ? (state.selected === stages.length - 1 ? "收录完整影像，完成修复" : "收录完整影像，开启下一章") : "收好碎片，继续寻迹";
  const summary = hebao.summarizeStage({ stage, correct: state.correct, chapterComplete, rewardTitle: chapter.rewardTitle, fragmentName: chapter.fragmentNames[fragmentPosition] });
  $("agentReview").textContent = `荷宝：${summary.text}`; show("storyScreen");
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
  show("mapScreen");
  closeStagePanel();
  if (isFinal) { setStudentPosition(from); updateMapAgent(from); return; }
  if (changesChapter) {
    setStudentPosition(next, false);
    updateMapAgent(next);
    showChapterIntro(nextChapterIndex);
    return;
  }
  updateMapAgent(next, true);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    setStudentPosition(next, true);
    moveCameraTo(next);
    setTimeout(() => {
      $("studentAvatar").classList.remove("walking");
      updateMapAgent(next);
      document.querySelectorAll(".stage-node").forEach(node => node.classList.toggle("selected", Number(node.dataset.stageIndex) === next));
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 1900);
  }));
}

function enableMapMovement() {
  const viewport = $("mapViewport"); let dragging = false, startX = 0, startY = 0, startScrollX = 0, startScrollY = 0;
  viewport.addEventListener("pointerdown", event => { if (event.target.closest("button")) return; dragging = true; startX = event.clientX; startY = event.clientY; startScrollX = viewport.scrollLeft; startScrollY = viewport.scrollTop; viewport.setPointerCapture(event.pointerId); });
  viewport.addEventListener("pointermove", event => { if (dragging) { viewport.scrollLeft = startScrollX - (event.clientX - startX); viewport.scrollTop = startScrollY - (event.clientY - startY); } });
  viewport.addEventListener("pointerup", () => dragging = false); viewport.addEventListener("pointercancel", () => dragging = false);
  viewport.addEventListener("keydown", event => { if (["ArrowRight", "d", "D"].includes(event.key)) viewport.scrollBy({ left: 280, behavior: "smooth" }); if (["ArrowLeft", "a", "A"].includes(event.key)) viewport.scrollBy({ left: -280, behavior: "smooth" }); if (["ArrowDown", "s", "S"].includes(event.key)) viewport.scrollBy({ top: 220, behavior: "smooth" }); if (["ArrowUp", "w", "W"].includes(event.key)) viewport.scrollBy({ top: -220, behavior: "smooth" }); });
}

function enableMapAgentMovement() {
  const agent = $("mapAgent"), handle = $("mapAgentHandle"), world = $("mapWorld");
  let pointerId = null, startX = 0, startY = 0, startLeft = 0, startTop = 0, moved = false;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));
  const place = (left, top, remember = false) => {
    const safe = 10;
    const x = clamp(left, safe, world.clientWidth - agent.offsetWidth - safe);
    const y = clamp(top, safe, world.clientHeight - agent.offsetHeight - safe);
    agent.style.left = `${x}px`; agent.style.top = `${y}px`; agent.style.right = "auto"; agent.style.bottom = "auto";
    agent.classList.toggle("bubble-right", x < world.clientWidth / 2);
    if (remember) safeStorage.set("hebao-map-position", JSON.stringify({ x: x / world.clientWidth, y: y / world.clientHeight }));
  };

  let saved = null;
  try { saved = JSON.parse(safeStorage.get("hebao-map-position", "null")); } catch { safeStorage.remove("hebao-map-position"); }
  if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) requestAnimationFrame(() => place(saved.x * world.clientWidth, saved.y * world.clientHeight));

  handle.addEventListener("pointerdown", event => {
    event.preventDefault(); event.stopPropagation();
    const rect = agent.getBoundingClientRect(), parent = world.getBoundingClientRect();
    pointerId = event.pointerId; moved = false; startX = event.clientX; startY = event.clientY;
    startLeft = rect.left - parent.left; startTop = rect.top - parent.top;
    agent.classList.add("dragging"); handle.setPointerCapture(pointerId);
  });
  handle.addEventListener("pointermove", event => {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - startX, dy = event.clientY - startY;
    if (Math.hypot(dx, dy) > 4) moved = true;
    if (moved) place(startLeft + dx, startTop + dy);
  });
  const finish = event => {
    if (event.pointerId !== pointerId) return;
    if (moved) {
      const rect = agent.getBoundingClientRect(), parent = world.getBoundingClientRect();
      place(rect.left - parent.left, rect.top - parent.top, true);
    } else setMapAgentOpen(!agent.classList.contains("open"));
    agent.classList.remove("dragging"); pointerId = null;
  };
  handle.addEventListener("pointerup", finish); handle.addEventListener("pointercancel", finish);
  handle.addEventListener("click", event => {
    event.stopPropagation();
    if (event.detail === 0) setMapAgentOpen(!agent.classList.contains("open"));
  });
  handle.addEventListener("keydown", event => {
    const movement = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[event.key];
    if (!movement) return;
    event.preventDefault(); event.stopPropagation();
    const rect = agent.getBoundingClientRect(), parent = world.getBoundingClientRect();
    place(rect.left - parent.left + movement[0], rect.top - parent.top + movement[1], true);
  });
  $("mapAgentDismiss").addEventListener("click", event => { event.stopPropagation(); setMapAgentOpen(false); handle.focus(); });
  agent.addEventListener("click", event => event.stopPropagation());
  window.addEventListener("resize", () => {
    const rect = agent.getBoundingClientRect(), parent = world.getBoundingClientRect();
    place(rect.left - parent.left, rect.top - parent.top);
  });
}

$("enterGame").addEventListener("click", () => { state.selected = Math.min(state.completed.length, stages.length - 1); activeChapterIndex = Math.max(0, chapterIndexForStage(state.selected)); showChapterIntro(activeChapterIndex); });
$("enterChapter").addEventListener("click", enterActiveChapter);
$("resetGame").addEventListener("click", () => { safeStorage.remove("nankai-memory-progress"); state.completed = []; state.selected = 0; activeChapterIndex = 0; renderMap(); });
$("startStage").addEventListener("click", startStage); $("backToMap").addEventListener("click", () => { clearTimeout(agentNudgeTimer); state.reviewMode = false; $("quizScreen").classList.remove("review-mode"); activeChapterIndex = Math.max(0, chapterIndexForStage(state.selected)); renderMap(); show("mapScreen"); moveCameraTo(state.selected); }); $("clueButton").addEventListener("click", useClue); $("previousQuestion").addEventListener("click", showPreviousQuestion); $("closePreviousReview").addEventListener("click", closePreviousQuestion); $("submitAnswer").addEventListener("click", submitAnswer); $("continueJourney").addEventListener("click", journeyToNextStage);
$("closeStagePanel").addEventListener("click", closeStagePanel);
$("mapViewport").addEventListener("click", event => { if (!event.target.closest(".stage-node")) closeStagePanel(); });
enableMapMovement();
enableMapAgentMovement();

document.addEventListener("keydown", (event) => { if (!$("quizScreen").hidden && !state.reviewMode && !state.answered && state.question === 0 && /^[1-4]$/.test(event.key)) chooseWalkOption(Number(event.key) - 1); });

