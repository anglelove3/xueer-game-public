# -*- coding: utf-8 -*-
"""解析 RPG Maker MZ 工程，验证可操作性"""
import json, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from _paths import PROJECT_ROOT as ROOT
D = os.path.join(ROOT, "data")

def load(name):
    with open(os.path.join(D, name), "r", encoding="utf-8") as f:
        return json.load(f)

# 1) System.json —— 游戏全局设置
sysd = load("System.json")
print("=== System.json ===")
print("游戏标题   :", sysd.get("gameTitle"))
print("版本ID     :", sysd.get("versionId"))
print("开关数量   :", len(sysd.get("switches", [])))
print("变量数量   :", len(sysd.get("variables", [])))
print("队伍成员   :", sysd.get("partyMembers"))
print("初始金钱   :", sysd.get("partyGold"))
print("货币单位   :", sysd.get("currencyUnit"))
print("用语-等级  :", sysd.get("terms", {}).get("messages", {}).get("level"))

# 2) MapInfos.json —— 地图清单
mi = load("MapInfos.json")
maps = [m for m in mi if m]
print("\n=== MapInfos.json ===")
print("地图总数   :", len(maps))
for m in maps[:15]:
    print(f"  #{m['id']:>3}  {m.get('name','')}   (parent={m.get('parentId')}, order={m.get('order')})")

# 3) Actors.json —— 角色
ac = load("Actors.json")
actors = [a for a in ac if a]
print("\n=== Actors.json ===")
print("角色总数   :", len(actors))
for a in actors:
    print(f"  #{a['id']:>3}  {a.get('name','')}  class={a.get('classId')} 初期等级={a.get('initialLevel')}")

# 4) 统计各类数据条数 / 事件总量
print("\n=== 数据库条目统计（有效条目）===")
for fn in ["Items.json", "Weapons.json", "Armors.json", "Skills.json",
           "Enemies.json", "Troops.json", "States.json", "Classes.json",
           "CommonEvents.json", "Tilesets.json", "Animations.json"]:
    arr = load(fn)
    valid = [x for x in arr if x]
    print(f"  {fn:<22} 数组长={len(arr):<6} 有效={len(valid)}")

# 5) 事件总量 / 对话量
total_events = 0
total_cmds = 0
show_text = 0
for fn in os.listdir(D):
    if not fn.startswith("Map") or not fn.endswith(".json") or fn == "MapInfos.json":
        continue
    try:
        md = load(fn)
    except Exception:
        continue
    for ev in md.get("events", []):
        if not ev:
            continue
        total_events += 1
        for pg in ev.get("pages", []):
            for c in pg.get("list", []):
                total_cmds += 1
                if c.get("code") == 401:  # 显示文字
                    show_text += 1
print("\n=== 事件统计 ===")
print("事件总数   :", total_events)
print("事件指令数 :", total_cmds)
print("对白行数   :", show_text)

# 6) 插件数量
with open(os.path.join(ROOT, "js", "plugins.js"), "r", encoding="utf-8") as f:
    txt = f.read()
import re
names = re.findall(r'\{"name":"(.*?)"', txt)
print("\n=== 插件 ===")
print("插件总数   :", len(names))
print("已启用     :", len(re.findall(r'"status":true', txt)))
