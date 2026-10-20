# -*- coding: utf-8 -*-
import json, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from _paths import DATA as D
def load(n):
    return json.load(open(os.path.join(D, n), "r", encoding="utf-8"))

def show(fn, limit=None, only_named=True):
    arr = load(fn)
    valid = [x for x in arr if x]
    print(f"\n===== {fn}  有效条目 {len(valid)} =====")
    for x in valid[:(limit or len(valid))]:
        nm = x.get("name", "")
        note = "  [无名字]" if not nm else ""
        print(f"  #{x.get('id'):>4}  {nm}{note}")

show("Items.json", 60)
show("Weapons.json", 60)
show("Armors.json", 60)
show("Classes.json")
show("States.json")
