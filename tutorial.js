class NankaiTutorial {
  constructor() {
    this.overlay = document.getElementById("tutorialOverlay");
    this.card = document.getElementById("tutorialCard");
    this.focusRing = document.getElementById("tutorialFocus");
    this.index = 0;
    this.steps = [];
    this.userKey = "guest";
    this.active = false;
    this.lastFocus = null;
    this.resizeFrame = null;
    this.surface = "intro";
    this.pendingSurfaces = new Set();
    document.querySelectorAll(".tutorial-trigger").forEach(button => button.addEventListener("click", () => this.start(false)));
    document.getElementById("tutorialPrevious").addEventListener("click", () => this.go(-1));
    document.getElementById("tutorialNext").addEventListener("click", () => this.go(1));
    document.getElementById("tutorialSkip").addEventListener("click", () => this.finish(true));
    window.addEventListener("resize", () => this.scheduleLayout());
    window.addEventListener("scroll", () => this.scheduleLayout(), true);
    document.addEventListener("keydown", event => this.onKeydown(event));
  }

  storageKey(username, surface = "intro") {
    const base = `nankai-memory-tutorial-v1:${username || "guest"}`;
    return surface === "intro" ? base : `${base}:${surface}`;
  }

  autoFor(username) {
    if (!username || localStorage.getItem(this.storageKey(username, "intro")) === "done" || this.active) return;
    this.userKey = username;
    this.scheduleAutomatic("intro");
  }

  autoForSurface(surface) {
    if (!['map', 'quiz'].includes(surface)) return;
    this.userKey = window.nankaiAccount?.user?.username || this.userKey || "guest";
    if (localStorage.getItem(this.storageKey(this.userKey, surface)) === "done" || this.active) return;
    this.scheduleAutomatic(surface);
  }

  scheduleAutomatic(surface) {
    if (this.pendingSurfaces.has(surface)) return;
    this.pendingSurfaces.add(surface);
    window.setTimeout(() => {
      this.pendingSurfaces.delete(surface);
      if (this.active || this.currentSurface() !== surface) return;
      this.start(true, surface);
    }, 420);
  }

  currentSurface() {
    if (!document.getElementById("quizScreen").hidden) return "quiz";
    if (!document.getElementById("mapScreen").hidden) return "map";
    return "intro";
  }

  stepsFor(surface) {
    if (surface === "map") return [
      { target:".header-progress", title:"收集影像碎片", text:"完成每座地标的档案核验，就能获得照片碎片。顶部会记录整场修复行动的总进度。" },
      { target:".stage-node.active", title:"沿记忆路线逐站修复", text:"从亮起的地标开始。点击建筑查看档案，再进入现场完成选择、判断和排序核验；后续地标会依次解锁。" },
      { target:"#mapAgent", title:"跟随地图中的荷宝", text:"荷宝会介绍章节、带你前往下一站，并在路线尚未解锁时说明条件。完成关卡后，点击“跟上荷宝”继续前进。" },
      { target:"#hebaoChatTrigger", title:"随时打开“问荷宝”", text:"点击右上角“问荷宝”打开对话框，可以询问校史、建筑、人物、玩法和当前题目的分层线索。答题提交前，荷宝只给线索，不会直接泄露答案。" }
    ];
    if (surface === "quiz") return [
      { target:".question-card", title:"核验三类校史档案", text:"每个地标包含选择、判断和排序三种档案任务。认真阅读题目与档案材料，再完成核验。" },
      { target:"#hebaoChatTrigger", title:"遇到困难直接问荷宝", text:"点击右上角“问荷宝·有线索”打开对话框。荷宝会结合当前题目逐层提供观察方向、档案证据与排除思路，提交前不会直接说出答案。" },
      { target:"#submitAnswer", title:"确认后查看核验结果", text:"选择完成后点击“确认核验”。答对至少三分之二即可取得本地标的照片碎片；未通过时可以重新寻迹。" }
    ];
    return [
      { target:".intro-copy", title:"修复散落的南开记忆", text:"你的任务是沿三段历史路线走访校园地标，核验校史档案，并让三张散佚影像重新显影。" },
      { target:".intro-file", title:"收集14枚照片碎片", text:"每完成一座地标，就能找回一枚影像碎片。集齐本章碎片会修复完整照片，并解锁下一段历史。" },
      { target:".intro-agent", title:"荷宝会一路陪伴你", text:"地图中的荷宝负责剧情引导和带路；进入游戏后，顶部“问荷宝”会打开独立对话框，支持校史问答、玩法说明和答题线索。" },
      { target:"#enterGame", title:"准备好就接受任务", text:"点击“接受修复任务”进入章节序幕。之后你可以在地图或答题页顶部随时重新打开这份新手指引。" }
    ];
  }

  start(automatic = false, requestedSurface = null) {
    if (this.active) return;
    this.userKey = window.nankaiAccount?.user?.username || this.userKey || "guest";
    this.surface = requestedSurface || this.currentSurface();
    this.steps = this.stepsFor(this.surface).filter(step => document.querySelector(step.target));
    if (!this.steps.length) return;
    this.index = 0;
    this.active = true;
    this.automatic = automatic;
    this.lastFocus = document.activeElement;
    this.overlay.hidden = false;
    document.body.classList.add("tutorial-active");
    this.render();
  }

  render() {
    const step = this.steps[this.index];
    const target = document.querySelector(step.target);
    document.getElementById("tutorialProgress").textContent = `${this.index + 1} / ${this.steps.length}`;
    document.getElementById("tutorialTitle").textContent = step.title;
    document.getElementById("tutorialText").textContent = step.text;
    document.getElementById("tutorialPrevious").disabled = this.index === 0;
    document.getElementById("tutorialNext").textContent = this.index === this.steps.length - 1 ? (this.surface === "intro" ? "开始修复" : "知道了") : "下一步";
    document.getElementById("tutorialDots").innerHTML = this.steps.map((_, index) => `<i class="${index === this.index ? "active" : ""}"></i>`).join("");
    target?.scrollIntoView({ block:"nearest", inline:"nearest", behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    requestAnimationFrame(() => { this.layout(); document.getElementById("tutorialNext").focus(); });
  }

  layout() {
    if (!this.active) return;
    const target = document.querySelector(this.steps[this.index].target);
    if (!target) return;
    const margin = 8, rect = target.getBoundingClientRect();
    const box = {
      left:Math.max(margin, rect.left - margin), top:Math.max(margin, rect.top - margin),
      right:Math.min(innerWidth - margin, rect.right + margin), bottom:Math.min(innerHeight - margin, rect.bottom + margin)
    };
    const top = this.overlay.querySelector(".tutorial-shade-top"), right = this.overlay.querySelector(".tutorial-shade-right"), bottom = this.overlay.querySelector(".tutorial-shade-bottom"), left = this.overlay.querySelector(".tutorial-shade-left");
    Object.assign(top.style,{left:"0",top:"0",width:"100vw",height:`${box.top}px`});
    Object.assign(bottom.style,{left:"0",top:`${box.bottom}px`,width:"100vw",height:`${Math.max(0,innerHeight-box.bottom)}px`});
    Object.assign(left.style,{left:"0",top:`${box.top}px`,width:`${box.left}px`,height:`${Math.max(0,box.bottom-box.top)}px`});
    Object.assign(right.style,{left:`${box.right}px`,top:`${box.top}px`,width:`${Math.max(0,innerWidth-box.right)}px`,height:`${Math.max(0,box.bottom-box.top)}px`});
    Object.assign(this.focusRing.style,{left:`${box.left}px`,top:`${box.top}px`,width:`${Math.max(0,box.right-box.left)}px`,height:`${Math.max(0,box.bottom-box.top)}px`});
    const cardRect = this.card.getBoundingClientRect();
    if (innerWidth <= 640) {
      Object.assign(this.card.style,{left:"12px",right:"12px",top:"auto",bottom:"12px"});
      return;
    }
    const below = box.bottom + 16, above = box.top - cardRect.height - 16;
    const topPosition = below + cardRect.height <= innerHeight - 12 ? below : Math.max(12, above);
    const leftPosition = Math.max(12, Math.min(box.left, innerWidth - cardRect.width - 12));
    Object.assign(this.card.style,{left:`${leftPosition}px`,right:"auto",top:`${topPosition}px`,bottom:"auto"});
  }

  scheduleLayout() {
    cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = requestAnimationFrame(() => this.layout());
  }

  go(direction) {
    if (direction > 0 && this.index === this.steps.length - 1) { this.finish(false); return; }
    this.index = Math.max(0, Math.min(this.steps.length - 1, this.index + direction));
    this.render();
  }

  finish(skipped) {
    if (!this.active) return;
    localStorage.setItem(this.storageKey(this.userKey, this.surface), "done");
    this.active = false;
    this.overlay.hidden = true;
    document.body.classList.remove("tutorial-active");
    this.lastFocus?.focus?.();
  }

  onKeydown(event) {
    if (!this.active) return;
    if (event.key === "Escape") { event.preventDefault(); this.finish(true); return; }
    if (event.key === "ArrowRight") { event.preventDefault(); this.go(1); return; }
    if (event.key === "ArrowLeft") { event.preventDefault(); this.go(-1); return; }
    if (event.key !== "Tab") return;
    const focusable = [...this.card.querySelectorAll("button:not([disabled])")];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
}

window.nankaiTutorial = new NankaiTutorial();
