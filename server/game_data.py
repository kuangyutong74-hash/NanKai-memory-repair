"""三个年代章节及地标顺序。建筑专属资料不足时明确标记为阶段史料关。"""

CHAPTERS = [
    {
        "id": "origin",
        "title": "荒洼上的大学",
        "subtitle": "1919—1948",
        "background": "assets/campus-empty-plots.png",
        "stageIds": ["bell", "mati", "xiushan", "siyuan", "library"],
    },
    {
        "id": "rebuild",
        "title": "新南开",
        "subtitle": "1949—1978",
        "background": "assets/campus-route-panorama.png",
        "stageIds": ["xinkai", "haibing", "wenzhong", "main"],
    },
    {
        "id": "renewal",
        "title": "百年南开",
        "subtitle": "1979—今",
        "background": "assets/campus-map.png",
        "stageIds": ["zhou", "lianda", "yifu", "today", "three"],
    },
]

STAGE_NAMES = {
    "bell": "老校钟",
    "mati": "马蹄湖",
    "xiushan": "秀山堂",
    "siyuan": "思源堂",
    "library": "木斋图书馆",
    "xinkai": "新开湖",
    "haibing": "海冰楼",
    "wenzhong": "文中馆",
    "main": "主楼",
    "zhou": "周恩来总理像",
    "lianda": "西南联大纪念碑",
    "yifu": "逸夫馆",
    "today": "津南中心馆",
    "three": "爱国三问碑",
}


def chapter_payload() -> list[dict]:
    return [
        {
            **chapter,
            "stages": [
                {"id": stage_id, "title": STAGE_NAMES[stage_id]}
                for stage_id in chapter["stageIds"]
            ],
        }
        for chapter in CHAPTERS
    ]
