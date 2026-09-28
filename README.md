# 南开记忆修复计划

这是一个与原 `quizmaster` 完全分离的 Python/FastAPI 校史游戏。它只取用原 RAG 文档中的校史知识，玩法、状态、界面和代码均重新实现。

## 运行

在本目录执行：

```powershell
python run.py
```

然后打开 `http://127.0.0.1:8090`。如需改端口，可先设置环境变量 `NANKAI_GAME_PORT`。

## 三个章节

- `1919—1948`：老校钟、马蹄湖、秀山堂、思源堂、木斋图书馆。
- `1949—1978`：新开湖、海冰楼、文中馆、主楼。
- `1979—至今`：周恩来总理像、西南联大纪念碑、逸夫馆、津南中心馆、爱国三问碑。

每个章节使用一张独立的空地地图，只显示本阶段地标。第一、三章各预留 5 块地基，第二章预留 4 块地基；建筑以透明像素图层叠放，后续可独立调整坐标或替换素材。跨章节时切换整张地图，章节内部保留学生移动动画。

## 核心循环

校园地图选地标 → 查看任务与待修复照片 → 回答 3 题 → 必要时查阅档案线索 → 获得影像碎片 → 阅读校史回顾 → 点亮下一地标。

进度保存在浏览器 `localStorage` 中，可从首页“重新开始”清除。

## 荷宝智能体

- `server/agent.py`：Python 编写的中文单字/双字切分、稀疏检索、引用生成与主动行为策略。
- `server/game_data.py`：三个章节及十四个地标的服务端数据。
- `server/app.py`：FastAPI 接口与静态资源服务。
- `hebao-client.js`：只负责把浏览器游戏事件提交给 Python 智能体并呈现回复。
- `game.js`：地图、答题、章节切换与学生移动。

默认使用 Python 本地检索，不依赖密钥。后续接入 GeniOS 时，可以在后端增加远程模型适配器，浏览器端无需保存密钥。

运行 Python 智能体测试：

```powershell
python -m unittest tests.test_python_agent
```

## 内容来源

- `quizmaster/data/corpus/01_南开校史讲义.md`
- `quizmaster/data/corpus/02_南开人物志.md`
- `quizmaster/data/corpus/03_南开校园文化读本.md`
- `quizmaster/data/seed/questions.json`

当前为竞赛演示原型，正式提交前应由档案馆老师复核题目、建筑年代与影像说明。
