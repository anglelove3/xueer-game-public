# -*- coding: utf-8 -*-
import json, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from _paths import DATA as BASE
def load(n):
    with open(os.path.join(BASE,n),'r',encoding='utf-8') as f:
        return json.load(f)

print("=== CommonEvents 原始(前3条) ===")
ce = load('CommonEvents.json')
for c in ce[:4]:
    if c is None: continue
    print(json.dumps(c, ensure_ascii=False)[:600])

print()
print("=== Map 尺寸/tileset ===")
mi = load('MapInfos.json')
id2name={m['id']:m['name'] for m in mi if m}
for mid in sorted(id2name):
    fp=os.path.join(BASE,f'Map{mid:03d}.json')
    if not os.path.exists(fp): continue
    m=load(f'Map{mid:03d}.json')
    w=m.get('width'); h=m.get('height'); ts=m.get('tilesetId')
    nev=len([e for e in (m.get('events') or []) if e])
    print(f"[{mid:>3}] {id2name[mid]:<24} {w}x{h} tileset={ts} 事件数={nev}")

print()
print("=== Tilesets 名称 ===")
t=load('Tilesets.json')
for x in t:
    if x and x.get('name'): print(f"[{x['id']}] {x['name']}")

print()
print("=== Classes 名称 ===")
cl=load('Classes.json')
for x in cl:
    if x and x.get('name'): print(f"[{x['id']}] {x['name']}")

print()
print("=== 开关/变量 命名(前60) ===")
sy=load('System.json')
sw=sy.get('switches',[])
for i,s in enumerate(sw):
    if s: print(f"S{i:>3} {s}")
va=sy.get('variables',[])
print("---- 变量 ----")
for i,s in enumerate(va):
    if s: print(f"V{i:>3} {s}")
