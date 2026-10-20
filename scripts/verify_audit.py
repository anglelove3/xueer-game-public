# -*- coding: utf-8 -*-
"""核对 设计文档_完善版 的断言 vs 工程实际数据"""
import json, os, sys, io, re, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from _paths import PROJECT_ROOT as ROOT
D = os.path.join(ROOT, "data")

def load(name):
    with open(os.path.join(D, name), "r", encoding="utf-8") as f:
        return json.load(f)

def texts_of_map(md):
    """抽出地图内所有 ShowText 文本"""
    out = []
    for i, ev in enumerate(md.get("events", [])):
        if not ev:
            continue
        for pi, pg in enumerate(ev.get("pages", [])):
            buf = []
            for c in pg.get("list", []):
                if c.get("code") == 401:
                    buf.append(c.get("parameters", [""])[0])
                elif c.get("code") == 101:
                    buf.append("".join(c.get("parameters", [])[0:1]))
            if buf:
                out.append((ev.get("id", i), ev.get("name", ""), pi + 1, buf))
    return out

# ========== 1. 合规词频统计 ==========
WORDS = ["全能神教", "女基督", "女神使", "全能神", "万能的主", "万能的神使",
         "全能神传教者", "全能神教教众", "基督大人"]
hits = collections.defaultdict(lambda: collections.defaultdict(int))
for fn in sorted(os.listdir(D)):
    if not fn.endswith(".json"):
        continue
    try:
        raw = open(os.path.join(D, fn), "r", encoding="utf-8").read()
    except Exception:
        continue
    for w in WORDS:
        n = raw.count(w)
        if n:
            hits[w][fn] = n

print("=== 1. 合规风险词频（实测）===")
print(f"{'词':<14}{'总次数':<8}分布")
for w in WORDS:
    tot = sum(hits[w].values())
    if tot == 0:
        print(f"{w:<14}{0}")
        continue
    dist = ", ".join(f"{k.replace('.json','')}×{v}" for k, v in sorted(hits[w].items(), key=lambda x: -x[1]))
    print(f"{w:<14}{tot:<8}{dist}")

# ========== 2. 模板残留 / 错字 ==========
print("\n=== 2. 模板残留与错字（实测）===")
CHECKS = ["とんがり帽子", "とんがり", "慕兰学", "过陆的旅人", "百威", "喜力", "科罗娜",
          "是分进入村庄", "你时想起了什么", "是出来的冒险者", "太贪心了拉", "雪儿姐姐太棒拉",
          "大 Snow 花", "又把", "妈妈们", "为甚", "任务xxx", "害了病拉",
          "城市npc", "鬼怪 1", "酒客 5", "女工 1", "犯错...."]
for c in CHECKS:
    loc = []
    for fn in sorted(os.listdir(D)):
        if not fn.endswith(".json"):
            continue
        raw = open(os.path.join(D, fn), "r", encoding="utf-8").read()
        if c in raw:
            loc.append(f"{fn.replace('Map','').replace('.json','')}×{raw.count(c)}")
    print(f"  {c:<16}{'命中: ' + ', '.join(loc) if loc else '未命中'}")

# ========== 3. 数据库条目数 vs 文档断言 ==========
DOC_CLAIM = {"Actors": 10, "Classes": 8, "Skills": 149, "Weapons": 40, "Armors": 86,
             "Items": 30, "Enemies": 20, "Troops": 21, "States": 28}
print("\n=== 3. 数据库条目数：文档断言 vs 实测 ===")
print(f"{'文件':<16}{'文档断言':<10}{'实测有效':<10}判定")
for fn, claim in DOC_CLAIM.items():
    arr = load(fn + ".json")
    valid = len([x for x in arr if x])
    verdict = "✅一致" if valid == claim else "❌不符"
    print(f"  {fn:<14}{claim:<12}{valid:<12}{verdict}")

# ========== 4. 插件重复注册 ==========
print("\n=== 4. plugins.js 重复注册（实测）===")
txt = open(os.path.join(ROOT, "js", "plugins.js"), "r", encoding="utf-8").read()
names = re.findall(r'\{"name":"(.*?)","status":(true|false)', txt)
cnt = collections.Counter(n for n, _ in names)
dups = {k: v for k, v in cnt.items() if v > 1}
print(f"  注册条目数: {len(names)}   去重后: {len(cnt)}")
print(f"  重复注册  : {dups if dups else '无'}")
off = [n for n, s in names if s == "false"]
print(f"  已停用({len(off)}): {off}")

# ========== 5. 任务占位 ==========
print("\n=== 5. Tasks.json 占位任务（实测）===")
tasks = load("Tasks.json")
real = [t for t in tasks if t and not re.match(r'^任务\d+$', t.get("name", ""))]
ph = [t for t in tasks if t and re.match(r'^任务\d+$', t.get("name", ""))]
print(f"  总条目 {len([t for t in tasks if t])}  真任务 {len(real)}  占位「任务xxx」 {len(ph)}")
for t in real:
    print(f"    #{t['id']} {t.get('name','')}")

# ========== 6. 公共事件是否全空 ==========
print("\n=== 6. CommonEvents.json（实测）===")
ce = load("CommonEvents.json")
empty = 0
for e in ce:
    if not e:
        continue
    lst = e.get("list", [])
    body = [c for c in lst if c.get("code", 0) != 0]
    if not body:
        empty += 1
print(f"  有效公共事件 {len([e for e in ce if e])}  其中空壳 {empty}")

# ========== 7. Map002 事件9 分支结构（Bug 核对）==========
print("\n=== 7. Map002 事件#9 分支结构核对（D1/D2 Bug）===")
m2 = load("Map002.json")
for ev in m2.get("events", []):
    if not ev or ev.get("id") != 9:
        continue
    print(f"  事件名: {ev.get('name')}  页数: {len(ev.get('pages', []))}")
    for pi, pg in enumerate(ev.get("pages", [])):
        codes = [c.get("code") for c in pg.get("list", [])]
        print(f"   第{pi+1}页: 条件switch={pg.get('conditions',{}).get('switch1Id')} "
              f"variable={pg.get('conditions',{}).get('variableValid')} "
              f"item={pg.get('conditions',{}).get('itemId')} "
              f"| 指令数={len(codes)} 含条件分支={codes.count(111)} 含选择={codes.count(102)}")
        # 打印该页条件判定相关
        cond = pg.get("conditions", {})
        print(f"      conditions: {json.dumps(cond, ensure_ascii=False)}")

# ========== 8. 文件级体检 ==========
print("\n=== 8. 文件级体检 ===")
for p in ["debug.log", "Game.rmmzproject", "package.json", "index.html"]:
    fp = os.path.join(ROOT, p)
    print(f"  {p:<20}{'存在 ' + str(os.path.getsize(fp)) + ' B' if os.path.exists(fp) else '不存在'}")

# ========== 9. 变量/开关命名 ==========
print("\n=== 9. 命名开关/变量（实测）===")
sysd = load("System.json")
sw = sysd.get("switches", [])
va = sysd.get("variables", [])
named_sw = [(i, s) for i, s in enumerate(sw) if s]
named_va = [(i, v) for i, v in enumerate(va) if v]
print(f"  命名开关 {len(named_sw)}:")
for i, s in named_sw:
    print(f"    S{i} = {s}")
print(f"  命名变量 {len(named_va)}:")
for i, v in named_va:
    print(f"    V{i} = {v}")
