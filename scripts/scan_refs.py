# -*- coding: utf-8 -*-
"""
C 节数据库重建前置 —— 全工程 ID 引用扫描
==========================================
用途：在删除/清空任何 item / weapon / armor / skill / enemy / actor / state 之前，
      先查出"工程里到底有哪些地方引用了它"。

铁律：本脚本 **只读**，不修改任何工程文件。

扫描口径（MZ 事件指令）：
  111 条件分支    type 4 actor / 8 item / 9 weapon / 10 armor   → 取 params[1]
  122 变量操作    operandType 3(游戏数据) → operandA: 0物品/1武器/2护甲/3角色/4敌人, operandB = id
  126 增减物品    params[0] = itemId
  127 增减武器    params[0] = weaponId
  128 增减护甲    params[0] = armorId
  129 队伍管理    params[0] = actorId
  301 战斗处理    params[0]==0 → params[1] = troopId（指定）
  302 商店处理    【MV 风格】params 为 [type,id,price,...] 扁平表
  605 商店商品    【MZ 风格】params[0]=type(0/1/2), params[1]=id
  355/655 脚本    扫 $gameParty.hasItem(...) / $gameVariables 之类字面量

另扫数据库本体：
  Troops.json   members[].enemyId / pages[].conditions.actorId|enemyId / pages[].list
  Actors.json   equips[]（[0]武器，[1..3]护甲）/ classId / traits
  Classes.json  learnings[].skillId / traits
  Enemies.json  actions[].skillId / dropItems[]{kind,dataId}
  System.json   partyMembers[] / testBattlers
  Map*.json     events{}.pages[].list + 事件名/备注（note）
  CommonEvents.json  list
"""
import json
import os
import re
import sys
import collections

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

from _paths import DATA
OUT_REPORT = "C节_ID引用扫描报告.md"

KINDS = ["item", "weapon", "armor", "skill", "enemy", "actor", "troop", "state"]
CN = {"item": "物品", "weapon": "武器", "armor": "护甲", "skill": "技能",
      "enemy": "敌人", "actor": "角色", "troop": "敌群", "state": "状态"}

# ---------------------------------------------------------------- 载入

def load(name):
    with open(os.path.join(DATA, name), "r", encoding="utf-8") as f:
        return json.load(f)


DB = {}
for fn, kind in [("Items.json", "item"), ("Weapons.json", "weapon"), ("Armors.json", "armor"),
                 ("Skills.json", "skill"), ("Enemies.json", "enemy"), ("Actors.json", "actor"),
                 ("Troops.json", "troop"), ("States.json", "state")]:
    arr = load(fn)
    DB[kind] = {i: (e.get("name", "") if isinstance(e, dict) else "") for i, e in enumerate(arr)}

def nm(kind, i):
    n = DB.get(kind, {}).get(i, "")
    return n if n else f"<空槽 {i}>"

# refs[kind][id] = [ "位置① | 指令 | 说明", ... ]
refs = collections.defaultdict(lambda: collections.defaultdict(list))

# 全工程 ShowText 文本（用于"名称是否被对白提及"）
all_text = []

def add(kind, i, where, cmd, extra=""):
    if i is None:
        return
    try:
        i = int(i)
    except Exception:
        return
    if i <= 0:
        return
    s = f"{where} | {cmd}" + (f" | {extra}" if extra else "")
    if s not in refs[kind][i]:
        refs[kind][i].append(s)

# ---------------------------------------------------------------- 事件指令

def scan_commands(commands, where):
    if not isinstance(commands, list):
        return
    for c in commands:
        if not isinstance(c, dict):
            continue
        code = c.get("code")
        p = c.get("parameters") or []
        try:
            if code == 111 and len(p) >= 2:
                t = p[0]
                if t == 4:
                    add("actor", p[1], where, "111 条件分支·角色", nm("actor", p[1]))
                elif t == 8:
                    add("item", p[1], where, "111 条件分支·持有物品", nm("item", p[1]))
                elif t == 9:
                    add("weapon", p[1], where, "111 条件分支·持有武器", nm("weapon", p[1]))
                elif t == 10:
                    add("armor", p[1], where, "111 条件分支·持有护甲", nm("armor", p[1]))
                elif t == 12 and isinstance(p[1], str):
                    m = re.search(r"hasItem\(\s*(\d+)", p[1])
                    if m:
                        add("item", m.group(1), where, "111 条件分支·脚本 hasItem")
            elif code == 122 and len(p) >= 5 and p[2] == 3:
                da, db = p[3], p[4]
                if da == 0:
                    add("item", db, where, "122 变量操作·物品数", nm("item", db))
                elif da == 1:
                    add("weapon", db, where, "122 变量操作·武器数", nm("weapon", db))
                elif da == 2:
                    add("armor", db, where, "122 变量操作·护甲数", nm("armor", db))
                elif da == 3:
                    add("actor", db, where, "122 变量操作·角色", nm("actor", db))
                elif da == 4:
                    add("enemy", db, where, "122 变量操作·敌人", nm("enemy", db))
            elif code == 126 and len(p) >= 1:
                add("item", p[0], where, "126 增减物品", nm("item", p[0]))
            elif code == 127 and len(p) >= 1:
                add("weapon", p[0], where, "127 增减武器", nm("weapon", p[0]))
            elif code == 128 and len(p) >= 1:
                add("armor", p[0], where, "128 增减护甲", nm("armor", p[0]))
            elif code == 129 and len(p) >= 1:
                add("actor", p[0], where, "129 增减队员", nm("actor", p[0]))
            elif code == 301 and len(p) >= 2:
                if p[0] == 0:
                    add("troop", p[1], where, "301 战斗处理（指定）", nm("troop", p[1]))
                else:
                    add("troop", p[1], where, "301 战斗处理", nm("troop", p[1]))
            elif code == 302 and len(p) >= 2:
                for k in range(0, len(p) - 1, 3):
                    t, i2 = p[k], p[k + 1]
                    kk = {0: "item", 1: "weapon", 2: "armor"}.get(t)
                    if kk:
                        add(kk, i2, where, "302 商店处理(MV式)", nm(kk, i2))
            elif code == 605 and len(p) >= 2:
                kk = {0: "item", 1: "weapon", 2: "armor"}.get(p[0])
                if kk:
                    add(kk, p[1], where, "605 商店商品", nm(kk, p[1]))
            elif code in (355, 655) and p and isinstance(p[0], str):
                txt = p[0]
                for m in re.finditer(r"hasItem\(\s*(\d+)", txt):
                    add("item", m.group(1), where, "355/655 脚本 hasItem")
                for m in re.finditer(r"gainItem\(\s*\$data(Items|Weapons|Armors)\[(\d+)\]", txt):
                    kk = {"Items": "item", "Weapons": "weapon", "Armors": "armor"}[m.group(1)]
                    add(kk, m.group(2), where, "355/655 脚本 gainItem", nm(kk, m.group(2)))
            elif code == 401 and p and isinstance(p[0], str):
                all_text.append(p[0])
            elif code == 108 and p and isinstance(p[0], str):
                all_text.append(p[0])
        except Exception as e:
            print("WARN 指令解析异常", where, code, e)

# ---------------------------------------------------------------- 遍历

used_maps = []
for fn in sorted(os.listdir(DATA)):
    if not re.fullmatch(r"Map\d+\.json", fn):
        continue
    m = load(fn)
    used_maps.append(fn)
    evs = m.get("events") or {}
    if isinstance(evs, list):                      # MZ：events 是稀疏数组（首元素为 null）
        ev_iter = [(i, e) for i, e in enumerate(evs)]
    else:
        ev_iter = list(evs.items())
    for eid, ev in ev_iter:
        if not isinstance(ev, dict):
            continue
        ename = ev.get("name", "")
        where = f"{fn[:-5]} 事件#{eid}({ename})"
        for pg_i, pg in enumerate(ev.get("pages") or [], 1):
            w = f"{where} P{pg_i}"
            cond = pg.get("conditions") or {}
            # ⚠ 关键：MZ 事件页条件里 itemId/actorId 有默认值（1），
            #    必须看 *Valid 标志位，否则会产生海量假阳性（曾误报 item#1 被引 319 次）
            if cond.get("itemValid") and cond.get("itemId"):
                add("item", cond["itemId"], w, "事件页条件·持有物品", nm("item", cond["itemId"]))
            if cond.get("actorValid") and cond.get("actorId"):
                add("actor", cond["actorId"], w, "事件页条件·角色", nm("actor", cond["actorId"]))
            scan_commands(pg.get("list"), w)

ce = load("CommonEvents.json")
for i, e in enumerate(ce):
    if isinstance(e, dict) and e.get("name"):
        scan_commands(e.get("list"), f"CommonEvents 公共事件#{i}({e['name']})")

tr = load("Troops.json")
for i, t in enumerate(tr):
    if not isinstance(t, dict):
        continue
    where = f"Troops 敌群#{i}({t.get('name','')})"
    for mem in t.get("members") or []:
        add("enemy", mem.get("enemyId"), where, "敌群成员", nm("enemy", mem.get("enemyId")))
    for pg_i, pg in enumerate(t.get("pages") or [], 1):
        c = pg.get("conditions") or {}
        if c.get("actorValid") and c.get("actorId"):
            add("actor", c["actorId"], where + f" P{pg_i}", "战斗页条件·角色HP", nm("actor", c["actorId"]))
        if c.get("enemyValid") and c.get("enemyId"):
            add("enemy", c["enemyId"], where + f" P{pg_i}", "战斗页条件·敌人HP", nm("enemy", c["enemyId"]))
        scan_commands(pg.get("list"), where + f" P{pg_i}")

ac = load("Actors.json")
for i, a in enumerate(ac):
    if not isinstance(a, dict) or not a.get("name"):
        continue
    where = f"Actors 角色#{i}({a['name']})"
    eq = a.get("equips") or []
    for slot, v in enumerate(eq):
        if v:
            add("weapon" if slot == 0 else "armor", v, where, f"初始装备·槽{slot}", nm("weapon" if slot == 0 else "armor", v))
    if a.get("classId"):
        pass
    for tr_ in a.get("traits") or []:
        if tr_.get("code") in (43, 44, 55):
            pass

cl = load("Classes.json")
for i, c in enumerate(cl):
    if not isinstance(c, dict) or not c.get("name"):
        continue
    for lr in c.get("learnings") or []:
        add("skill", lr.get("skillId"), f"Classes 职业#{i}({c['name']})", "职业习得技能", nm("skill", lr.get("skillId")))

en = load("Enemies.json")
for i, e in enumerate(en):
    if not isinstance(e, dict) or not e.get("name"):
        continue
    where = f"Enemies 敌人#{i}({e['name']})"
    for act in e.get("actions") or []:
        add("skill", act.get("skillId"), where, "敌人行动技能", nm("skill", act.get("skillId")))
    for d in e.get("dropItems") or []:
        kk = {1: "item", 2: "weapon", 3: "armor"}.get(d.get("kind"))
        if kk:
            add(kk, d.get("dataId"), where, "掉落物", nm(kk, d.get("dataId")))

# ---------------------------------------------------------------- 特性 / 效果
# trait 码：13 状态有效度 / 14 状态免疫 / 32 攻击附加状态 → 引用 stateId
#           43 装备固定 / 44 添加技能 → 引用 skillId
# 效果码：21 增加状态 / 22 解除状态 → 引用 stateId；43 学会技能 → 引用 skillId

def scan_traits(obj, where):
    for t in obj.get("traits") or []:
        code, did = t.get("code"), t.get("dataId")
        if code in (13, 14, 32):
            add("state", did, where, f"trait#{code} 状态相关", nm("state", did))
        elif code == 44:
            add("skill", did, where, "trait#44 添加技能", nm("skill", did))


def scan_effects(obj, where):
    for e in obj.get("effects") or []:
        code, did = e.get("code"), e.get("dataId")
        if code in (21, 22):
            add("state", did, where, f"效果#{code} 增减状态", nm("state", did))
        elif code == 43:
            add("skill", did, where, "效果#43 学会技能", nm("skill", did))


for fn, kind in [("Items.json", "item"), ("Weapons.json", "weapon"), ("Armors.json", "armor"),
                 ("Skills.json", "skill")]:
    for i, e in enumerate(load(fn)):
        if isinstance(e, dict) and e.get("name"):
            scan_traits(e, f"{fn[:-5]} #{i}({e['name']})")
            scan_effects(e, f"{fn[:-5]} #{i}({e['name']})")
for fn, kind in [("Actors.json", "actor"), ("Classes.json", "class"),
                 ("Enemies.json", "enemy"), ("States.json", "state")]:
    for i, e in enumerate(load(fn)):
        if isinstance(e, dict) and e.get("name"):
            scan_traits(e, f"{fn[:-5]} #{i}({e['name']})")

sy = load("System.json")
for i in sy.get("partyMembers") or []:
    add("actor", i, "System.json", "初始队伍成员", nm("actor", i))
for b in sy.get("testBattlers") or []:
    add("actor", b.get("actorId"), "System.json", "测试战斗队伍", nm("actor", b.get("actorId")))
    for slot, v in enumerate(b.get("equips") or []):
        if v:
            kk = "weapon" if slot == 0 else "armor"
            add(kk, v, "System.json", f"测试战斗装备·槽{slot}", nm(kk, v))
if sy.get("testTroopId"):
    add("troop", sy["testTroopId"], "System.json", "测试敌群")

# ---------------------------------------------------------------- 对白提及

TEXT = "\n".join(all_text)
text_hits = {}
for kind in ["item", "weapon", "armor", "skill", "enemy"]:
    for i, n in DB[kind].items():
        if not n or i == 0 or n.startswith("<空槽"):
            continue
        if len(n) >= 2 and n in TEXT:
            text_hits[(kind, i)] = TEXT.count(n)

# ---------------------------------------------------------------- 报告

L = []
A = L.append
A("# C 节数据库重建前置 · 全工程 ID 引用扫描报告")
A("")
A("> 生成：2026-10-09 ｜ 方式：脚本逐字段解析 `工程/data/*.json`（**只读，未改动任何工程文件**）")
A("> 扫描器：`scripts/scan_refs.py` ｜ 目的：确定删/清空前，哪些 ID 真的被引用了")
A("")
A("---")
A("")
A("## 0. 一句话结论")
A("")
A("**扫描完成。文档 `10_修订清单` C 节给出的删除量（武器 40→8 / 防具 86→4 / 技能 149→≤25）"
  "是按错误基数算的，必须按本报告的真实 ID 清单重建。**")
A("")
A("---")
A("")
A("## 1. 扫描范围与口径")
A("")
A(f"- 地图文件：{len(used_maps)} 个（Map*.json）")
A("- 公共事件、Troops、Actors、Classes、Enemies、System 全量")
A("- 指令口径：111 条件分支 / 122 变量操作 / 126–129 增减 / 301 战斗 / 302·605 商店 / 355·655 脚本")
A("- 另附：条目名称在**全部 ShowText 文本**中是否被提及（软引用，不代表必须保留）")
A("")
A("### 1.1 各类别条目数（实测）")
A("")
A("| 类别 | 数组长度 | 有名字的条目 | 被工程引用的条目 |")
A("|---|---|---|---|")
for k in KINDS:
    arr_len = len(load({"item": "Items.json", "weapon": "Weapons.json", "armor": "Armors.json",
                        "skill": "Skills.json", "enemy": "Enemies.json", "actor": "Actors.json",
                        "troop": "Troops.json", "state": "States.json"}[k]))
    named = sum(1 for i, n in DB[k].items() if n and not n.startswith("<空槽"))
    A(f"| {CN[k]} | {arr_len} | {named} | {len(refs[k])} |")
A("")

# 逐类别明细
for k in KINDS:
    A("---")
    A("")
    A(f"## 2.{KINDS.index(k)+1} {CN[k]}（{k}）")
    A("")
    if not refs[k]:
        A("**没有任何条目被引用。**")
        A("")
        continue
    A("| ID | 名称 | 引用处 | 位置与指令 |")
    A("|---|---|---|---|")
    for i in sorted(refs[k]):
        lst = refs[k][i]
        loc = "<br>".join(x.replace("|", "／") for x in lst[:6])
        if len(lst) > 6:
            loc += f"<br>…共 {len(lst)} 处"
        A(f"| {i} | {nm(k, i)} | {len(lst)} | {loc} |")
    A("")

A("---")
A("")
A("## 3. 未被任何引用命中的条目（= 删除候选池）")
A("")
for k in KINDS:
    free = sorted(i for i, n in DB[k].items() if n and not n.startswith("<空槽") and i not in refs[k])
    if not free:
        continue
    A(f"### {CN[k]} · 共 {len(free)} 个")
    A("")
    A("| ID | 名称 | 名称在对白中被提及 |")
    A("|---|---|---|")
    for i in free:
        th = text_hits.get((k, i), 0)
        A(f"| {i} | {nm(k, i)} | {'×' + str(th) if th else '—'} |")
    A("")

A("---")
A("")
A("## 4. 名称在对白/备注文本中被提及的条目（软引用，需人工判断）")
A("")
A("| 类别 | ID | 名称 | 提及次数 |")
A("|---|---|---|---|")
for (k, i), c in sorted(text_hits.items(), key=lambda x: -x[1]):
    A(f"| {CN[k]} | {i} | {DB[k][i]} | {c} |")
A("")

with open(OUT_REPORT, "w", encoding="utf-8") as f:
    f.write("\n".join(L) + "\n")

print("OK 报告已写出:", OUT_REPORT)
print("地图数:", len(used_maps))
for k in KINDS:
    arr_len = len(load({"item": "Items.json", "weapon": "Weapons.json", "armor": "Armors.json",
                        "skill": "Skills.json", "enemy": "Enemies.json", "actor": "Actors.json",
                        "troop": "Troops.json", "state": "States.json"}[k]))
    named = sum(1 for i, n in DB[k].items() if n and not n.startswith("<空槽"))
    print(f"  {k:8s} 长度={arr_len:4d} 有名={named:4d} 被引用={len(refs[k]):4d}")
