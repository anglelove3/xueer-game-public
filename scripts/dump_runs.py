# -*- coding: utf-8 -*-
"""按「连续 401 段落」粒度导出对白（含说话人），供逐句修订定位"""
import json, os, sys
sys.stdout.reconfigure(encoding="utf-8")
from _paths import DATA as D
MAPS = ["Map%03d.json" % i for i in list(range(1, 6)) + list(range(7, 22)) + [23,25,26,27,29,30,31,32,33,36,37,41]]
out = []
for fn in MAPS:
    m = json.load(open(os.path.join(D, fn), encoding="utf-8"))
    evs = m.get("events") or []
    for eid, ev in enumerate(evs):
        if not isinstance(ev, dict): continue
        for pi, pg in enumerate(ev.get("pages") or [], 1):
            lst = pg.get("list") or []
            i = 0
            while i < len(lst):
                if lst[i].get("code") == 401:
                    j = i
                    while j + 1 < len(lst) and lst[j + 1].get("code") == 401:
                        j += 1
                    # 往上找最近的 101 说话人
                    spk = ""
                    for k in range(i - 1, -1, -1):
                        if lst[k].get("code") == 101:
                            spk = lst[k]["parameters"][4] if len(lst[k].get("parameters") or []) > 4 else ""
                            break
                    joined = "".join(c["parameters"][0] for c in lst[i:j + 1])
                    out.append(f"{fn[:-5]}|{eid}|P{pi}|{i}|{spk}\t{joined}")
                    i = j + 1
                else:
                    i += 1
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "runs.txt")
open(p, "w", encoding="utf-8").write("\n".join(out) + "\n")
print(f"共 {len(out)} 个说话人段落 → scripts/runs.txt")
