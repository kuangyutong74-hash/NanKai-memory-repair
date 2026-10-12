# 南开记忆修复计划

这是一个基于 Python/FastAPI 与 NK-GeniOS 的校史游戏。玩法、状态、界面和代码均为独立实现。

## 运行

在本目录执行：

```powershell
python run.py
```

然后打开 `http://127.0.0.1:8090`。如需改端口，可先设置环境变量 `NANKAI_GAME_PORT`。

## 三个章节

- `荒洼上的大学（1919—1948）`：老校钟、思源堂、秀山堂、马蹄湖、木斋图书馆。
- `新南开（1949—1978）`：新开湖、海冰楼、文中馆、主楼。
- `百年南开（1979—今）`：周恩来总理像、西南联大纪念碑、逸夫馆、津南中心馆、爱国三问碑。

每个章节使用一张独立的空地地图，只显示本阶段地标。第一、三章各预留 5 块地基，第二章预留 4 块地基；建筑以透明像素图层叠放，后续可独立调整坐标或替换素材。跨章节时切换整张地图，章节内部保留学生移动动画。

## 核心循环

校园地图选地标 → 查看任务与待修复照片 → 完成该建筑的 3—5 道固定题 → 必要时查阅档案线索 → 获得影像碎片 → 阅读校史回顾 → 点亮下一地标。

游客进度保存在浏览器 `localStorage` 中；注册或登录修复员账号后，进度会同步到服务端 SQLite 存档，可在同一服务的不同设备上继续游戏。首页“重新开始”会同时清除当前账号存档。

## 荷宝智能体

- `server/genios.py`：GeniOS 会话、事件转发与结构化回复适配。
- `server/game_data.py`：三个章节及十四个地标的服务端数据。
- `server/app.py`：FastAPI 接口与静态资源服务。
- `hebao-client.js`：只负责把浏览器游戏事件提交给 Python 智能体并呈现回复。
- `game.js`：地图、答题、章节切换与学生移动。

浏览器事件由 FastAPI 后端安全转发给 GeniOS，浏览器端不保存密钥。

### GeniOS 接入

复制 `.env.example` 为 `.env`，在 `.env` 中填写平台 API 渠道生成的密钥，然后启动：

```powershell
python run.py
```

访问 `http://127.0.0.1:8090/api/health`，`geniosConfigured` 为 `true` 表示后端已读取配置。API 密钥禁止写入前端或提交到仓库。未配置密钥或远程调用失败时，接口会明确返回错误，不会静默切换到其他智能体。

运行 GeniOS 适配层测试：

```powershell
python -m unittest tests.test_genios
```

## 内容来源

- `quizmaster/data/corpus/01_南开校史讲义.md`
- `quizmaster/data/corpus/02_南开人物志.md`
- `quizmaster/data/corpus/03_南开校园文化读本.md`
- `quizmaster/data/seed/questions.json`

当前为竞赛演示原型，正式提交前应由档案馆老师复核题目、建筑年代与影像说明。
