# -*- coding: utf-8 -*-
"""推送前最后探查：JSON格式 / Map006、039 引用 / 漏网词"""
import json, os, sys, io, glob, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from _paths import PROJECT_ROOT as ROOT
D = os.path.join(ROOT, "data")

# 1) JSON 原始格式（决定回写格式，避免 git diff 噪音）
raw = open(os.path.join(D, "Actors.json"), "r", encoding="utf-8").read()
print("=== 1. Actors.json 前 200 字符 ===")
print(repr(raw[:200]))
print("是否单行(无\\n):", "\n" not in raw)

# 2) 地图传送目标统计（code 201: params[0]=mapId）
targets = {}
for fp in glob.glob(os.path.join(D, "Map*.json")):
    if fp.endswith("MapInfos.json"):
        continue
    md = json.load(open(fp, "r", encoding="utf-8"))
    for ev in md.get("events", []):
        if not ev:
            continue
        for pg in ev.get("pages", []):
            for c in pg.get("list", []):
                if c.get("code") == 201:
                    mid = c.get("parameters", [None])[0]
                    targets[mid] = targets.get(mid, 0) + 1
print("\n=== 2. 传送目标分布（关心 6 和 39）===")
print("传送到 Map006:", targets.get(6, 0), "次")
print("传送到 Map039:", targets.get(39, 0), "次")

# MapInfos 里 6/39 的信息
mi = json.load(open(os.path.join(D, "MapInfos.json"), "r", encoding="utf-8"))
for idx in (6, 39):
    print(f"MapInfos[{idx}]:", json.dumps(mi[idx], ensure_ascii=False) if idx < len(mi) and mi[idx] else "null")

# 3) 漏网词核对
print("\n=== 3. 漏网词实测 ===")
WORDS = ["基督大人", "女基督大人", "鬼怪1", "鬼怪2", "鬼怪", "城市npc1", "城市npc2", "城市npc3", "大城市"]
for w in WORDS:
    hits = []
    for fn in sorted(os.listdir(D)):
        if not fn.endswith(".json"):
            continue
        t = open(os.path.join(D, fn), "r", encoding="utf-8").read()
        n = t.count(w)
        if n:
            hits.append(f"{fn[:-5]}×{n}")
    print(f"  {w:<12}", ", ".join(hits) if hits else "未命中")
