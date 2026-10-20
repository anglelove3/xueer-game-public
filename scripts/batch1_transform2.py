# -*- coding: utf-8 -*-
"""
批次1 数据手术 v2 —— 原始文本替换法（格式零噪音）
原理：替换词全为中文，JSON 结构字符全为 ASCII，二者不可能相交；
     因此对文件原始文本做替换 = 对解析后的字符串值做替换，且不碰任何格式。
A3 标点三条规则均为 CJK 锚定/仅字符串内可出现，同样语法安全。
"""
import json, os, sys, io, re, glob
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from _paths import PROJECT_ROOT as ROOT
D = os.path.join(ROOT, "data")

RENAME = [
    ("女基督大人",     "圣女大人"),
    ("全能神教那帮人", "拂晓教那帮人"),
    ("全能神教教众",   "拂晓教信徒"),
    ("全能神传教者",   "神使"),
    ("万能的神使",     "神使"),
    ("全能神教",       "拂晓教"),
    ("女基督",         "圣女"),
    ("女神使",         "神使"),
    ("基督大人",       "拂晓之神"),   # 文档A1遗漏的同类合规词（B节将整句重写，届时按新文本定位）
    ("万能的主",       "拂晓之神"),
    ("全能神",         "拂晓之神"),
    ("慕兰学",         "兰雪"),
    ("过陆的旅人",     "路过的旅人"),
    ("大城市",         "莲城"),
    ("城市npc1",       "路人甲"),
    ("城市npc2",       "路人乙"),
    ("城市npc3",       "路人丙"),
    ("鬼怪1",          "心魔1"),
    ("鬼怪2",          "心魔2"),
]
CJK = r'[\u4e00-\u9fff]'
PUNCT = [
    (re.compile(r'\.{2,}'), '……', "省略号统一"),
    (re.compile(r'(?<=' + CJK + r')\s*,\s*(?=' + CJK + r')'), '，', "半角逗号→全角"),
    (re.compile(r'(?<=' + CJK + r') +(?=' + CJK + r')'), '', "CJK间空格删除"),
]

counters = {}
changed = []

def apply_text(raw):
    s = raw
    for old, new in RENAME:
        if old in s:
            counters[("改名", f"{old}→{new}")] = counters.get(("改名", f"{old}→{new}"), 0) + s.count(old)
            s = s.replace(old, new)
    for pat, rep, name in PUNCT:
        s2, n = pat.subn(rep, s)
        if n:
            counters[("标点", name)] = counters.get(("标点", name), 0) + n
        s = s2
    return s

# ---------- 1) 所有 data/*.json：改名 + 标点 ----------
for fp in sorted(glob.glob(os.path.join(D, "*.json"))):
    base = os.path.basename(fp)
    raw = open(fp, "r", encoding="utf-8").read()
    new = apply_text(raw)

    # MapInfos 额外做 E 节结构手术（行级替换，保格式）
    if base == "MapInfos.json":
        out_lines = []
        for ln in new.splitlines(keepends=True):
            if re.search(r'"id":6,.*"name":"Weather EX"', ln):
                ln = "null,\n" if ln.endswith(",\n") else "null\n"
                counters[("删除", "MapInfos[6] WeatherEX")] = 1
            elif re.search(r'"id":39,.*"name":"物品商店SF"', ln):
                ln = "null,\n" if ln.endswith(",\n") else "null\n"
                counters[("删除", "MapInfos[39] 物品商店SF")] = 1
            out_lines.append(ln)
        new = "".join(out_lines)

    if new != raw:
        # 写前自校验：必须仍是合法 JSON
        json.loads(new)
        open(fp, "w", encoding="utf-8", newline="").write(new)
        changed.append(base)

# ---------- 2) D10 plugins.js 去重 ----------
pj = os.path.join(ROOT, "js", "plugins.js")
lines = open(pj, "r", encoding="utf-8").read().splitlines(keepends=True)
seen, out, removed = set(), [], []
for ln in lines:
    m = re.search(r'\{"name":"(.*?)","status"', ln)
    if m:
        if m.group(1) in seen:
            removed.append(m.group(1)); continue
        seen.add(m.group(1))
    out.append(ln)
if removed:
    open(pj, "w", encoding="utf-8", newline="").write("".join(out))
    changed.append("js/plugins.js")

# ---------- 3) E 节文件删除 ----------
deleted = []
dl = os.path.join(ROOT, "debug.log")
if os.path.exists(dl):
    os.remove(dl); deleted.append("debug.log")
for name in ("Map006.json", "Map039.json"):
    fp = os.path.join(D, name)
    if os.path.exists(fp):
        os.remove(fp); deleted.append(f"data/{name}")

# ---------- 报告 ----------
print("=== 替换统计 ===")
for (kind, k), n in sorted(counters.items()):
    print(f"  [{kind}] {k} : {n} 处")
print(f"\n=== 重写文件 {len(changed)} 个 ===")
print("  " + ", ".join(changed))
print(f"\n=== 删除文件 ===")
print("  " + (", ".join(deleted) if deleted else "无"))
print(f"  plugins.js 去除重复注册: {removed if removed else '无'}")

# ---------- 终检 ----------
print("\n=== 终检 1：全部 data/*.json 合法性 ===")
bad = []
for fp in glob.glob(os.path.join(D, "*.json")):
    try:
        json.load(open(fp, "r", encoding="utf-8"))
    except Exception as e:
        bad.append(f"{os.path.basename(fp)}: {e}")
print("  全部合法 ✓" if not bad else f"  ❌ {bad}")

print("\n=== 终检 2：合规词残留（应全为0）===")
LEFT = ["全能神教", "女基督", "女神使", "全能神", "万能的主", "基督大人", "慕兰学", "过陆的旅人"]
for w in LEFT:
    tot = 0
    for fp in glob.glob(os.path.join(D, "*.json")):
        tot += open(fp, "r", encoding="utf-8").read().count(w)
    print(f"  {w:<10}: {tot} {'✓' if tot == 0 else '❌'}")

print("\n=== 终检 3：新词分布（抽查）===")
for w in ["拂晓教", "圣女", "神使", "拂晓之神", "莲城", "路人甲", "心魔1"]:
    tot = sum(open(fp, "r", encoding="utf-8").read().count(w) for fp in glob.glob(os.path.join(D, "*.json")))
    print(f"  {w:<8}: {tot} 处")

print("\n=== 终检 4：MapInfos 6/39 已置 null ===")
mi = json.load(open(os.path.join(D, "MapInfos.json"), "r", encoding="utf-8"))
print(f"  MapInfos[6] = {mi[6]}")
print(f"  MapInfos[39] = {mi[39]}")

print("\n=== 终检 5：plugins.js 重复项 ===")
txt = open(pj, "r", encoding="utf-8").read()
names = re.findall(r'\{"name":"(.*?)","status"', txt)
dups = {n for n in names if names.count(n) > 1}
print(f"  注册 {len(names)} 条, 重复: {dups if dups else '无 ✓'}")
