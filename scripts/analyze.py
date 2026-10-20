# -*- coding: utf-8 -*-
import json, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from _paths import DATA as BASE
def load(n):
    with open(os.path.join(BASE,n),'r',encoding='utf-8') as f:
        return json.load(f)

print("="*70)
print("MapInfos")
print("="*70)
mi = load('MapInfos.json')
for m in mi:
    if m and m.get('name'):
        print(f"[{m['id']:>3}] {m['name']}  parent={m.get('parentId')}")

print()
print("="*70)
print("Actors")
print("="*70)
ac = load('Actors.json')
for a in ac:
    if a and a.get('name'):
        print(f"[{a['id']}] {a['name']} class={a.get('classId')} nickname={a.get('nickname')}")

print()
print("="*70)
print("System - 关键信息")
print("="*70)
sy = load('System.json')
print("titleName:", sy.get('titleName'))
print("gameTitle:", sy.get('gameTitle'))
print("currencyUnit:", sy.get('currencyUnit'))
print("partyMembers:", sy.get('partyMembers'))
print("optDisplayTp:", sy.get('optDisplayTp'))
print("术语 terms.basic:", json.dumps(sy.get('terms',{}).get('basic',[]), ensure_ascii=False))
print("术语 terms.commands:", json.dumps(sy.get('terms',{}).get('commands',[]), ensure_ascii=False))
print("术语 messages:", json.dumps(sy.get('terms',{}).get('messages',{}), ensure_ascii=False)[:800])
