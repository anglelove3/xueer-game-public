# -*- coding: utf-8 -*-
import json, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from _paths import DATA as BASE
def load(n):
    with open(os.path.join(BASE,n),'r',encoding='utf-8') as f:
        return json.load(f)

tk = load('Tasks.json')
print("任务总数:", len([x for x in tk if x]))
for t in tk:
    if not t: continue
    print(f"[{t['id']}] {t.get('name')} | type={t.get('type')} 发布者={t.get('issuer')}")
    print(f"     简介: {t.get('introduce')}")

print()
for fn,label in [('Items.json','物品'),('Weapons.json','武器'),('Armors.json','防具'),('Skills.json','技能'),('States.json','状态'),('Enemies.json','敌人'),('Troops.json','敌群')]:
    d = load(fn)
    names = [f"[{x['id']}]{x.get('name')}" for x in d if x and x.get('name')]
    print(f"{label}({len(names)}): " + ", ".join(names))
