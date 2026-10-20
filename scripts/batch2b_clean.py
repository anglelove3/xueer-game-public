# -*- coding: utf-8 -*-
"""
Step ③ · C 节数据库清理（按实测 ID 清单，非文档错误基数）
============================================================
依据：`C节_修正版数据库清理清单.md §4`

⚠ MZ 铁律：数据库条目**不能真删**（要保索引对齐）。本文的"清空"= 名称/描述/效果清掉，ID 槽保留。

做法：
  · 数组型 data 文件 → json 解析后修改 + 用「每元素一行」重序列化
    （已实测 13/14 个数组文件可逐字节复现，零格式噪音）
  · Map*.json（顶层是字典，不可重序列化）→ 只做**字节级子串替换**
  · 每步都带断言：改完 json.loads 自校验 + 关键计数复核
"""
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
from _paths import DATA as D
# ---------------------------------------------------------------- 清单
KEEP_ITEMS = {8, 12, 31, 101, 102, 103, 104, 105, 106}      # 8/12 商店奖励用；31/101-106 作者自定义白名单
KEEP_SKILLS = {1, 2, 15, 172, 202, 216, 226}                 # 攻击/防御/逃跑 + 四角色核心（06 表的最小集，ID 已按实测校正）
CLEAR_ENEMIES = {1, 2, 4, 5, 16, 17, 19, 21}
RENAME_ENEMIES = {12: "注视", 18: "那个声音", 20: "它"}
CLEAR_TROOPS = {2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20}
CLEAR_ACTORS = set(range(13, 21))
WEAPON_NAMES = {1: "旧雨伞", 2: "菜刀", 3: "拖把", 4: "公文包", 5: "酒瓶", 6: "旧钢笔", 7: "擀面杖", 8: "帆布包"}
ARMOR_NAMES = {1: "一件旧外套", 2: "一条围巾", 3: "一顶旧帽子", 4: "一双不合脚的鞋"}


def load(fn):
    return json.loads(open(os.path.join(D, fn), "rb").read().decode("utf-8"))


def save_arr(fn, arr):
    b = ("[\n" + ",\n".join(json.dumps(e, ensure_ascii=False, separators=(",", ":")) for e in arr) + "\n]").encode("utf-8")
    json.loads(b.decode("utf-8"))                 # 自校验
    open(os.path.join(D, fn), "wb").write(b)


def blank(e, deep=True):
    """把一条数据库条目清空（保 ID 槽）"""
    if not isinstance(e, dict):
        return
    for k in ("name", "description", "note", "nickname", "profile"):
        if k in e:
            e[k] = ""
    if deep:
        for k in ("effects", "traits", "actions", "dropItems"):
            if k in e:
                e[k] = []


def patch_map(fn, subs):
    """Map*.json / System.json：字节级子串替换（顶层是字典，不可重序列化）"""
    p = os.path.join(D, fn)
    raw = open(p, "rb").read()
    for old, new, exp, why in subs:
        ob = old.encode("utf-8") if isinstance(old, str) else old
        nb = new.encode("utf-8") if isinstance(new, str) else new
        n = raw.count(ob)
        if n != exp:
            raise AssertionError(f"{fn} 「{old[:40]}」应 {exp} 次，实际 {n} 次")
        raw = raw.replace(ob, nb)
        print(f"    ✓ {why}")
    json.loads(raw.decode("utf-8"))
    open(p, "wb").write(raw)


log = []

# ================================================================ A 前置
print("【A】前置修复（避免清空后产生悬空引用）")

# A1 Troops#1 成员换成心魔 → 解锁哥布林清空
tr = load("Troops.json")
print(f"  A1 Troops#1 name={tr[1]['name']!r} members={[m['enemyId'] for m in tr[1]['members']]}")
tr[1]["name"] = "心魔*2"
for m in tr[1]["members"]:
    m["enemyId"] = 6
save_arr("Troops.json", tr)          # ⚠ 必须落盘：否则会被 B7 的重新 load 覆盖（2026-10-09 踩过）

# A2 Map010#9 宝箱：秘银软帽(护甲56) → 帽子槽(护甲3)；顺手修日文残留
raw = open(os.path.join(D, "Map010.json"), "rb").read()
r2, n1 = re.subn(rb'\{"code":128,"indent":(\d+),"parameters":\[56,',
                 rb'{"code":128,"indent":\1,"parameters":[3,', raw)
assert n1 == 1, f"Map010 护甲56 替换数 {n1}"
assert r2.count("とんがり帽子を手に入れた！".encode()) == 1
r2 = r2.replace("とんがり帽子を手に入れた！".encode(), "获得了一顶旧帽子！".encode())
json.loads(r2.decode("utf-8"))
open(os.path.join(D, "Map010.json"), "wb").write(r2)
print("  A2 Map010#9 宝箱：护甲 56→3（帽子槽）+ 修日文残留 →「获得了一顶旧帽子！」")

# A3 Map016#3 商店：MZ 源码确认 302 自身参数是第一件商品、后续 605 逐条追加
#    → 改成只卖 超级药水(8) + 驱散草药(12)
raw = open(os.path.join(D, "Map016.json"), "rb").read()
r3, n2 = re.subn(rb'\{"code":302,"indent":(\d+),"parameters":\[0,7,',
                 rb'{"code":302,"indent":\1,"parameters":[0,8,', raw)
assert n2 == 1, f"Map016 302 替换数 {n2}"
for i in (8, 9, 10, 13, 14, 15):
    pat = re.compile(rb'\{"code":605,"indent":\d+,"parameters":\[0,%d,0,0\]\},' % i)
    r3, c = pat.subn(b"", r3)
    assert c == 1, f"Map016 605 商品 {i} 删除数 {c}"
json.loads(r3.decode("utf-8"))
open(os.path.join(D, "Map016.json"), "wb").write(r3)
print("  A3 Map016#3 商店：302→物品8，删 6 条 605（8/9/10/13/14/15），保留 12 → 只卖 2 件")

# ================================================================ B 数据库清空
print("\n【B】数据库清空")

# B1 物品
it = load("Items.json")
cleared = [i for i, e in enumerate(it) if isinstance(e, dict) and e.get("name") and i not in KEEP_ITEMS]
for i in cleared:
    blank(it[i])
save_arr("Items.json", it)
print(f"  B1 Items：清空 {len(cleared)} 个 {cleared}")
print(f"     保留 {sorted(KEEP_ITEMS)} → {[it[i]['name'] for i in sorted(KEEP_ITEMS)]}")

# B2 武器
wp = load("Weapons.json")
cleared = [i for i, e in enumerate(wp) if isinstance(e, dict) and e.get("name")]
for i in cleared:
    blank(wp[i])
for i, n in WEAPON_NAMES.items():
    wp[i]["name"] = n
save_arr("Weapons.json", wp)
print(f"  B2 Weapons：清空 {len(cleared)} 个；槽 1–8 改名 → {list(WEAPON_NAMES.values())}")

# B3 护甲
ar = load("Armors.json")
cleared = [i for i, e in enumerate(ar) if isinstance(e, dict) and e.get("name")]
for i in cleared:
    blank(ar[i])
for i, n in ARMOR_NAMES.items():
    ar[i]["name"] = n
save_arr("Armors.json", ar)
print(f"  B3 Armors：清空 {len(cleared)} 个；槽 1–4 改名 → {list(ARMOR_NAMES.values())}")

# B4 技能
sk = load("Skills.json")
cleared = [i for i, e in enumerate(sk) if isinstance(e, dict) and e.get("name") and i not in KEEP_SKILLS]
for i in cleared:
    blank(sk[i])
save_arr("Skills.json", sk)
print(f"  B4 Skills：清空 {len(cleared)} 个；保留 {sorted(KEEP_SKILLS)} → {[sk[i]['name'] for i in sorted(KEEP_SKILLS)]}")

# B5 职业习得（同步剔除）
cl = load("Classes.json")
removed = 0
for c in cl:
    if isinstance(c, dict) and c.get("learnings"):
        before = len(c["learnings"])
        c["learnings"] = [l for l in c["learnings"] if l.get("skillId") in KEEP_SKILLS]
        removed += before - len(c["learnings"])
save_arr("Classes.json", cl)
print(f"  B5 Classes：剔除 {removed} 条指向已清空技能的习得")

# B6 敌人
en = load("Enemies.json")
for i in CLEAR_ENEMIES:
    blank(en[i])
for i, n in RENAME_ENEMIES.items():
    en[i]["name"] = n
acts = 0
for e in en:
    if isinstance(e, dict) and e.get("actions"):
        b = len(e["actions"])
        e["actions"] = [a for a in e["actions"] if a.get("skillId") in KEEP_SKILLS]
        acts += b - len(e["actions"])
save_arr("Enemies.json", en)
print(f"  B6 Enemies：清空 {sorted(CLEAR_ENEMIES)}；改名 {RENAME_ENEMIES}；剔除 {acts} 条指向已清空技能的行动")

# B7 敌群
tr2 = load("Troops.json")
for i in CLEAR_TROOPS:
    tr2[i]["name"] = ""
    tr2[i]["members"] = []
save_arr("Troops.json", tr2)
print(f"  B7 Troops：清空 {len(CLEAR_TROOPS)} 组；保留 1（心魔*2）/ 6（心魔）/ 21（拂晓教信徒*3）")

# B8 角色
ac = load("Actors.json")
for i in CLEAR_ACTORS:
    blank(ac[i])
    if "equips" in ac[i]:
        ac[i]["equips"] = [0] * len(ac[i]["equips"])
save_arr("Actors.json", ac)
print(f"  B8 Actors：清空 {sorted(CLEAR_ACTORS)}（并清初始装备）；保留 1 雪儿 / 2 兰雪 / 3 岚哥 / 4 阿兰")

# B9 系统标题（字节替换，System.json 顶层是字典不可重序列化）
patch_map("System.json", [
    ('"gameTitle":"一位抑郁症患者的独白。"', '"gameTitle":"一位抑郁症患者的独白"', 1,
     'B9 System：gameTitle 去掉结尾句号'),
])

print("\n完成。")
