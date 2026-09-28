// ─────────────────────────────────────────────────────────────
// 地图建筑位置调节区
// x：建筑节点距地图左侧的百分比；数值变大向右，变小向左。
// y：建筑节点距地图顶部的百分比；数值变大向下，变小向上。
// walkX / walkY：学生在该地标前的站立位置，调整方法与 x / y 相同。
// 每栋建筑和学生站位都可单独调整。保存文件并刷新网页即可看到结果。
// ─────────────────────────────────────────────────────────────
const stageCatalog = [
  {
    id: "bell", title: "校钟", subtitle: "一声钟鸣，唤回百年公能记忆", x: 20.0, y: 18.0, walkX: 20, walkY: 42, sprite: "assets/landmark-bell.png",
    brief: "辨认校钟铭文与南开早期的办学理想，修复一张关于南开精神象征的影像。",
    year: "1919—至今", storyTitle: "钟声里的办学理想",
    story: "南开创办之初设文、理、商三科。校钟铭文“文以治国、理以强国、商以富国”，把知识与救国理想联系在一起。钟声并不只是报时，也提醒每一代南开人把所学用于国家与社会。",
    source: "南开校园文化读本 · 第二章 校名与校园标识",
    photo: "assets/archive-bell.jpg", caption: "校钟与南开公能精神",
    questions: [
      q("校钟铭文体现的办学追求是？", ["文以治国、理以强国、商以富国", "兼容并包、思想自由", "实业救国、工学并举", "自强不息、厚德载物"], 0, "铭文直接对应南开创校初期的文、理、商三科。", "注意三个分句分别对应三类学科。"),
      q("南开大学创办之初首先设立了哪三科？", ["文、理、商", "工、农、医", "法、商、教育", "文、法、理"], 0, "1919 年创办时设文、理、商三科，此后增设矿科。", "校钟铭文已经给出了三科的用途。"),
      q("“允公允能，日新月异”中的“公”主要指什么？", ["公立办学性质", "公开透明原则", "爱国爱群之公德", "公平竞争意识"], 2, "“公”强调服务国家与社会的公民责任。", "它不是学校属性，而是一种面向国家和社会的品格。")
    ]
  },
  {
    id: "siyuan", title: "思源堂", subtitle: "从创校理想到早期校园", x: 46.0, y: 18.0, walkX: 46, walkY: 42, sprite: "assets/landmark-siyuan.png",
    brief: "从创校年代、创办人和第一期学生入手，确认南开大学的起点。",
    year: "1919", storyTitle: "大学在民族危局中诞生",
    story: "1919 年，严修、张伯苓创办南开大学。同年 9 月举行开学典礼，第一期学生共 96 人，其中包括学号 62 号的周恩来。学校以私人筹款和社会捐助起步，却把教育救国写进了办学初心。",
    source: "南开校史讲义 · 第一章 创校与早期发展",
    photo: "assets/archive-opening.jpg", caption: "1919 年南开大学开学典礼合影",
    questions: [
      q("南开大学创办于哪一年？", ["1904 年", "1919 年", "1935 年", "1946 年"], 1, "南开学校起点是 1904 年，南开大学则创办于 1919 年。", "区分“南开学校起点”和“南开大学创办”。"),
      q("南开大学的共同创办者是？", ["严修与张伯苓", "蔡元培与胡适", "梅贻琦与蒋梦麟", "姜立夫与陈省身"], 0, "严修奠基、张伯苓办学，共同开创南开系列学校。", "一位被尊为“南开校父”，一位是首任校长。"),
      q("1919 年第一期学生中，学号 62 号的是谁？", ["曹禺", "周恩来", "陈省身", "杨石先"], 1, "周恩来 1919 年入南开大学文科，1920 年赴法勤工俭学。", "这位学生后来成为中华人民共和国第一任总理。")
    ]
  },
  {
    id: "three", title: "爱国三问碑", subtitle: "回答穿越九十年的三次追问", x: 71.0, y: 18.0, walkX: 71, walkY: 42, sprite: "assets/landmark-three.png",
    brief: "回到 1935 年的开学典礼，辨认爱国三问提出者、时代背景与原文。",
    year: "1935", storyTitle: "三问之下，是教育救国",
    story: "日本侵华加剧、华北局势紧张之际，张伯苓在开学典礼上提出：“你是中国人吗？你爱中国吗？你愿意中国好吗？”三问把身份、情感与行动连在一起，成为南开爱国主义传统最凝练的表达。",
    source: "南开校史讲义 · 第四章 精神传统",
    photo: "assets/archive-three-questions.jpg", caption: "1935 年张伯苓与爱国三问",
    questions: [
      q("“爱国三问”是谁在开学典礼上提出的？", ["严修", "张伯苓", "周恩来", "陶行知"], 1, "张伯苓在民族危亡加深的背景下提出爱国三问。", "他也是南开大学首任校长。"),
      q("爱国三问提出于哪一年？", ["1919 年", "1928 年", "1935 年", "1938 年"], 2, "1935 年华北局势紧张，爱国三问应时而生。", "这一年在校园被炸毁前两年。"),
      q("下列哪一句属于“爱国三问”？", ["你愿意中国好吗？", "你能建设中国吗？", "你认识中国吗？", "你保卫中国吗？"], 0, "原文第三问是“你愿意中国好吗？”", "线索在“身份—情感—愿望”的递进结构。")
    ]
  },
  {
    id: "library", title: "木斋图书馆", subtitle: "从被毁藏书中寻找证词", x: 20.0, y: 75, walkX: 20, walkY: 91, sprite: "assets/landmark-muzhai.png",
    brief: "调查 1937 年校园被炸与南迁史实，在残缺档案之间交叉印证。",
    year: "1937", storyTitle: "校园被毁，弦歌未辍",
    story: "1937 年 7 月，南开大学校园遭日军炮击轰炸，图书馆、教学楼等校舍严重被毁。师生在极短时间内组织南迁。南开是抗战中最早被毁、也最早开始内迁的大学之一。",
    source: "南开校史讲义 · 第二章 抗战内迁与西南联大",
    photo: "assets/archive-destroyed.jpg", caption: "战前南开档案中的路线图",
    questions: [
      q("1937 年南开大学遭遇的直接打击是？", ["校园被日军炮击轰炸", "主动迁往西安", "与清华合并", "暂停办学一年"], 0, "校园被炮击轰炸、校舍严重被毁，师生被迫南迁。", "关注“战火、校舍、南迁”三个关键词。"),
      q("南开被毁后，三校首先组成了什么学校？", ["国立北平大学", "国立长沙临时大学", "国立西南联合大学", "国立联合学院"], 1, "1937 年先在长沙组成临时大学，1938 年再迁昆明组建西南联大。", "先长沙，后昆明。"),
      q("“南开南开，越难越开”主要体现何种精神？", ["追求规模扩张", "在困境中坚持办学", "重视校区建设", "强调竞技体育"], 1, "这句话概括了南开在经费困难与战乱中坚持办学的韧性。", "“难”与“开”形成转折。")
    ]
  },
  {
    id: "main", title: "主楼·周总理像", subtitle: "从第一期学生到爱国报国传统", x: 48, y: 75, walkX: 48, walkY: 91, sprite: "assets/landmark-main-zhou.png",
    brief: "走近主楼前的周恩来总理像，辨认第一期学生、学号与南开爱国传统。",
    year: "1919—今日", storyTitle: "从学号 62 到人民总理",
    story: "周恩来 1919 年进入南开大学文科，是学校第一期学生，学号 62 号。主楼前的周总理像把一位青年学生与后来服务国家的一生连接起来，也让爱国报国的传统成为校园日常景观的一部分。",
    source: "南开人物志 · 第二章 杰出校友",
    photo: "assets/archive-lianda.jpg", caption: "主楼与周恩来总理像",
    questions: [
      q("周恩来是哪一年进入南开大学学习的？", ["1904 年", "1919 年", "1935 年", "1946 年"], 1, "周恩来 1919 年进入南开大学文科，是第一期学生。", "与南开大学创办同年。"),
      q("周恩来在南开大学的学号是？", ["12 号", "42 号", "62 号", "96 号"], 2, "周恩来是南开大学第一期学生，学号 62 号。", "第一期共有 96 名学生，学号不是人数。"),
      q("周恩来于哪一年赴法勤工俭学？", ["1919 年", "1920 年", "1928 年", "1935 年"], 1, "周恩来 1920 年赴法勤工俭学。", "入学后的第二年。")
    ]
  },
  {
    id: "today", title: "津南图书馆", subtitle: "旧影归档，精神继续生长", x: 76, y: 73, walkX: 76, walkY: 89, sprite: "assets/landmark-jinnan-library.png",
    brief: "把复校、学科建设和双校区发展串联起来，完成影像册最后一页。",
    year: "1946—今日", storyTitle: "从复校到新的百年",
    story: "1946 年八里台复校，1952 年成为文理综合大学。2015 年津南校区启用，南开形成双校区格局。2019 年学校迎来建校百年。建筑在变化，爱国、务实与日新的精神仍在延续。",
    source: "南开校史讲义 · 第一、三、四章",
    photo: "assets/archive-today.jpg", caption: "双校区时代的今日南开",
    questions: [
      q("1952 年院系调整后，南开大学被定位为？", ["工科院校", "文理综合大学", "师范院校", "农业院校"], 1, "院系调整后南开成为文理综合大学，基础学科进一步夯实。", "数学、化学、经济、历史是关键提示。"),
      q("津南校区启用于哪一年？", ["2004 年", "2010 年", "2015 年", "2019 年"], 2, "2015 年津南校区启用，形成八里台与津南并行格局。", "它早于百年校庆四年。"),
      q("南开大学迎来建校 100 周年是哪一年？", ["2004 年", "2015 年", "2019 年", "2021 年"], 2, "南开大学创办于 1919 年，因此 2019 年为建校百年。", "用创办年份加一百。")
    ]
  }
];

function eraQuestions(period) {
  if (period === "origin") return [
    q("南开大学创办于哪一年？", ["1904年", "1919年", "1937年", "1946年"], 1, "南开大学创办于1919年；1904年是南开系列学校的起点。", "区分南开学校起点与南开大学创办年份。"),
    q("南开大学的共同创办者是？", ["严修与张伯苓", "蔡元培与胡适", "梅贻琦与蒋梦麟", "姜立夫与陈省身"], 0, "严修与张伯苓共同开创南开系列学校。", "两位人物分别被尊为南开校父与首任校长。"),
    q("1937年南开校园被毁后，三校首先组成了什么学校？", ["国立长沙临时大学", "国立西南联合大学", "国立北平大学", "国立联合学院"], 0, "三校先在长沙组成临时大学，1938年再迁昆明组建西南联大。", "先长沙，后昆明。")
  ];
  if (period === "rebuild") return [
    q("南开大学在哪一年于天津八里台复校？", ["1938年", "1946年", "1952年", "1978年"], 1, "1946年西南联大结束，南开回到天津八里台复校。", "抗战胜利后的第二年。"),
    q("1952年院系调整后，南开大学被定位为？", ["工科院校", "文理综合大学", "师范院校", "农业院校"], 1, "1952年后南开成为文理综合大学。", "数学、化学、经济、历史是关键提示。"),
    q("南开在复校后由私立改为什么性质？", ["国立大学", "教会大学", "市立大学", "联合大学"], 0, "1946年南开由私立改为国立并复校。", "答案与复校发生在同一年。")
  ];
  return [
    q("周恩来在南开大学的学号是？", ["12号", "42号", "62号", "96号"], 2, "周恩来是南开大学第一期学生，学号62号。", "第一期共有96名学生，学号不是人数。"),
    q("津南校区启用于哪一年？", ["2004年", "2010年", "2015年", "2019年"], 2, "2015年津南校区启用，形成双校区格局。", "它早于百年校庆四年。"),
    q("南开大学迎来建校100周年是哪一年？", ["2004年", "2015年", "2019年", "2021年"], 2, "南开大学创办于1919年，因此2019年为建校百年。", "用创办年份加一百。")
  ];
}

function eraStage(id, title, period, subtitle, sprite = "") {
  const periodText = period === "origin" ? "1919—1948" : period === "rebuild" ? "1949—1978" : "1979—至今";
  return {
    id, title, subtitle, sprite, period, x: 50, y: 50, walkX: 50, walkY: 58,
    brief: `建筑专属档案仍待补充。本关先从${title}出发，核验${periodText}阶段的可靠校史节点。`,
    year: periodText,
    storyTitle: `${title}与${periodText}记忆`,
    story: "本关当前采用档案馆已有的阶段校史材料进行核验。待补充建筑沿革、历史照片与人物回忆后，将替换为该地标专属题组。",
    source: "南开校史讲义 · 阶段史料（建筑专属资料待补充）",
    photo: period === "origin" ? "assets/archive-opening.jpg" : period === "rebuild" ? "assets/archive-destroyed.jpg" : "assets/archive-today.jpg",
    caption: `${title}阶段校史档案`,
    questions: eraQuestions(period)
  };
}

stageCatalog.push(
  eraStage("mati", "马蹄湖", "origin", "湖畔见证早期南开的校园记忆", "assets/landmark-mati.png"),
  eraStage("xiushan", "秀山堂", "origin", "从早期教学空间寻找办学起点", "assets/landmark-xiushan.png"),
  eraStage("xinkai", "新开湖", "rebuild", "从复校后的校园生长读懂新南开", "assets/landmark-xinkai.png"),
  eraStage("haibing", "海冰楼", "rebuild", "沿公共文化空间回望校园重建", "assets/landmark-haibing.png"),
  eraStage("wenzhong", "文中馆", "rebuild", "在书页与馆舍之间确认学科积累", "assets/landmark-wenzhong.png"),
  eraStage("zhou", "周恩来总理像", "renewal", "从第一期学生到爱国报国传统", "assets/landmark-main-zhou.png"),
  eraStage("lianda", "西南联大纪念碑", "renewal", "让迁校记忆在今日校园继续被看见", "assets/landmark-lianda-memorial.png"),
  eraStage("yifu", "逸夫馆", "renewal", "从知识空间进入开放发展的新时期", "assets/landmark-yifu.png")
);

const chapters = [
  { id: "origin", title: "1919—1948", subtitle: "私立南开、战火南迁与复校", background: "assets/campus-empty-origin-v2.png", stageIds: ["bell", "mati", "xiushan", "siyuan", "library"] },
  { id: "rebuild", title: "1949—1978", subtitle: "院系调整与校园重建", background: "assets/campus-empty-rebuild.png", stageIds: ["xinkai", "haibing", "wenzhong", "main"] },
  { id: "renewal", title: "1979—至今", subtitle: "开放发展、双校区与新的百年", background: "assets/campus-empty-renewal.png", stageIds: ["zhou", "lianda", "yifu", "today", "three"] }
];

const catalogById = Object.fromEntries(stageCatalog.map(stage => [stage.id, stage]));
catalogById.bell.title = "老校钟";
catalogById.main.title = "主楼";
catalogById.today.title = "津南中心馆";
const stages = chapters.flatMap(chapter => chapter.stageIds.map(id => catalogById[id]));
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

const state = { completed: JSON.parse(localStorage.getItem("nankai-memory-progress") || "[]"), selected: 0, question: 0, correct: 0, chosen: null, answered: false, clueUsed: false, wrongStreak: 0 };
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

function show(screen) { ["intro", "mapScreen", "quizScreen", "storyScreen"].forEach(id => $(id).hidden = id !== screen); window.scrollTo(0, 0); }
function isUnlocked(index) { return index === 0 || state.completed.includes(stages[index - 1].id); }
function chapterIndexForStage(index) { return chapters.findIndex(chapter => chapter.stageIds.includes(stages[index]?.id)); }
function chapterStageIndices(chapterIndex = activeChapterIndex) { return chapters[chapterIndex].stageIds.map(id => stages.findIndex(stage => stage.id === id)); }
function renderChapterNav() {
  const nav = $("chapterNav"); nav.innerHTML = "";
  chapters.forEach((chapter, index) => {
    const button = document.createElement("button"), chapterIndices = chapterStageIndices(index);
    const completed = chapterIndices.filter(stageIndex => state.completed.includes(stages[stageIndex].id)).length;
    button.className = `chapter-tab ${index === activeChapterIndex ? "active" : ""}`;
    button.setAttribute("aria-current", index === activeChapterIndex ? "page" : "false");
    button.innerHTML = `<strong>${chapter.title}</strong><span>${completed}/${chapterIndices.length}</span>`;
    button.addEventListener("click", () => {
      activeChapterIndex = index;
      state.selected = chapterIndices.includes(state.selected) ? state.selected : chapterIndices[0];
      closeStagePanel(); renderMap();
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
  const stage = stages[index];
  presentAgent(hebao.guideMap({ stage, stageIndex: index, completed: state.completed.length, total: stages.length, travelling }), "map");
}
function renderMap(studentIndex = reachedStageIndex()) {
  const chapter = chapters[activeChapterIndex], visibleIndices = chapterStageIndices(), nodes = $("stageNodes"); nodes.innerHTML = "";
  $("chapterMapTitle").textContent = chapter.title; $("chapterMapSubtitle").textContent = chapter.subtitle;
  $("mapWorld").style.backgroundImage = `url("${chapter.background}")`;
  renderChapterNav();
  visibleIndices.forEach(index => {
    const stage = stages[index];
    const completed = state.completed.includes(stage.id), unlocked = isUnlocked(index);
    const button = document.createElement("button");
    button.className = `stage-node ${completed ? "completed" : unlocked ? "active" : "locked"}`;
    button.dataset.stageIndex = String(index);
    button.style.left = `${stage.x}%`; button.style.top = `${stage.y}%`;
    button.setAttribute("aria-disabled", String(!unlocked)); button.setAttribute("aria-label", `${stage.title}，${completed ? "已修复" : unlocked ? "可进入" : "尚未解锁"}`);
    const visual = stage.sprite ? `<img class="landmark-sprite" src="${stage.sprite}" alt="">` : `<span class="landmark-placeholder"><b>${stage.title}</b><small>建筑影像待补充</small></span>`;
    button.innerHTML = `${visual}<span class="pin"><b>${completed ? "✓" : unlocked ? index + 1 : "×"}</b></span><span class="node-label">${stage.title}</span>`;
    button.addEventListener("click", event => { event.stopPropagation(); toggleStagePanel(index); }); nodes.appendChild(button);
  });
  const restored = state.completed.length, reached = reachedStageIndex(), reachedStage = stages[reached];
  $("restoredCount").textContent = restored; $("overallProgress").style.transform = `scaleX(${restored / stages.length})`;
  const studentInChapter = stages[studentIndex]?.chapterId === chapter.id;
  $("studentAvatar").hidden = !studentInChapter;
  if (studentInChapter) setStudentPosition(studentIndex, false);
  updateMapAgent(studentInChapter ? reached : visibleIndices[0]);
  if (!visibleIndices.includes(state.selected)) state.selected = visibleIndices[0];
  selectStage(state.selected, false, false);
}
function selectStage(index, focus = true, openPanel = true) {
  state.selected = index; const stage = stages[index], completed = state.completed.includes(stage.id), unlocked = isUnlocked(index);
  $("stageRoute").textContent = `记忆路线 · 第${index + 1}站`; $("stageTitle").textContent = stage.title; $("stageSubtitle").textContent = stage.subtitle; $("stageBrief").textContent = stage.brief;
  $("stagePhoto").src = stage.photo; $("stagePhoto").alt = stage.caption; $("photoMask").style.opacity = completed ? 0 : 1; $("stageStatus").textContent = completed ? "影像已归档" : unlocked ? "等待修复" : "尚未解锁"; $("stageScore").textContent = completed ? "3 / 3 题" : "0 / 3 题";
  $("startStage").disabled = !unlocked; $("startStage").textContent = completed ? "再次查阅档案" : unlocked ? "进入档案现场" : "完成上一地标后解锁";
  document.querySelectorAll(".stage-node").forEach(node => node.classList.toggle("selected", Number(node.dataset.stageIndex) === index));
  if (openPanel) { setMapAgentOpen(false); $("stagePanel").classList.add("open"); }
}
function closeStagePanel() { $("stagePanel").classList.remove("open"); }
function toggleStagePanel(index) { if (state.selected === index && $("stagePanel").classList.contains("open")) { closeStagePanel(); return; } selectStage(index, false, true); }
function startStage() { state.question = 0; state.correct = 0; state.chosen = null; state.answered = false; state.clueUsed = false; state.wrongStreak = 0; const s = stages[state.selected]; $("quizStageRoute").textContent = `第${state.selected + 1}站 · 影像修复`; $("quizStageTitle").textContent = s.title; $("quizPhoto").src = s.photo; $("quizPhoto").alt = s.caption; show("quizScreen"); renderQuestion(); }
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
  const stage = stages[state.selected], item = stage.questions[state.question]; state.chosen = null; state.answered = false; state.clueUsed = false;
  const assisted = state.wrongStreak >= 2;
  const introduction = hebao.introduceQuestion({ stage, question: item, questionIndex: state.question, wrongStreak: state.wrongStreak });
  $("questionCounter").textContent = `${state.question + 1} / ${stage.questions.length}`; $("questionText").textContent = item.text; $("difficulty").textContent = assisted ? "智能体辅助" : "基础"; $("submitAnswer").disabled = true; $("submitAnswer").textContent = "确认答案"; $("clueButton").disabled = false; $("feedback").hidden = true; presentAgent(introduction);
  const options = $("options"); options.innerHTML = ""; item.options.forEach((text, i) => { const b = document.createElement("button"); b.className = "option"; b.innerHTML = `<span class="option-key">${String.fromCharCode(65+i)}</span><span>${text}</span>`; b.addEventListener("click", () => chooseOption(i)); options.appendChild(b); });
  if (assisted) { const eliminated = item.options.findIndex((_, i) => i !== item.answer); const option = options.children[eliminated]; option.disabled = true; option.classList.add("eliminated"); option.setAttribute("aria-label", `${item.options[eliminated]}，已由荷宝排除`); }
  document.querySelectorAll(".fragment-row span").forEach((span, i) => span.classList.toggle("restored", i < state.correct)); $("quizPhotoMask").style.opacity = `${Math.max(.12, 1 - state.correct * .3)}`;
  scheduleAgentNudge();
}
function chooseOption(index) { if (state.answered) return; state.chosen = index; [...$("options").children].forEach((el, i) => el.classList.toggle("selected", i === index)); $("submitAnswer").disabled = false; }
function useClue() { if (state.answered) return; clearTimeout(agentNudgeTimer); const stage = stages[state.selected], item = stage.questions[state.question]; state.clueUsed = true; presentAgent(hebao.giveClue({ stage, question: item })); $("clueButton").disabled = true; $("clueButton").firstChild.textContent = "线索已调阅 "; }
function submitAnswer() {
  if (state.chosen === null) return; if (state.answered) { nextQuestion(); return; }
  clearTimeout(agentNudgeTimer); state.answered = true; const item = stages[state.selected].questions[state.question], right = state.chosen === item.answer; if (right) { state.correct++; state.wrongStreak = 0; } else state.wrongStreak++;
  [...$("options").children].forEach((el, i) => { el.disabled = true; if (i === item.answer) el.classList.add("correct"); if (i === state.chosen && !right) el.classList.add("wrong"); });
  $("feedback").hidden = false; $("feedback").innerHTML = `<strong>${right ? "档案核验通过" : "这份记录需要重新辨认"}</strong><br>${item.explanation}`; $("submitAnswer").textContent = state.question === 2 ? "完成修复" : "下一份档案"; $("submitAnswer").disabled = false; $("clueButton").disabled = true;
  presentAgent(hebao.reviewAnswer({ stage: stages[state.selected], question: item, right, clueUsed: state.clueUsed, wrongStreak: state.wrongStreak }));
  document.querySelectorAll(".fragment-row span").forEach((span, i) => span.classList.toggle("restored", i < state.correct)); $("quizPhotoMask").style.opacity = `${Math.max(.05, 1 - state.correct * .31)}`;
}
function nextQuestion() {
  if (state.question < 2) { state.question++; renderQuestion(); return; }
  if (state.correct < 2) {
    state.question = 0; state.correct = 0; renderQuestion();
    presentAgent(hebao.reply("本轮只完成了部分核验。修复一张影像至少需要通过2份档案，我们带着刚才的解释再核对一次。", [], { intent: "retry" }));
    $("evidencePrompt").textContent = "至少答对 2 题才能让影像完整显影。";
    return;
  }
  finishStage();
}
function finishStage() {
  clearTimeout(agentNudgeTimer);
  const stage = stages[state.selected]; if (!state.completed.includes(stage.id)) { state.completed.push(stage.id); localStorage.setItem("nankai-memory-progress", JSON.stringify(state.completed)); }
  $("storyYear").textContent = stage.year; $("storyTitle").textContent = stage.storyTitle; $("storyText").textContent = stage.story; $("storySource").textContent = `资料来源：${stage.source}`; $("restoredPhoto").src = stage.photo; $("restoredPhoto").alt = stage.caption; $("restoredCaption").textContent = stage.caption;
  const summary = hebao.summarizeStage({ stage, correct: state.correct });
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
    $("mapWorld").classList.add("chapter-entering");
    setStudentPosition(next, false); $("studentAvatar").hidden = false;
    updateMapAgent(next);
    setTimeout(() => $("mapWorld").classList.remove("chapter-entering"), 600);
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
    if (remember) localStorage.setItem("hebao-map-position", JSON.stringify({ x: x / world.clientWidth, y: y / world.clientHeight }));
  };

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem("hebao-map-position") || "null"); } catch { localStorage.removeItem("hebao-map-position"); }
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

$("enterGame").addEventListener("click", () => { state.selected = Math.min(state.completed.length, stages.length - 1); activeChapterIndex = Math.max(0, chapterIndexForStage(state.selected)); renderMap(); show("mapScreen"); setTimeout(() => moveCameraTo(state.selected), 80); });
$("resetGame").addEventListener("click", () => { localStorage.removeItem("nankai-memory-progress"); state.completed = []; state.selected = 0; activeChapterIndex = 0; renderMap(); });
$("startStage").addEventListener("click", startStage); $("backToMap").addEventListener("click", () => { clearTimeout(agentNudgeTimer); activeChapterIndex = Math.max(0, chapterIndexForStage(state.selected)); renderMap(); show("mapScreen"); moveCameraTo(state.selected); }); $("clueButton").addEventListener("click", useClue); $("submitAnswer").addEventListener("click", submitAnswer); $("continueJourney").addEventListener("click", journeyToNextStage);
$("closeStagePanel").addEventListener("click", closeStagePanel);
$("mapViewport").addEventListener("click", event => { if (!event.target.closest(".stage-node")) closeStagePanel(); });
enableMapMovement();
enableMapAgentMovement();

document.addEventListener("keydown", (event) => { if (!$("quizScreen").hidden && !state.answered && /^[1-4]$/.test(event.key)) chooseOption(Number(event.key) - 1); });
