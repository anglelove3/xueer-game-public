# -*- coding: utf-8 -*-
import json, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from _paths import DATA as BASE
def load(n):
    with open(os.path.join(BASE,n),'r',encoding='utf-8') as f:
        return json.load(f)

print("="*70); print("CommonEvents"); print("="*70)
ce = load('CommonEvents.json')
for c in ce:
    if not c: continue
    trig = c.get('trigger')
    sw = c.get('switchId')
    print(f"[{c['id']}] {c.get('name')}  trigger={trig} switch={sw}")
    for cmd in (c.get('list') or []):
        code = cmd.get('code'); p = cmd.get('parameters',[])
        if code == 401 and p: print(f"       {p[0]}")
        elif code == 102 and p: print(f"       ?选择: {' / '.join(map(str,p[0]))}")
        elif code == 355 and p: print(f"       $ {p[0]}")

print()
print("="*70); print("Tasks.json"); print("="*70)
try:
    tk = load('Tasks.json')
    print(json.dumps(tk, ensure_ascii=False, indent=1)[:4000])
except Exception as e:
    print("err", e)

print()
print("="*70); print("Items / Weapons / Armors 名称"); print("="*70)
for fn,label in [('Items.json','物品'),('Weapons.json','武器'),('Armors.json','防具'),('Skills.json','技能'),('States.json','状态')]:
    d = load(fn)
    names = [f"[{x['id']}]{x.get('name')}" for x in d if x and x.get('name')]
    print(f"{label}({len(names)}): " + ", ".join(names))
