# -*- coding: utf-8 -*-
"""批次 5 第二轮：第三章、第四章、终章分档与尾声。"""
import copy
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from batch5_patch import (  # noqa: E402
    BGM, BGM_FADE, CHOICE, C, ELSE, END, ENDIF, END_CHOICE, FADE_IN, FADE_OUT,
    IF_SW, IF_VAR, MEMLOCK, MONO, MOOD_ADD, PICTURE, ERASE_PICTURE, RESUME_BGM,
    SAVE_BGM, SCROLL, SE, SELF, SW, T, TINT, TITLE, TRANSFER, VAR, WAIT, WHEN,
    add_event, get_event, load, save_json, save_map, set_page, page_template,
)

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "工程", "data")


def find_event(map_obj, name):
    return next((e for e in map_obj["events"] if e and e["name"] == name), None)


def insert_before_end(commands, extra):
    idx = next(i for i, c in enumerate(commands) if c["code"] == 0)
    commands[idx:idx] = extra


def insert_before_final_end(commands, extra):
    assert commands[-1]["code"] == 0
    commands[-1:-1] = extra


def insert_before_self_switch(commands, extra):
    idx = next(i for i, c in enumerate(commands) if c["code"] == 123)
    commands[idx:idx] = extra


def append_page(map_obj, eid, commands, cond):
    ev = get_event(map_obj, eid)
    ev["pages"].append(page_template(commands=commands, cond=cond))


def set_map_bgm(map_obj, name, volume=90):
    map_obj["autoplayBgm"] = True
    map_obj["bgm"] = {"name": name, "pan": 0, "pitch": 100, "volume": volume}


# ---------------------------------------------------------------- system
def patch_system():
    s = load("System.json")
    if not s["switches"][52]:
        s["switches"][52] = "酒馆斗殴已结束"
    else:
        assert s["switches"][52] == "酒馆斗殴已结束", s["switches"][52]
    save_json("System.json", s)


# ---------------------------------------------------------------- chapter 3
def patch_map020():
    m = load("Map020.json")

    for eid in range(3, 8):
        for page in get_event(m, eid)["pages"]:
            for cmd in page["list"]:
                if cmd["code"] == 201 and cmd["parameters"][1] == 28:
                    cmd["parameters"] = [0, 30, 20, 25, 2, 0]

    intro = find_event(m, "莲城开场")
    if not intro:
        add_event(m, "莲城开场", 0, 0, [page_template(trigger=3, commands=[
            *BGM("Town4", 75),
            *T("（莲城的街上很吵。）"),
            *T("路人甲：你个杀千刀的，车开那么快干嘛，赶着去投胎啊！"),
            *T("路人乙：你个死抱怨，你车子害了病啦？"),
            *T("路人乙：不晓得的，以为你开的是碰碰车呢。"),
            *T("（他们吵了很久。没有人劝。）"),
            *T("（她站在旁边，一直听到他们吵完。）"),
            *T("雪儿：……"),
            *T("（然后她才想起来，自己是要去哪儿的。）"),
            *MEMLOCK(5),
            *MOOD_ADD(-3),
            *SELF("A", True),
            *END(),
        ])])

    save_map(20, m)


def patch_map030():
    m = load("Map030.json")
    set_page(m, 5, 0, commands=[
        *SE("Move2", 80),
        *TRANSFER(20, 33, 17, 2, 0),
        *END(),
    ])
    save_map(30, m)


def patch_map032():
    m = load("Map032.json")
    set_map_bgm(m, "Dungeon3", 65)

    # 工厂1 → 工厂2
    set_page(m, 1, 0, commands=[
        *TRANSFER(33, 20, 23, 2, 0),
        *END(),
    ])

    # 女工1：一封信（永不可完成）
    worker1 = get_event(m, 8)
    insert_before_end(worker1["pages"][0]["list"], [
        *IF_SW(39, False),
        *T("雪儿：……好。我记下了。"),
        *T("（她把那封信，放进了包的最里面。）"),
        *SW(39, True),
        *ELSE(),
        *T("（那封信还在包里。她还没有找到城东。）"),
        *ENDIF(),
    ])

    # 工人3：工牌 → 心锁 6
    worker3 = get_event(m, 9)
    insert_before_end(worker3["pages"][0]["list"], [
        *T("工人3：（他笑了一下，笑得挺真的）……反正也没别的地方可去了。"),
        *IF_SW(26, False),
        *T("（他胸口别着一枚工牌。照片上的人，比他年轻很多。）"),
        *MEMLOCK(6),
        *MOOD_ADD(-2),
        *ENDIF(),
    ])

    save_map(32, m)


def patch_map033():
    m = load("Map033.json")
    set_map_bgm(m, "Dungeon4", 65)

    # 阿兰入队，补上「孩子说的话都是我替他说的」
    alan = get_event(m, 1)
    cmds = alan["pages"][0]["list"]
    idx = next(i for i, c in enumerate(cmds) if c["code"] == 129)
    cmds[idx:idx] = [
        *T("雪儿：……你的孩子，多大了。"),
        *T("阿兰：（低头笑了一下）还没到会说话的年纪。所以他现在说什么，都是我替他说的。"),
    ]
    idx = next(i for i, c in enumerate(cmds) if c["code"] == 122)
    cmds[idx + 1:idx + 1] = SW(50, True)

    # 出厂：阿兰入队后去公寓
    set_page(m, 2, 0, commands=[
        *IF_SW(50, True),
        *SE("Move6", 90),
        *TRANSFER(36, 8, 18, 2, 0),
        *ELSE(),
        *T("（阿兰还在厂房里。先去找她吧。）"),
        *ENDIF(),
        *END(),
    ])

    # 进入工厂2：锁又动了一下
    lock = get_event(m, 4)
    insert_before_self_switch(lock["pages"][0]["list"], [
        *T("（……又不动了。）"),
        *MOOD_ADD(-2),
    ])

    save_map(33, m)


# ---------------------------------------------------------------- chapter 3 / epilogue
def patch_map036():
    m = load("Map036.json")

    # 文学哥：熟悉感
    writer = get_event(m, 1)
    writer_cmds = [c for c in writer["pages"][0]["list"] if c["code"] != 0]
    writer_cmds += [
        *T("雪儿：（这里，好熟。）"),
        *T("（可她确定，自己没有来过。）"),
        *END(),
    ]
    writer["pages"][0]["list"] = writer_cmds
    append_page(m, 1, END(), {"switch1Valid": True, "switch1Id": 48})

    # 出口：没看抽屉就不让走（心锁 7 强制）
    set_page(m, 2, 0, commands=[
        *IF_SW(38, True),
        *SE("Move3", 90),
        *TRANSFER(18, 12, 14, 2, 0),
        *ELSE(),
        *T("（走之前，她还是想再看一眼那张书桌。）"),
        *T("（那个抽屉，好像没关严。）"),
        *ENDIF(),
        *END(),
    ])
    append_page(m, 2, END(), {"switch1Valid": True, "switch1Id": 48})

    # 抽屉：氟西汀买药单 → 心锁 7
    set_page(m, 3, 0, commands=[
        *IF_SW(38, False),
        *T("（抽屉里有一张折起来的单子。）"),
        *T("（……氟西汀。签名那一栏，写着「穆兰雪」。）"),
        *MEMLOCK(7),
        *MOOD_ADD(-10),
        *T("雪儿：……不是我的。"),
        *T("（可签名那一栏，是她自己的字。）"),
        *SW(38, True),
        *ELSE(),
        *T("（单子还在抽屉里。她不想再看第二遍。）"),
        *ENDIF(),
        *END(),
    ])

    # 桌子：两个杯子 → 心锁 8
    table_page = page_template(commands=[
        *IF_SW(28, False),
        *T("（桌上放着两个杯子。）"),
        *T("（一个是空的。）"),
        *MEMLOCK(8),
        *MOOD_ADD(-1),
        *ELSE(),
        *T("（两个杯子还放在那里。）"),
        *ENDIF(),
        *END(),
    ])
    add_event(m, "桌子", 5, 11, [table_page])

    # 尾声：醒来（无台词）
    epilogue = page_template(trigger=3, cond={"switch1Valid": True, "switch1Id": 48}, commands=[
        *BGM_FADE(1),
        *FADE_IN(),
        *PICTURE(1, "尾声_醒来", 0, 0, 100, 255, 0),
        *WAIT(60),
        *SE("Water1", 80),
        *WAIT(90),
        *SE("Crow", 70),
        *WAIT(120),
        *SE("Wind1", 55),
        *WAIT(180),
        *FADE_OUT(),
        *ERASE_PICTURE(1),
        *TINT(-255, -255, -255, 0, 0, True),
        *FADE_IN(),
        *SCROLL(2, [
            "一位抑郁症患者的独白",
            "",
            "策划 / 剧本 / 程序：葛银",
            "地图素材：RPG Maker MZ",
            "插件：RPG Maker MZ 社区",
            "",
            "谢谢你陪她走到这里。",
        ]),
        *WAIT(60),
        *FADE_OUT(),
        *TITLE(),
        *END(),
    ])
    add_event(m, "尾声·醒来", 0, 0, [epilogue])

    save_map(36, m)


# ---------------------------------------------------------------- chapter 3 end / chapter 4
def patch_map018():
    m = load("Map018.json")

    # 楼下：第三夜 → 酒馆
    set_page(m, 1, 0, trigger=1, commands=[
        *IF_SW(51, False),
        *T("（楼下已经黑了。先和兰雪说说话吧。）"),
        *ELSE(),
        *IF_SW(46, False),
        *SAVE_BGM(),
        *BGM_FADE(2),
        *IF_SW(38, True),
        *MONO(3, 1),
        *ELSE(),
        *MONO(3, 2),
        *ENDIF(),
        *RESUME_BGM(),
        *MOOD_ADD(3),
        *SW(46, True),
        *FADE_OUT(),
        *TRANSFER(31, 5, 6, 2, 0),
        *ELSE(),
        *FADE_OUT(),
        *TRANSFER(31, 5, 6, 2, 0),
        *ENDIF(),
        *ENDIF(),
        *END(),
    ])

    # 兰雪入队：琴是女租户留下的
    lx = get_event(m, 4)
    cmds = lx["pages"][0]["list"]
    idx = next(i for i, c in enumerate(cmds)
               if c["code"] == 101 and i + 1 < len(cmds)
               and cmds[i + 1]["code"] == 401
               and "砸掉了琴" in cmds[i + 1]["parameters"][0])
    cmds[idx:idx] = [
        *T("兰雪：这琴……本来就不是我的。"),
        *T("雪儿：那是谁的？"),
        *T("兰雪：一个住过这里的女人。她走了，琴没带走。"),
        *T("雪儿：（女租户……）"),
        *SE("Break", 85),
    ]
    idx = next(i for i, c in enumerate(cmds) if c["code"] == 122)
    cmds[idx + 1:idx + 1] = SW(51, True)

    # 草木精：第二处「缝」
    spirit = get_event(m, 9)
    insert_before_end(spirit["pages"][0]["list"], [
        *T("雪儿：（「我们家」。是哪个家？）"),
        *T("（她没有问出口。）"),
    ])

    # 一进屋，锁震动
    tremor = get_event(m, 12)
    insert_before_end(tremor["pages"][0]["list"], [
        *T("（……又停了。）"),
        *MOOD_ADD(-2),
        *SELF("A", True),
    ])

    save_map(18, m)


def patch_map031():
    m = load("Map031.json")
    set_map_bgm(m, "Town6", 65)

    # 酒馆老板：聊天后，一个人喝到很晚 → 心锁 10
    boss = get_event(m, 8)
    boss["pages"][0]["list"] = [
        *T("这位美女，想要喝点什么？"),
        *CHOICE(["聊天", "买酒"]),
        *WHEN(0, "聊天"),
        *T("好久之前有一次，村里的守护者来酒馆喝酒。", indent=1),
        *T("老猎人称，外面世界已经发生大灾变，", indent=1),
        *T("多出了许多的妖魔鬼怪、精灵异兽。", indent=1),
        *IF_SW(30, False, 1),
        *T("（雪儿在吧台前坐了很久。）", indent=2),
        *T("（老板没有赶她。）", indent=2),
        *MEMLOCK(10, indent=2),
        *MOOD_ADD(-2, indent=2),
        *ENDIF(1),
        *END(1),
        *WHEN(1, "买酒"),
        *CHOICE(["百威", "喜力", "科罗娜"], indent=1),
        *WHEN(0, "百威", indent=1),
        *END(2),
        *WHEN(1, "喜力", indent=1),
        *END(2),
        *WHEN(2, "科罗娜", indent=1),
        *END(2),
        *END_CHOICE(1),
        *END(1),
        *END_CHOICE(),
        *END(),
    ]

    # 醉鬼：斗殴之后，说出「我就是不想回家」
    for eid in (14, 15):
        ev = get_event(m, eid)
        for page in ev["pages"]:
            for cmd in page["list"]:
                if cmd["code"] == 121 and cmd["parameters"][0] == 20:
                    cmd["parameters"] = [52, 52, 0]
        page1 = ev["pages"][1]["list"]
        has_52 = any(c["code"] == 121 and c["parameters"][0] == 52 for c in page1)
        if not has_52:
            insert_before_end(page1, [*SW(52, True)])
        p2 = copy.deepcopy(ev["pages"][0])
        p2["conditions"]["switch1Valid"] = True
        p2["conditions"]["switch1Id"] = 52
        p2["list"] = [
            *T("醉鬼：（酒醒一半）……我瞎说的。我就是不想回家。"),
            *END(),
        ]
        ev["pages"].append(p2)

    # 岚哥：斗殴后的一句话
    lan = get_event(m, 9)
    lan["pages"][1]["conditions"]["switch1Id"] = 52
    lan["pages"][2]["conditions"]["selfSwitchValid"] = False
    lan["pages"][2]["conditions"]["switch1Valid"] = True
    lan["pages"][2]["conditions"]["switch1Id"] = 20

    # 酒客6：岚哥性别的「缝」
    drinker = get_event(m, 16)
    insert_before_end(drinker["pages"][0]["list"], [
        *T("酒客6：……不对，是个男的？我记混了。"),
        *T("（他挠了挠头，又喝了一口。）"),
    ])

    # 出酒馆 → 隐秘村落
    set_page(m, 18, 0, commands=[
        *TRANSFER(41, 5, 14, 2, 0),
        *END(),
    ])

    save_map(31, m)


def patch_map041():
    m = load("Map041.json")
    set_map_bgm(m, "Field2", 60)

    # 路口 → 心锁 11
    set_page(m, 2, 0, trigger=1, commands=[
        *IF_SW(31, False),
        *T("（路口。左边是来时的路，右边停着一辆车。）"),
        *MEMLOCK(11),
        *MOOD_ADD(-2),
        *ELSE(),
        *T("（路口的风很大。）"),
        *ENDIF(),
        *END(),
    ])

    # 岚哥家的门
    set_page(m, 1, 0, commands=[
        *TRANSFER(3, 8, 11, 2, 0),
        *END(),
    ])

    save_map(41, m)


def patch_map003():
    m = load("Map003.json")
    set_map_bgm(m, "Theme3", 70)

    # 岚哥家出口：第 4 夜 → 心屋
    set_page(m, 1, 0, trigger=1, commands=[
        *IF_SW(20, True),
        *IF_SW(47, False),
        *SAVE_BGM(),
        *BGM_FADE(2),
        *MONO(4, 1),
        *MOOD_ADD(3),
        *SW(47, True),
        *ENDIF(),
        *FADE_OUT(),
        *TRANSFER(21, 13, 13, 2, 0),
        *ELSE(),
        *T("（门还关着。先把这里的事处理完。）"),
        *ENDIF(),
        *END(),
    ])

    # 岚哥：年龄
    lan = get_event(m, 2)
    cmds = lan["pages"][0]["list"]
    idx = next(i for i, c in enumerate(cmds)
               if c["code"] == 101 and i + 1 < len(cmds)
               and cmds[i + 1]["code"] == 401
               and "小姑娘，你是叫兰雪吗" in cmds[i + 1]["parameters"][0])
    cmds[idx:idx] = [
        *T("雪儿：岚哥，你……今年多大？"),
        *T("岚哥：忘了。你就当我很老吧。"),
    ]

    # 心锁 9：一个男人一直在说，她一句没听进去
    lock = get_event(m, 3)
    insert_before_end(lock["pages"][0]["list"], [
        *IF_SW(29, False),
        *MEMLOCK(9),
        *MOOD_ADD(-3),
        *ENDIF(),
    ])

    save_map(3, m)


# ---------------------------------------------------------------- ending
def patch_map019():
    m = load("Map019.json")

    door = get_event(m, 4)
    page = door["pages"][0]
    cmds = page["list"]
    idx = next(i for i, c in enumerate(cmds)
               if c["code"] == 402 and c["parameters"][0] == 0)
    end_idx = next(i for i, c in enumerate(cmds) if c["code"] == 404)
    branch = [
        *IF_VAR(18, 1, 9),
        *IF_VAR(24, 1, 2),
        *VAR(27, 0, 1),
        *SW(40, True),
        *MONO(5, 1),
        *ELSE(),
        *VAR(27, 0, 2),
        *SW(40, True),
        *MONO(5, 2),
        *ENDIF(),
        *ELSE(),
        *IF_VAR(18, 1, 5),
        *VAR(27, 0, 2),
        *SW(40, True),
        *MONO(5, 2),
        *ELSE(),
        *VAR(27, 0, 3),
        *SW(40, True),
        *MONO(5, 3),
        *ENDIF(),
        *ENDIF(),
        *SW(48, True),
        *FADE_OUT(),
        *TRANSFER(36, 8, 18, 2, 0),
        *END(),
    ]
    page["list"] = cmds[:idx + 1] + branch + cmds[end_idx:]

    save_map(19, m)


def patch_map021():
    m = load("Map021.json")
    for event in m["events"]:
        if not event:
            continue
        for page in event["pages"]:
            for cmd in page["list"]:
                if cmd["code"] == 357 and cmd["parameters"][0] == "XueEr_MentalLock":
                    cmd["parameters"][2] = "MemLock play id=12 silent=true images=Memory_12"
                    cmd["parameters"][3]["images"] = "Memory_12"
    save_map(21, m)


def patch_map_infos():
    path = os.path.join(DATA, "MapInfos.json")
    with open(path, encoding="utf-8") as f:
        infos = json.load(f)
    names = {19: "星空小岛", 31: "隐秘酒馆"}
    for info in infos:
        if info and info["id"] in names:
            info["name"] = names[info["id"]]
    save_json("MapInfos.json", infos)


def main():
    patch_system()
    patch_map020()
    patch_map030()
    patch_map032()
    patch_map033()
    patch_map036()
    patch_map018()
    patch_map031()
    patch_map041()
    patch_map003()
    patch_map019()
    patch_map021()
    patch_map_infos()
    print("chapter 3-4 + ending patched")


if __name__ == "__main__":
    main()
