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
    brief: "辨认校钟铭文与南开早期的办学理想，完成核验后取得本章照片的一块碎片。",
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

// 题目统一取自《南开记忆修复计划_题库.md》中的同名地标题池。
// 每个地标固定抽取 3 题，以符合“3 份档案核验”的关卡规则；题库不足 3 题的
// 新开湖和爱国三问碑，分别用题库中与该地标直接相关的题目补足。
const landmarkQuestions = {
  bell: [
    q("现在的南开校钟高1.937米，这个数字暗含哪一年的国难记忆？", ["1919年", "1997年", "1937年", "1946年"], 2, "1997年为纪念南开被炸60周年重铸新钟，钟高1.937米，对应1937年7月日军炸毁南开；钟身还刻有60枚校徽图案。", "把小数点去掉，联想南开校园遭日军轰炸的年份。"),
    q("每年7月29日“校殇日”，师生校友在校钟前先鸣钟7响，再鸣多少响？", ["28响", "14响", "29响", "37响"], 0, "7响加28响，寓意铭记7月28日深夜至29日的南开校殇。", "前后两组钟声共同组成一个七月日期。"),
    q("1937年被日军毁掠的老校钟，钟面铸的是校歌与校训。", ["正确", "错误"], 1, "老钟钟面铸的是整部《金刚经》，重约一万三千余斤；校歌、校训是1997年新钟四面所铸。", "注意区分1937年的老钟与1997年重铸的新钟。")
  ],
  mati: [
    q("1979年南开建校60周年时，马蹄湖湖心岛上树立的纪念物是？", ["周总理纪念碑", "西南联大纪念碑", "张伯苓铜像", "周恩来总理塑像"], 0, "碑文由杨石先校长撰写，每年清明校友会在两侧松柏上系白花。主楼南广场的总理塑像要到1989年才立。", "它位于湖心岛，且是碑而不是塑像。"),
    q("1923年南开迁入八里台校区时，马蹄湖已经存在。", ["正确", "错误"], 0, "马蹄湖分南北两片，早在1923年就已存在；1937年同样遭日军轰炸破坏。", "马蹄湖不是新中国成立后才人工开挖的。"),
    q("1950年从海外归国任教的化学家王积涛，冬天常在结冰的马蹄湖上做什么？", ["滑冰", "赏荷", "垂钓", "写生"], 0, "马蹄湖不只见证历史，也是南开人的日常生活场景。", "题干强调了冬天与结冰。")
  ],
  xiushan: [
    q("“秀山堂”的“秀山”是捐资者的字，他是谁？", ["严修", "李纯", "袁述之", "卢靖"], 1, "江苏督军李纯（字秀山）捐资，秀山堂于1923年建成。", "卢靖号木斋，袁述之则参与捐建思源堂。"),
    q("秀山堂建成之初，行政办公室、大礼堂和文商科教室都设在这里。", ["正确", "错误"], 0, "秀山堂既是行政中心，也是文商学院所在；1923年6月的第一次毕业式也在此举行。", "它在早期校园中承担多种教学与行政功能。"),
    q("1934年日本兴亚学徒联盟来津参观，与南开学生在秀山堂论战。事后整理的《中日学生会谈纪实》发表在哪家报纸？", ["《新民报》", "《申报》", "《大公报》", "《晨报》"], 2, "南开学生在论战中痛斥日本军国主义侵略行径，此事被整理成文发表于《大公报》。", "这份报纸创办于天津。")
  ],
  siyuan: [
    q("“思源堂”取“饮水思源”之意，纪念的是哪两方的捐助？", ["美国洛克菲勒基金会和河南实业家袁述之", "香港实业家邵逸夫和国家教委", "藏书家卢靖和江苏督军李纯", "校友周海冰和侯莹"], 0, "思源堂由美国洛克菲勒基金会和河南实业家袁述之共同出资捐建。", "其他三组选项分别对应逸夫馆、木斋图书馆与秀山堂、海冰楼。"),
    q("思源堂最初的用途是？", ["学生饭厅", "科学馆（供理工系科使用）", "图书馆", "大礼堂"], 1, "思源堂1923年始建、1925年落成，最初作为科学馆供理工系科使用。", "它与南开早期理工教育直接相关。"),
    q("下列哪位后来的世界级数学家，曾在思源堂求学？", ["曹禺", "陈省身", "杨石先", "叶嘉莹"], 1, "陈省身1930年毕业于南开数学系，师从姜立夫，被誉为“微分几何之父”。", "他以微分几何研究闻名世界。")
  ],
  library: [
    q("木斋图书馆由谁捐银元10万兴建？", ["严修", "卢靖", "李纯", "邵逸夫"], 1, "卢靖字勉之、号木斋，是近代教育家、藏书家。", "馆名取自捐资者的号。"),
    q("木斋图书馆里的“东北研究会”为何让侵华日军恨之入骨？", ["组织学生赴日留学", "翻译日本文学名著", "搜集了大量日本侵略东北的罪行证据", "展出日本文物精品"], 2, "东北研究会搜集了大量日本侵略东北的罪行证据，日军因此视南开为“排日之根据地”。", "它保存的是与侵略罪行有关的证据。"),
    q("木斋图书馆馆内可容纳的图书规模约为？", ["5万册", "20余万册", "70万册", "100万册"], 1, "木斋图书馆可容纳20余万册图书；70万册是后来冯文潜任馆长期间的馆藏规模。", "不要把建筑设计容量与1952年后的馆藏量混淆。")
  ],
  xinkai: [
    q("1958年建成的文中馆（当时的图书馆）坐落在哪个湖畔？", ["新开湖", "大明湖", "未名湖", "马蹄湖"], 0, "新开湖畔的文中馆共五层，建筑面积8256平方米。", "题目所问湖泊与本关地标同名。"),
    q("海冰楼夹在马蹄湖与哪个湖之间？", ["未名湖", "新开湖", "玄武湖", "大明湖"], 1, "海冰楼位于马蹄湖、新开湖之间。", "它是八里台校区两片湖面之间的建筑。"),
    q("1958年建成、最初作为五层图书馆使用的建筑是？", ["文中馆", "逸夫馆", "木斋图书馆", "津南中心馆"], 0, "文中馆建于新开湖畔，最初是五层图书馆，后来转为理科图书馆。", "这座建筑坐落在新开湖畔。")
  ],
  haibing: [
    q("海冰楼建成之初（1952年）的主要用途是？", ["科学馆", "学生饭厅，兼作大礼堂", "体育馆", "图书馆"], 1, "海冰楼建成之初以学生饭厅为主，兼作大礼堂。", "这里既能吃饭，也能临时布置座椅召开大会。"),
    q("1959年周恩来总理第三次重返母校视察，在食堂买了什么饭菜？", ["萝卜、咸菜和窝窝头", "饺子和汤", "包子和豆浆", "红烧肉和米饭"], 0, "周恩来买了萝卜、咸菜和两个窝窝头，饭后还与炊事员一一握手道谢。", "这是一顿十分朴素的饭菜。"),
    q("2016年捐资改造、2018年完工后命名“海冰楼”的校友是？", ["张文忠与卢靖", "邵逸夫与李纯", "周海冰与侯莹", "杨石先与姜立夫"], 2, "周海冰、侯莹捐资改造，楼内还设有“侯莹厅”。", "楼名取自其中一位捐赠者的名字。")
  ],
  wenzhong: [
    q("1989年逸夫图书馆建成后，文中馆转作什么？", ["校史馆", "行政办公楼", "学生宿舍", "理科图书馆"], 3, "逸夫图书馆建成后，文中馆转为理科图书馆使用。", "它仍然保留图书馆功能，但服务对象更集中。"),
    q("2018年9月，为纪念哪位校友的捐赠，理科图书馆被命名为“文中馆”？", ["周海冰", "张文忠", "邵逸夫", "陈省身"], 1, "“文中馆”之名来自校友张文忠的捐赠。", "馆名取自这位校友名字中的两个字。"),
    q("1952—1963年任图书馆馆长的冯文潜，任内馆藏从20万册增至多少？", ["100万册", "70万册", "40万册", "150万册"], 1, "冯文潜任内，南开图书馆馆藏从20万册增至70万册。", "答案介于40万与100万之间。")
  ],
  main: [
    q("南开主楼建成于哪一年？", ["1989年", "1952年", "1962年", "1958年"], 2, "主楼1962年建成，采用仿苏联式建筑风格，沿中轴对称。", "年份在文中馆建成之后四年。"),
    q("主楼东西横踞151.6米，顶高约多少米？", ["65.5米", "45.5米", "35.5米", "55.5米"], 3, "主楼顶高约55.5米，建筑面积18202平方米。", "三个数字相同。"),
    q("1977年恢复高考后到90年代中期，历届毕业生的毕业典礼多在主楼哪里举行？", ["露天操场", "教工食堂", "图书馆阅览室", "附设小礼堂（可容400人）"], 3, "主楼附设小礼堂可容400人，一度是毕业典礼的固定场所。", "场地位于主楼内部并可容纳数百人。")
  ],
  zhou: [
    q("主楼南广场的周恩来总理塑像，树立于南开建校多少周年校庆之际？", ["70周年", "80周年", "100周年", "60周年"], 0, "塑像于1989年10月17日落成，正值南开建校70周年。", "由1919年推算到1989年。"),
    q("马蹄湖的周总理纪念碑与主楼南广场的周恩来总理塑像，是同一时期、同一地点的纪念物。", ["正确", "错误"], 1, "纪念碑1979年立于马蹄湖湖心岛；塑像1989年立于主楼南广场。", "两者相差十年，形制也不同。"),
    q("主楼前周恩来总理汉白玉塑像的设计者是哪位雕塑家？", ["吴为山", "傅天仇", "刘开渠", "钱绍武"], 1, "塑像由雕塑家傅天仇设计，是他的最后作品。", "这位雕塑家的名字中含有“天”字。")
  ],
  lianda: [
    q("西南联大纪念碑原碑1946年落成在哪座城市？", ["重庆", "天津", "昆明", "长沙"], 2, "原碑立于昆明西南联大旧址，即今云南师范大学。", "西南联大最终办学所在的城市。"),
    q("西南联大纪念碑的碑文由谁撰写？", ["罗庸", "张伯苓", "闻一多", "冯友兰"], 3, "纪念碑由冯友兰撰文、闻一多篆额、罗庸书丹，被称为“三绝碑”。", "闻一多负责篆额，罗庸负责书丹。"),
    q("西南联大纪念碑碑阴镌刻着抗战以来从军学生的题名。", ["正确", "错误"], 0, "碑阴列有834个题名，其中两人各出现两次，实际为832人。", "碑的背面记录了投笔从戎的学生。")
  ],
  yifu: [
    q("逸夫馆由哪位香港实业家捐资兴建？", ["邵逸夫", "张文忠", "李纯", "卢靖"], 0, "邵逸夫捐资1000万港币，国家教委另投300万人民币，逸夫馆于1990年5月启用。", "馆名直接来自捐资者。"),
    q("逸夫馆馆舍面积约多少平方米？", ["3600", "8256", "46500", "11150"], 3, "逸夫馆馆舍面积约11150平方米。", "3600平方米对应木斋图书馆，8256平方米对应文中馆。"),
    q("2020年10月修缮重开后，逸夫馆阅览座位由300余席增至900余席。", ["正确", "错误"], 0, "修缮后阅览座位增至900余席，并新增16个单人学习间、4个多人研讨室。", "修缮显著增加了学习座位。")
  ],
  today: [
    q("津南校区于哪一年启用？", ["2013年", "2019年", "2015年", "2017年"], 2, "津南中心馆2013年6月奠基，2015年随津南校区投入使用。", "它早于百年校庆四年。"),
    q("以津南中心馆为主的建筑群荣获了什么奖项？", ["梁思成建筑奖", "中国建设工程鲁班奖（2016—2017年度）", "詹天佑奖", "普利兹克奖"], 1, "以津南中心馆为主的建筑群荣获2016—2017年度中国建设工程鲁班奖。", "这是中国建筑工程质量领域的重要奖项。"),
    q("津南中心馆的设计延续了老校区建筑群的什么布局？", ["回字形", "十字形", "丁字形", "品字形"], 3, "津南中心馆延续老校区建筑群的“品字形”布局，并融入新时代建筑元素。", "三个主体的组合像一个汉字。")
  ],
  three: [
    q("1935年张伯苓在开学典礼上提出“爱国三问”，第一问是什么？", ["你愿意中国好吗？", "你是中国人吗？", "你爱中国吗？", "你愿意为中国奋斗吗？"], 1, "爱国三问依次是：你是中国人吗？你爱中国吗？你愿意中国好吗？", "三问从身份认同开始。"),
    q("“爱国三问”提出于哪一年？", ["1935年", "1946年", "1919年", "1937年"], 0, "1935年日本侵华加剧、华北局势紧张，张伯苓提出爱国三问。", "它提出于南开校园被炸毁前两年。"),
    q("“爱国三问”的提出者是？", ["周恩来", "梅贻琦", "张伯苓", "严修"], 2, "爱国三问由南开大学首任校长张伯苓提出。", "他也是南开大学首任校长。")
  ]
};

stageCatalog.forEach((stage) => {
  if (landmarkQuestions[stage.id]) stage.questions = landmarkQuestions[stage.id];
});

const chapters = [
  {
    id: "origin", title: "1919—1948", subtitle: "私立南开、战火南迁与复校", background: "assets/campus-empty-origin-v2.png", stageIds: ["bell", "mati", "xiushan", "siyuan", "library"],
    introTitle: "在烽火中守住一所大学",
    introText: "1919年，南开大学在教育救国的理想中创立。早期校园逐渐形成校钟、秀山堂、思源堂与木斋图书馆等重要空间。1937年校园遭日军轰炸，学校被迫南迁，并与北京大学、清华大学共同组成西南联合大学。抗战胜利后，南开回到天津复校，散失的校舍、书籍与影像也由此成为需要重新拼合的记忆。",
    highlights: ["教育救国", "校园被炸", "西南联大", "天津复校"],
    quote: "第一章任务：循着老校钟与早期建筑，找回战火中未曾中断的南开精神。",
    rewardTitle: "南开大学开学典礼照片",
    rewardImage: "assets/chapter-origin-opening-ceremony.jpg",
    rewardCaption: "建校初期南开大学开学典礼合影",
    fragmentStageIds: ["siyuan", "xiushan", "bell", "mati", "library"],
    fragmentNames: ["左上角", "右上角", "中部左侧", "中部右侧", "底部全景"]
  },
  {
    id: "rebuild", title: "1949—1978", subtitle: "院系调整与校园重建", background: "assets/campus-empty-rebuild.png", stageIds: ["xinkai", "haibing", "wenzhong", "main"],
    introTitle: "让校园从废墟中重新生长",
    introText: "新中国成立后，南开大学进入调整与重建时期。学科布局随国家高等教育建设不断变化，校园空间也持续更新：新开湖、海冰楼、文中馆与主楼，见证了教学、科研和公共文化生活的恢复。这里的每一处新地标，都连接着一代师生建设校园、服务国家的共同经历。",
    highlights: ["院系调整", "校园重建", "学科发展", "公能传承"],
    quote: "第二章任务：走进重建后的校园，辨认新中国南开的成长轨迹。",
    rewardTitle: "复校与校园重建影像",
    rewardImage: "assets/archive-destroyed.jpg",
    rewardCaption: "复校与校园重建阶段影像（素材待档案馆复核）",
    fragmentStageIds: ["xinkai", "haibing", "wenzhong", "main"],
    fragmentNames: ["左上角", "右上角", "左下角", "右下角"]
  },
  {
    id: "renewal", title: "1979—至今", subtitle: "开放发展、双校区与新的百年", background: "assets/campus-empty-renewal.png", stageIds: ["zhou", "lianda", "yifu", "today", "three"],
    introTitle: "从百年记忆走向新的南开",
    introText: "改革开放以来，南开大学在学科建设、人才培养与国际交流中迈入新的发展阶段。周恩来总理像、西南联大纪念碑与爱国三问碑，让历史精神持续进入当代校园；逸夫馆、津南中心馆以及双校区格局，则记录着知识空间与办学规模的拓展。百年校史不只被保存，也在新的校园生活中继续书写。",
    highlights: ["改革开放", "双校区", "爱国三问", "新的百年"],
    quote: "第三章任务：连接历史与当下，让散佚影像在今日南开重新显影。",
    rewardTitle: "新时代双校区发展影像",
    rewardImage: "assets/archive-today.jpg",
    rewardCaption: "新时代南开校园发展影像（素材待档案馆复核）",
    fragmentStageIds: ["zhou", "lianda", "yifu", "today", "three"],
    fragmentNames: ["左上角", "右上角", "中部左侧", "中部右侧", "底部全景"]
  }
];

const catalogById = Object.fromEntries(stageCatalog.map(stage => [stage.id, stage]));
catalogById.bell.title = "老校钟";
catalogById.main.title = "主楼";
catalogById.today.title = "津南中心馆";
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
  $("stageStatus").textContent = completed ? `已取得${chapter.fragmentNames[fragmentPosition]}碎片` : unlocked ? `完成后获得${chapter.fragmentNames[fragmentPosition]}碎片` : "尚未解锁"; $("stageScore").textContent = completed ? "已归档" : "0 / 3 题";
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
  $("questionCounter").textContent = `${state.question + 1} / ${stage.questions.length}`; $("difficulty").textContent = assisted ? "智能体辅助" : "基础"; $("submitAnswer").disabled = true; $("submitAnswer").textContent = "确认核验"; $("clueButton").disabled = false; $("feedback").className = "feedback"; $("feedback").hidden = true; presentAgent(introduction);
  $("options").innerHTML = "";
  if (state.question === 0) renderWalkChoice(item, assisted);
  else if (state.question === 1) renderEvidenceJudgement(item);
  else renderTimelineSort(stage);
  scheduleAgentNudge();
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

function timelineRecords() {
  const total = stages.length, start = Math.max(0, Math.min(state.selected - 1, total - 4));
  return stages.slice(start, start + 4).map(stage => ({ id: stage.id, title: stage.title, year: parseInt(stage.year, 10) || 9999 }));
}

function renderTimelineSort(stage) {
  $("questionType").textContent = "推箱归档";
  $("questionText").textContent = "将四份地标档案拖到对应位置，按年份从早到晚排列。";
  const records = timelineRecords();
  state.timelineOrder = [...records].sort((a, b) => a.year - b.year).map(record => record.id);
  const mixed = [...records].reverse();
  const area = $("gameplayArea");
  area.className = "gameplay-area timeline-room";
  area.innerHTML = `<div class="timeline-rail" aria-label="从早到晚的四个档案位置"></div><div class="crate-yard" aria-label="待放置档案箱"><p class="yard-label">待放置档案</p></div><img class="timeline-player" src="assets/student-restorer.png" alt="校史记忆修复员"><p class="arena-instruction" aria-live="polite">拖动下方档案箱，放入上方对应的档案位</p>`;
  const rail = area.querySelector(".timeline-rail"), yard = area.querySelector(".crate-yard");
  mixed.forEach((record, index) => {
    const slot = document.createElement("div");
    slot.className = "timeline-slot";
    slot.dataset.slotIndex = String(index);
    slot.tabIndex = 0;
    slot.setAttribute("role", "button");
    slot.setAttribute("aria-label", `档案位 ${index + 1}，${index === 0 ? "最早" : index === 3 ? "最晚" : "待放置"}`);
    slot.innerHTML = `<span class="slot-label"><small>档案位 ${index + 1}</small><b>${index === 0 ? "最早" : index === 3 ? "最晚" : "待放置"}</b></span>`;
    slot.addEventListener("dragover", event => { event.preventDefault(); slot.classList.add("drop-target"); });
    slot.addEventListener("dragleave", () => slot.classList.remove("drop-target"));
    slot.addEventListener("drop", event => { event.preventDefault(); slot.classList.remove("drop-target"); placeCrate(event.dataTransfer.getData("text/plain"), index); });
    slot.addEventListener("click", () => placeArmedCrate(index));
    slot.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); placeArmedCrate(index); } });
    rail.appendChild(slot);
    const crate = document.createElement("button"); crate.className = "archive-crate"; crate.draggable = true; crate.dataset.id = record.id; crate.innerHTML = `<span class="crate-seal">${String(index + 1).padStart(2, "0")}</span><b>${record.title}</b><small>年代封签待核</small>`;
    crate.addEventListener("dragstart", event => event.dataTransfer.setData("text/plain", record.id));
    crate.addEventListener("click", event => { event.stopPropagation(); armCrate(crate); });
    yard.appendChild(crate);
  });
  yard.addEventListener("dragover", event => event.preventDefault());
  yard.addEventListener("drop", event => { event.preventDefault(); returnCrateToYard(event.dataTransfer.getData("text/plain")); });
  state.chosen = [null, null, null, null];
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
    option.className = `option review-option ${index === item.answer ? "correct" : ""}`;
    option.disabled = true;
    option.innerHTML = `<span class="option-key">${String.fromCharCode(65 + index)}</span><span>${text}</span>`;
    options.appendChild(option);
  });
  $("feedback").hidden = false;
  $("feedback").innerHTML = `<strong>归档答案：${String.fromCharCode(65 + item.answer)} · ${item.options[item.answer]}</strong><br>${item.explanation}`;
  presentAgent({ speaker: "荷宝", text: `这处地标已经完成修复。现在不用重新作答，我们直接查看第${state.question + 1}份档案的答案与校史依据。`, citations: [{ label: stage.source }], meta: { intent: "review" } });
}
function chooseOption(index) { if (state.answered) return; state.chosen = index; [...$("options").children].forEach((el, i) => el.classList.toggle("selected", i === index)); $("submitAnswer").disabled = false; }
function useClue() { if (state.answered) return; clearTimeout(agentNudgeTimer); const stage = stages[state.selected], item = stage.questions[state.question]; state.clueUsed = true; presentAgent(hebao.giveClue({ stage, question: item })); $("clueButton").disabled = true; $("clueButton").firstChild.textContent = "线索已调阅 "; }
function answerSummary(item) {
  if (state.question === 0) return `${String.fromCharCode(65 + state.chosen)} · ${item.options[state.chosen]}`;
  if (state.question === 1) return state.chosen === "true" ? "正确" : "错误";
  return state.chosen.map(id => `${catalogById[id].year} · ${catalogById[id].title}`).join(" → ");
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
  const right = state.question === 0 ? state.chosen === item.answer : state.question === 1 ? (state.chosen === "true") === evidenceClaim(item).truth : state.chosen.every((id, index) => id === state.timelineOrder[index]);
  if (right) { state.correct++; state.wrongStreak = 0; } else state.wrongStreak++;
  if (state.question === 0) $("gameplayArea").querySelectorAll(".archive-lectern").forEach((el, i) => { el.disabled = true; if (i === item.answer) el.classList.add("correct"); if (i === state.chosen && !right) el.classList.add("wrong"); });
  if (state.question === 1) $("gameplayArea").classList.add(right ? "verified" : "contradicted");
  if (state.question === 2) $("gameplayArea").querySelectorAll(".archive-crate").forEach(crate => { const index = state.chosen.indexOf(crate.dataset.id); crate.classList.toggle("correct", index >= 0 && crate.dataset.id === state.timelineOrder[index]); });
  const timelineExplanation = state.question === 2 ? `正确时间线：${state.timelineOrder.map(id => { const record = catalogById[id]; return `${record.year} · ${record.title}`; }).join(" → ")}` : item.explanation;
  state.answerHistory[state.question] = { index: state.question, question: $("questionText").textContent, answer: answerSummary(item), right, explanation: timelineExplanation };
  $("feedback").className = `feedback ${right ? "feedback-correct" : "feedback-wrong"}`;
  $("feedback").hidden = false; $("feedback").innerHTML = `<strong>${right ? "核验正确" : "核验错误"}</strong><span>${right ? "答案与档案记录一致" : "答案与档案记录不符"}</span><p>${timelineExplanation}</p>`; $("submitAnswer").textContent = state.question === 2 ? "完成修复" : "下一份档案"; $("submitAnswer").disabled = false; $("clueButton").disabled = true;
  presentAgent(hebao.reviewAnswer({ stage: stages[state.selected], question: item, right, clueUsed: state.clueUsed, wrongStreak: state.wrongStreak }));
}
function nextReviewQuestion() {
  const stage = stages[state.selected];
  if (state.question < stage.questions.length - 1) { state.question++; renderReviewQuestion(); return; }
  state.reviewMode = false;
  $("quizScreen").classList.remove("review-mode");
  activeChapterIndex = chapterIndexForStage(state.selected);
  renderMap(); show("mapScreen"); moveCameraTo(state.selected); selectStage(state.selected, false, true);
  presentAgent({ speaker: "荷宝", text: `${stage.title}的三份档案已经回顾完毕，原有通关记录和照片碎片保持不变。`, citations: [{ label: stage.source }], meta: { intent: "review-complete" } }, "map");
}
function nextQuestion() {
  if (state.question < 2) { state.question++; renderQuestion(); return; }
  if (state.correct < 2) {
    state.question = 0; state.correct = 0; state.answerHistory = []; renderQuestion();
    presentAgent(hebao.reply("本轮只完成了部分核验。取得照片碎片至少需要通过2份档案，我们带着刚才的解释再核对一次。", [], { intent: "retry" }));
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
