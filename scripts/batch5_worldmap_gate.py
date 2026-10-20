# -*- coding: utf-8 -*-
"""批次5：主世界地图出口按章节进度上锁，修复可提前进入后期地图的问题。

- 莲城（Map020）：第2夜之后（S45）
- 公寓（Map036）：阿兰入队之后（S50）
- 岚哥家（Map003）：第3夜之后（S46）
- 终章传送点（Map021）：第4夜之后（S47）
并清掉主世界提示人的示例任务说明、序章石阶的开发提示。
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from batch5_patch import (C, T, IF_SW, ELSE, ENDIF, END, TRANSFER, load, save_map)  # noqa: E402


def gate(m, ev_id, switch_id, dest, lock_text):
    for ev in m["events"]:
        if not ev or ev["id"] != ev_id:
            continue
        cmds = []
        cmds += IF_SW(switch_id, True)
        cmds += TRANSFER(*dest, direction=2, fade=0)
        cmds += ELSE()
        cmds += T(lock_text)
        cmds += ENDIF()
        cmds += END()
        ev["pages"][0]["list"] = cmds
        return
    raise KeyError(ev_id)


def main():
    m = load("Map001.json")

    # 后期区域的传送点：未到章节时只给一句环境提示
    gate(m, 10, 45, (20, 0, 17), ["（通往莲城的路还没有通。）"])
    gate(m, 11, 45, (20, 0, 17), ["（通往莲城的路还没有通。）"])
    gate(m, 5, 46, (3, 8, 11), ["（前面的路被塌下来的土堵住了。）"])
    gate(m, 4, 50, (36, 8, 18), ["（门没有锁，却推不动。）"])
    gate(m, 13, 50, (36, 8, 18), ["（门没有锁，却推不动。）"])

    # 终章传送点：第4夜之后才出现
    for ev in m["events"]:
        if not ev or ev["id"] not in (14, 15):
            continue
        cond = ev["pages"][0]["conditions"]
        cond["switch1Valid"] = True
        cond["switch1Id"] = 47
        cond["variableValid"] = False
        cond["variableId"] = 1
        cond["variableValue"] = 0

    # 示例任务提示人：去掉失效的任务图标说明
    for ev in m["events"]:
        if ev and ev["id"] == 12:
            ev["name"] = "迷路的旅人"
            ev["pages"][0]["list"] = (
                [C(101, ["Actor1", 0, 0, 2, "迷路的旅人"])]
                + [C(401, [line]) for line in
                   ["这地方说大不大，说小也不小。",
                    "要是不知道往哪走，就跟着水声走。",
                    "水最后都会流到同一个地方。"]]
                + END()
            )
    save_map(1, m)

    m = load("Map005.json")
    for ev in m["events"]:
        if ev and ev["id"] == 1:
            ev["name"] = "石阶的光"
            for page in ev["pages"]:
                for c in page["list"]:
                    if c["code"] == 401 and "开启主线任务" in c["parameters"][0]:
                        c["parameters"][0] = "（石阶上浮起一层淡淡的光。）"
    save_map(5, m)
    print("world map gates patched")


if __name__ == "__main__":
    main()
