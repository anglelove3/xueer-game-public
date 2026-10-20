# -*- coding: utf-8 -*-
"""批次 5：第二至四章 + 尾声接入。可重复执行（以当前数据为输入）。"""
import json
import os

DATA = "工程/data"

# ---------------------------------------------------------------- MZ JSON I/O
def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as f:
        return json.load(f)


def mz_dump(obj):
    keys = list(obj.keys())
    scalars = [k for k in keys if k not in ("data", "events")]
    lines = ["{"]
    lines.append(",".join(
        f'"{k}":{json.dumps(obj[k], ensure_ascii=False, separators=(",", ":"))}'
        for k in scalars
    ) + ",")
    lines.append('"data":' + json.dumps(obj["data"], ensure_ascii=False, separators=(",", ":")) + ",")
    lines.append('"events":[')
    ev = obj["events"]
    for i, e in enumerate(ev):
        s = "null" if e is None else json.dumps(e, ensure_ascii=False, separators=(",", ":"))
        lines.append(s + ("," if i < len(ev) - 1 else ""))
    lines.append("]")
    lines.append("}")
    return "\n".join(lines)


def save_map(mid, obj):
    path = os.path.join(DATA, f"Map{mid:03d}.json")
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(mz_dump(obj))


def save_json(name, obj):
    with open(os.path.join(DATA, name), "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(obj, ensure_ascii=False, separators=(",", ":")))


# ---------------------------------------------------------------- commands
def C(code, params=None, indent=0):
    return {"code": code, "indent": indent, "parameters": params if params is not None else []}


def T(lines, speaker="", indent=0):
    if isinstance(lines, str):
        lines = [lines]
    out = [C(101, ["", 0, 0, 2, speaker], indent)]
    out += [C(401, [line], indent) for line in lines]
    return out


def CHOICE(items, indent=0):
    return [C(102, [items, 1, 0, 2, 0], indent)]


def WHEN(idx, name, indent=0):
    return [C(402, [idx, name], indent)]


def END_CHOICE(indent=0):
    return [C(404, [], indent)]


def IF_SW(sid, on, indent=0):
    return [C(111, [0, sid, 0 if on else 1], indent)]


def IF_VAR(vid, op, val, indent=0):
    return [C(111, [1, vid, op, val], indent)]


def ELSE(indent=0):
    return [C(411, [], indent)]


def ENDIF(indent=0):
    return [C(412, [], indent)]


def SW(sid, on, indent=0):
    return [C(121, [sid, sid, 0 if on else 1], indent)]


def VAR(vid, op, val, indent=0):
    return [C(122, [vid, vid, op, 0, val], indent)]


def SELF(ch, on, indent=0):
    return [C(123, [ch, 0 if on else 1], indent)]


def PLUG(plugin, command, argstr, args, indent=0):
    return [C(357, [plugin, command, argstr, args], indent)]


def MEMLOCK(num, indent=0, images=None, silent=False):
    images = images or f"Memory_{num}"
    args = {"id": str(num), "images": images, "silent": "true" if silent else "false"}
    text = f"MemLock play id={num}" + (" silent=true" if silent else "") + f" images={images}"
    return PLUG("XueEr_MentalLock", "play", text, args, indent)


def MOOD_ADD(value, indent=0):
    return PLUG("XueEr_MoodMeter", "add", f"Mood add value={value}", {"value": str(value)}, indent)


def MONO(night, variant, indent=0):
    return PLUG("XueEr_Monologue", "night", f"Mono night={night} variant={variant}",
                {"night": str(night), "variant": str(variant)}, indent)


def TRANSFER(mid, x, y, direction=2, fade=0, indent=0):
    return [C(201, [0, mid, x, y, direction, fade], indent)]


def FADE_OUT(indent=0):
    return [C(221, [], indent)]


def FADE_IN(indent=0):
    return [C(222, [], indent)]


def TINT(r, g, b, gray, duration, wait, indent=0):
    return [C(223, [r, g, b, gray, duration, wait], indent)]


def WAIT(frames, indent=0):
    return [C(230, [frames], indent)]


def SE(name, volume=90, pitch=100, indent=0):
    return [C(250, [{"name": name, "volume": volume, "pitch": pitch, "pan": 0}], indent)]


def BGM(name, volume=90, pitch=100, indent=0):
    return [C(241, [{"name": name, "volume": volume, "pitch": pitch, "pan": 0}], indent)]


def BGM_FADE(seconds, indent=0):
    return [C(242, [seconds], indent)]


def SAVE_BGM(indent=0):
    return [C(243, [], indent)]


def RESUME_BGM(indent=0):
    return [C(244, [], indent)]


def PICTURE(pid, name, x=0, y=0, scale=100, opacity=255, origin=1, blend=0, indent=0):
    return [C(231, [pid, name, origin, 0, x, 0, y, scale, scale, opacity, blend], indent)]


def ERASE_PICTURE(pid, indent=0):
    return [C(235, [pid], indent)]


def SCROLL(speed, lines, indent=0):
    return [C(105, [speed, False], indent)] + [C(405, [line], indent) for line in lines]


def TITLE(indent=0):
    return [C(354, [], indent)]


def END(indent=0):
    return [C(0, [], indent)]


# ---------------------------------------------------------------- event helpers
def page_template(trigger=0, priority=0, commands=None, cond=None, image=None, move_type=0):
    conditions = {
        "actorId": 1, "actorValid": False, "itemId": 1, "itemValid": False,
        "selfSwitchCh": "A", "selfSwitchValid": False,
        "switch1Id": 1, "switch1Valid": False,
        "switch2Id": 1, "switch2Valid": False,
        "variableId": 1, "variableValid": False, "variableValue": 0,
    }
    if cond:
        conditions.update(cond)
    return {
        "conditions": conditions,
        "directionFix": False,
        "image": image or {"characterIndex": 0, "characterName": "", "direction": 2, "pattern": 0, "tileId": 0},
        "list": commands or [END()],
        "moveFrequency": 3,
        "moveRoute": {"list": [{"code": 0, "parameters": []}], "repeat": True, "skippable": False, "wait": False},
        "moveSpeed": 3,
        "moveType": move_type,
        "priorityType": priority,
        "stepAnime": False,
        "through": False,
        "trigger": trigger,
        "walkAnime": True,
    }


def add_event(map_obj, name, x, y, pages, note=""):
    events = map_obj["events"]
    eid = len(events)
    events.append({
        "id": eid, "name": name, "note": note, "pages": pages, "x": x, "y": y,
    })
    return eid


def get_event(map_obj, eid):
    return next(e for e in map_obj["events"] if e and e["id"] == eid)


def set_page(map_obj, eid, page_index, commands=None, trigger=None, cond=None, priority=None):
    page = get_event(map_obj, eid)["pages"][page_index]
    if commands is not None:
        page["list"] = commands
    if trigger is not None:
        page["trigger"] = trigger
    if cond is not None:
        page["conditions"].update(cond)
    if priority is not None:
        page["priorityType"] = priority
    return page


# ---------------------------------------------------------------- system
SWITCH_NAMES = {
    44: "第1夜已过",
    45: "第2夜已过",
    46: "第3夜已过",
    47: "第4夜已过",
    48: "尾声已开始",
    49: "森林静坐",
    50: "阿兰已入队",
    51: "兰雪已入队",
}
VAR_NAMES = {27: "结局档位（1/2/3）"}


def patch_system():
    s = load("System.json")
    for i, name in SWITCH_NAMES.items():
        assert not s["switches"][i], f"S{i} 已有名字：{s['switches'][i]}"
        s["switches"][i] = name
    for i, name in VAR_NAMES.items():
        assert not s["variables"][i], f"V{i} 已有名字：{s['variables'][i]}"
        s["variables"][i] = name
    save_json("System.json", s)


# ---------------------------------------------------------------- chapter 1/2
def patch_map004():
    m = load("Map004.json")
    p = get_event(m, 2)["pages"][0]
    idx = next(i for i, c in enumerate(p["list"]) if c["code"] == 357 and c["parameters"][0] == "XueEr_MoodMeter")
    init = VAR(24, 0, 1) + VAR(25, 0, 0) + VAR(27, 0, 0)
    p["list"][idx + 1:idx + 1] = init
    save_map(4, m)


def patch_map007():
    m = load("Map007.json")

    # 穆妈首次对话：关系 +1，当日已打招呼
    p = get_event(m, 2)["pages"][0]
    idx = next(i for i, c in enumerate(p["list"]) if c["code"] == 123)
    p["list"][idx:idx] = IF_SW(25, False) + VAR(24, 1, 1) + SW(25, True) + ENDIF()

    # 床：第1夜 → 天亮，删切片 set 28
    bed = [
        *T("（被子叠得很整齐。）"),
        *IF_SW(44, False),
        *IF_VAR(15, 1, 1),
        *CHOICE(["睡吧", "还不困"]),
        *WHEN(0, "睡吧"),
        *SAVE_BGM(),
        *BGM_FADE(2),
        *IF_SW(41, True),
        *MONO(1, 3),
        *ELSE(),
        *IF_VAR(15, 1, 3),
        *MONO(1, 1),
        *ELSE(),
        *MONO(1, 2),
        *ENDIF(),
        *ENDIF(),
        *RESUME_BGM(),
        *MOOD_ADD(3),
        *IF_VAR(25, 0, 0),
        *VAR(24, 2, 1),
        *ENDIF(),
        *VAR(25, 0, 0),
        *SW(44, True),
        *T("（再醒来的时候，天已经亮了。）"),
        *T("（村口的水井边，好像有风从下面吹上来。）"),
        *FADE_OUT(),
        *TRANSFER(7, 22, 12, 2, 0),
        *WHEN(1, "还不困"),
        *END_CHOICE(),
        *ELSE(),
        *T("现在还早，先去吃点东西，或者去村里转转吧。"),
        *ENDIF(),
        *ELSE(),
        *T("（天已经亮了。该去村里看看了。）"),
        *ENDIF(),
        *END(),
    ]
    set_page(m, 16, 0, commands=bed)

    # 窗前：心锁 2
    window_page = page_template(trigger=0, priority=0, commands=[
        *IF_SW(22, False),
        *MEMLOCK(2),
        *MOOD_ADD(-1),
        *T("（窗外的天，灰得像一张旧照片。）"),
        *ELSE(),
        *T("（窗台上落了一层薄灰。）"),
        *ENDIF(),
        *END(),
    ])
    add_event(m, "窗前", 21, 7, [window_page])
    save_map(7, m)


def patch_map002():
    m = load("Map002.json")
    # 井边：第一章是心锁1；第1夜之后成为地下迷宫入口
    p1 = page_template(trigger=0, priority=0, commands=[
        *IF_SW(21, False),
        *MEMLOCK(1),
        *MOOD_ADD(-1),
        *ELSE(),
        *T("（井边很安静。）"),
        *ENDIF(),
        *END(),
    ])
    p2 = page_template(trigger=0, priority=0, cond={"switch1Valid": True, "switch1Id": 44}, commands=[
        *T("（井水黑得像没有底。）"),
        *CHOICE(["下到井里", "算了"]),
        *WHEN(0, "下到井里"),
        *T("（她顺着井壁的石头，慢慢往下爬。）"),
        *FADE_OUT(),
        *TRANSFER(13, 3, 9, 2, 0),
        *WHEN(1, "算了"),
        *END_CHOICE(),
        *END(),
    ])
    add_event(m, "井边", 10, 13, [p1, p2])
    save_map(2, m)


def patch_map013():
    m = load("Map013.json")
    exit_page = [
        *IF_SW(2, True),
        *MEMLOCK(3),
        *MOOD_ADD(-3),
        *T("天已经黑了一半。"),
        *FADE_OUT(),
        *TRANSFER(14, 9, 10, 2, 0),
        *ELSE(),
        *T("（上面的出口被藤蔓挡着。今晚的东西还没找齐。）"),
        *ENDIF(),
        *END(),
    ]
    set_page(m, 13, 0, commands=exit_page, trigger=1)
    exit_event = get_event(m, 13)
    exit_event["x"], exit_event["y"] = 16, 2
    # 营地建好后给出口提示
    p = get_event(m, 16)["pages"][0]
    idx = next(i for i, c in enumerate(p["list"]) if c["code"] == 121 and c["parameters"][0] == 2)
    p["list"][idx + 1:idx + 1] = T("（东西够了。往北边走，应该能找到出口。）", indent=1)
    save_map(13, m)


def patch_map014():
    m = load("Map014.json")
    sit = [
        *IF_SW(49, False),
        *T("（她在林子中间站住。）……我刚才是不是来过这儿。"),
        *T("（树都一样。路也一样。）"),
        *TINT(-30, -30, -30, 0, 60, True),
        *WAIT(180),
        *TINT(0, 0, 0, 0, 60, True),
        *T("（她站起来。）……走吧。"),
        *MEMLOCK(4),
        *MOOD_ADD(-1),
        *SW(49, True),
        *ELSE(),
        *T("（她已经在这儿坐过了。）"),
        *ENDIF(),
        *END(),
    ]
    set_page(m, 1, 0, commands=sit, trigger=0)
    leave = [
        *T("（沿着这条小路，能走出森林。）"),
        *CHOICE(["离开森林", "再待一会儿"]),
        *WHEN(0, "离开森林"),
        *IF_SW(45, False),
        *T("沙尔文：你不该在林子中间停下。"),
        *T("雪儿：……又是你。"),
        *T("沙尔文：这里的东西，都是你自己放在这儿的。"),
        *T("雪儿：我听不懂。"),
        *T("沙尔文：（停了很久）……那就算了。"),
        *SAVE_BGM(),
        *BGM_FADE(2),
        *IF_SW(49, True),
        *MONO(2, 1),
        *ELSE(),
        *MONO(2, 2),
        *ENDIF(),
        *MOOD_ADD(3),
        *SW(45, True),
        *FADE_OUT(),
        *TRANSFER(20, 0, 17, 2, 0),
        *ELSE(),
        *T("（她沿着小路离开了森林。）"),
        *FADE_OUT(),
        *TRANSFER(20, 0, 17, 2, 0),
        *ENDIF(),
        *WHEN(1, "再待一会儿"),
        *END_CHOICE(),
        *END(),
    ]
    set_page(m, 2, 0, commands=leave, trigger=0)
    save_map(14, m)


def main():
    patch_system()
    patch_map004()
    patch_map007()
    patch_map002()
    patch_map013()
    patch_map014()
    print("chapter 1-2 patched")


if __name__ == "__main__":
    main()
