# -*- coding: utf-8 -*-
import json, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from _paths import DATA as BASE
def load(n):
    with open(os.path.join(BASE,n),'r',encoding='utf-8') as f:
        return json.load(f)

def page_commands(page):
    """返回该事件页的指令列表"""
    return page.get('list', [])

def extract_texts(commands):
    """从指令列表中抽取对话文本/选项"""
    out = []
    for c in commands:
        code = c.get('code')
        p = c.get('parameters', [])
        if code == 401 and p:      # show text line
            out.append(('', p[0]))
        elif code == 102 and p:    # show choices
            out.append(('CHOICE', ' / '.join(str(x) for x in p[0])))
        elif code == 405 and p:    # choice branch label
            out.append(('BRANCH', p[0]))
        elif code == 101 and p:    # face + name
            if len(p)>=5:
                out.append(('NAME', f"[face={p[0]} idx={p[1]} pos={p[2]} bg={p[3]}] {p[4]}"))
        elif code == 355 and p:    # script
            s = str(p[0])
            if any(k in s for k in ['Quest','Task','Capacity','switch','Switch','Variable','variable','Diary']):
                out.append(('SCRIPT', s))
        elif code == 111 and p:    # conditional
            pass
    return out

mi = load('MapInfos.json')
id2name = {m['id']: m['name'] for m in mi if m}

total_lines = 0
for mid in sorted(id2name.keys()):
    fn = f'Map{mid:03d}.json'
    fp = os.path.join(BASE, fn)
    if not os.path.exists(fp):
        continue
    try:
        m = load(fn)
    except Exception as e:
        print(f"!! {fn} load err {e}")
        continue
    events = m.get('events') or []
    ev_with = []
    for ev in events:
        if not ev: continue
        name = ev.get('name') or ''
        for pi, pg in enumerate(ev.get('pages') or []):
            t = extract_texts(page_commands(pg))
            if t:
                ev_with.append((ev.get('id'), name, pi, t))
    if ev_with:
        print("\n" + "#"*70)
        print(f"# Map{mid:03d}  {id2name[mid]}")
        print("#"*70)
        for eid, name, pi, t in ev_with:
            print(f"\n--- 事件#{eid} 【{name}】 (page {pi}) ---")
            for kind, txt in t:
                total_lines += 1
                if kind == 'CHOICE':
                    print(f"   ?选择: {txt}")
                elif kind == 'BRANCH':
                    print(f"   >分支: {txt}")
                elif kind == 'SCRIPT':
                    print(f"   $脚本: {txt}")
                else:
                    print(f"   {txt}")

print("\n\n总对话行数:", total_lines)
