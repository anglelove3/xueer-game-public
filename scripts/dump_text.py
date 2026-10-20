# -*- coding: utf-8 -*-
"""把全工程 ShowText(401) 按 地图/事件/页 拼成整段导出，并对常见语病打标"""
import json, os, re, sys
sys.stdout.reconfigure(encoding="utf-8")
from _paths import DATA as D
MAPS = ["Map%03d.json" % i for i in list(range(1, 6)) + list(range(7, 22)) + [23,25,26,27,29,30,31,32,33,36,37,41]]

# 明确的错别字/病句模式（高置信，可机械替换）
TYPOS = [
    ("拉！", "啦！"), ("拉，", "啦，"), ("太棒拉", "太棒啦"), ("太贪心拉", "太贪心啦"),
    ("村里面", "村子里"), ("呆不下去", "待不下去"), ("到好像使", "倒好像是"),
    ("找妖除魔", "降妖除魔"), ("不知为甚", "不知道为"),
    ("多床时间", "多长时间"), ("海了病拉", "害了病啦"), ("海了病", "害了病"),
    ("年纪亲亲", "年纪轻轻"), ("又没有那么多人住", "明明没有那么多人住"),
    ("需要购买写什么", "需要买些什么"), ("委托给你的人物", "委托给你的任务"),
    ("乱七八槽", "乱七八糟"), ("还是还是", "还是"), ("这个这个", "这个"),
    ("做了做了", "做了一个"), ("做做了一个", "做了一个"), ("先开始", "开始"),
    ("不回来", "回不来"), ("回得来了", "回得来"),
]
# 结构性模式
PATS = [
    ("半角逗号(CJK间)", re.compile(r"[\u4e00-\u9fff],[\u4e00-\u9fff]")),
    ("半角句号(CJK间)", re.compile(r"[\u4e00-\u9fff]\.[\u4e00-\u9fff]")),
    ("裸省略号 .. / ... / ....", re.compile(r"\.{2,}")),
    ("CJK 之间空格", re.compile(r"[\u4e00-\u9fff]\s+[\u4e00-\u9fff]")),
    ("重复汉字(叠字/漏字)", re.compile(r"([\u4e00-\u9fff])\1")),
    ("连续感叹号", re.compile(r"！{2,}")),
    ("中英混排残留", re.compile(r"[\u4e00-\u9fff][A-Za-z]{2,}|[A-Za-z]{2,}[\u4e00-\u9fff]")),
    ("日文假名残留", re.compile(r"[\u3040-\u309f\u30a0-\u30ff]")),
]

out = []
flags = []
for fn in MAPS:
    m = json.load(open(os.path.join(D, fn), encoding="utf-8"))
    evs = m.get("events") or {}
    it = enumerate(evs) if isinstance(evs, list) else evs.items()
    for eid, ev in it:
        if not isinstance(ev, dict):
            continue
        for pi, pg in enumerate(ev.get("pages") or [], 1):
            raw401 = [c["parameters"][0] for c in (pg.get("list") or [])
                      if c.get("code") == 401 and c.get("parameters") and isinstance(c["parameters"][0], str)]
            if not raw401:
                continue
            joined = "".join(raw401)
            loc = f"{fn[:-5]} #{eid}({ev.get('name') or ''}) P{pi}"
            out.append(f"{loc}\t{joined}")
            for name, pat in PATS:
                for mm in pat.finditer(joined):
                    flags.append((loc, name, mm.group(0)))
            for a, b in TYPOS:
                if a in joined:
                    flags.append((loc, "候选错字", f"{a} → {b}"))

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "story_lines.txt"), "w", encoding="utf-8") as f:
    f.write("# 全工程 ShowText 整段（地图 #事件(名) P页 \\t 文本）\n")
    f.write("\n".join(out) + "\n")

print(f"共 {len(out)} 段（事件页级）")
import collections
byfn = collections.Counter(l.split("\t")[0].split(" ")[0] for l in out)
print("按地图：", dict(sorted(byfn.items())))
print(f"\n=== 候选问题 {len(flags)} 处 ===")
cur = None
for loc, kind, val in flags:
    if loc != cur:
        print(f"\n【{loc}】")
        cur = loc
    print(f"   {kind}: {val!r}")
