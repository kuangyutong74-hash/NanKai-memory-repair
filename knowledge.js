(function (root) {
  "use strict";

  const knowledge = [
    {
      id: "history-origin",
      documentTitle: "南开校史讲义",
      sectionTitle: "第一章 创校与早期发展",
      stageIds: ["siyuan", "main"],
      content: "南开大学创办于1919年，创办者是严修与张伯苓。1919年9月举行开学典礼，第一期学生共96人。周恩来1919年入南开大学文科，学号62号，1920年赴法勤工俭学。"
    },
    {
      id: "history-disciplines",
      documentTitle: "南开校史讲义",
      sectionTitle: "第一章 创校与早期发展",
      stageIds: ["bell", "siyuan"],
      content: "南开大学创办之初设立文、理、商三科，其后增设矿科。这一格局与文以治国、理以强国、商以富国的办学追求相呼应。"
    },
    {
      id: "culture-bell",
      documentTitle: "南开校园文化读本",
      sectionTitle: "第二章 校名与校园标识",
      stageIds: ["bell"],
      content: "南开大学校钟铭文以文以治国、理以强国、商以富国表达办学追求，体现文、理、商并重的理念，并与建校初期三科格局相互呼应。"
    },
    {
      id: "spirit-motto",
      documentTitle: "南开校史讲义",
      sectionTitle: "第四章 精神传统",
      stageIds: ["bell", "three"],
      content: "南开大学校训是允公允能、日新月异。公指爱国爱群之公德，强调服务国家与社会的公民责任；能指服务社会之能力，强调真才实学与实干本领。"
    },
    {
      id: "spirit-three-questions",
      documentTitle: "南开校史讲义",
      sectionTitle: "第四章 精神传统",
      stageIds: ["three"],
      content: "1935年，张伯苓在开学典礼上提出爱国三问：你是中国人吗？你爱中国吗？你愿意中国好吗？三问在民族危亡加深的背景下提出。"
    },
    {
      id: "history-destruction",
      documentTitle: "南开校史讲义",
      sectionTitle: "第二章 抗战内迁与西南联大",
      stageIds: ["library"],
      content: "1937年7月，日军炮击轰炸南开大学校园，图书馆、教学楼等校舍严重被毁。师生组织南迁，南开成为抗战中最早被毁、也最早开始内迁的大学之一。"
    },
    {
      id: "history-lianda",
      documentTitle: "南开校史讲义",
      sectionTitle: "第二章 抗战内迁与西南联大",
      stageIds: ["library"],
      content: "1937年，北京大学、清华大学、南开大学先在长沙组成国立长沙临时大学。1938年，三校在昆明组建国立西南联合大学，校训为刚毅坚卓。"
    },
    {
      id: "history-restoration",
      documentTitle: "南开校史讲义",
      sectionTitle: "第一章 创校与早期发展",
      stageIds: ["main", "today"],
      content: "1946年西南联合大学结束，南开大学改为国立并在天津八里台复校。1952年院系调整后，南开大学被定位为文理综合大学。"
    },
    {
      id: "culture-main-building",
      documentTitle: "南开校园文化读本",
      sectionTitle: "第三章 校园建筑与景观",
      stageIds: ["main"],
      content: "八里台校区主楼是南开最具辨识度的建筑之一，以对称布局与方形钟楼为标志，体量宏伟、风格庄重。"
    },
    {
      id: "culture-jinnan",
      documentTitle: "南开校园文化读本",
      sectionTitle: "第三章 校园建筑与景观",
      stageIds: ["today"],
      content: "2015年津南校区启用，学校形成八里台与津南校区并行的格局。津南校区图书馆以红砖立面与居中的南开大学校徽为标志。2019年南开大学迎来建校100周年。"
    }
  ];

  root.NANKAI_KNOWLEDGE = knowledge;
  if (typeof module !== "undefined" && module.exports) module.exports = knowledge;
})(typeof window !== "undefined" ? window : this);
