# -*- coding: utf-8 -*-
"""
Step ② · C 组真 Bug 手术（事件层 + System + Classes）
======================================================
来源：`C节_修正版数据库清理清单.md §3 C 组`

C1  Map003#2 岚哥入队：整段对白说了"结伴而行"，却**没有 129 增减队员** → 补 129[3] + S20
C2  Map018#4 兰雪入队：`129 [9,…]` 加的是**空槽 actor 9**（兰雪是 actor 2）→ 改为 2
C3  System.json：`partyMembers [1,4,6,7]` 含两个**空槽**；`testBattlers` 引用空槽 6/7 → 清干净
C5  Classes#1 剑客：learnings 里有 `{level:1, skillId:161}`，而 Skills#161 是**空槽** → 删该条
C6  Map019#3 终章文本错：`你你.` / `那扇帐篷走吧` / `不会在做坏了吧` / `她们一直都在他们都是你。`

做法与批次1补漏一致：**二进制字节级替换** + 出现次数断言 + json.loads 自校验。
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
from _paths import DATA as D
ANCHOR_OLD = ('{"code":401,"indent":0,"parameters":["好，那我们说定了就一起出去闯一闯。"]},'
              '{"code":101,"indent":0,"parameters":["SF_Actor3",1,0,2,"岚哥"]},')
ANCHOR_NEW = ('{"code":401,"indent":0,"parameters":["好，那我们说定了就一起出去闯一闯。"]},'
              '{"code":129,"indent":0,"parameters":[3,0,false]},'          # 岚哥加入队伍
              '{"code":121,"indent":0,"parameters":[20,20,0]},'            # S20 岚哥加入队伍 = ON
              '{"code":101,"indent":0,"parameters":["SF_Actor3",1,0,2,"岚哥"]},')

TB_OLD = ('"testBattlers":[{"actorId":1,"level":1,"equips":[2,1,2,3,0]},{"actorId":4,"level":1,'
          '"equips":[31,0,0,5,0]},{"actorId":6,"level":1,"equips":[7,0,65,21,0]},{"actorId":7,'
          '"level":1,"equips":[7,0,0,20,0]}]')
TB_NEW = '"testBattlers":[{"actorId":1,"level":1,"equips":[0,0,0,0,0]}]'

PLAN = [
    # (文件, 原文, 改后, 期望次数, 说明)
    ("Map003.json", ANCHOR_OLD, ANCHOR_NEW, 1, "C1 岚哥入队补 129[3] + S20"),
    ("Map018.json", '{"code":129,"indent":0,"parameters":[9,0,false]}',
                    '{"code":129,"indent":0,"parameters":[2,0,false]}', 1, "C2 兰雪入队 actor 9→2"),
    ("System.json", '"partyMembers":[1,4,6,7]', '"partyMembers":[1]', 1, "C3 初始队伍去空槽"),
    ("System.json", TB_OLD, TB_NEW, 1, "C3 测试战斗队伍去空槽/清空测试装备"),
    ("Classes.json", ',{"level":1,"skillId":161,"note":""}', "", 1, "C5 删剑客 1 级的空技能"),
    ("Map019.json", "你你.是那时候的帮我传送回家的人，你到底是谁。",
                    "你……你是那时候帮我传送回家的人。你到底是谁。", 1, "C6 终章文本错 1"),
    ("Map019.json", "从后面的那扇帐篷走吧，你会明白一切的。",
                    "从后面的那扇门走吧，你会明白一切的。", 1, "C6 终章文本错 2（帐篷→门）"),
    ("Map019.json", "拂晓教那帮人不会在做坏了吧。",
                    "拂晓教那帮人，不会再做坏事了。", 1, "C6 终章文本错 3"),
    ("Map019.json", "她们一直都在他们都是你。",
                    "他们一直都在。他们都是你。", 1, "C6 终章文本错 4（缺标点/人称）"),
]


def main():
    # ---- 第 1 遍：预检 ----
    total = 0
    for fn, old, new, exp, why in PLAN:
        raw = open(os.path.join(D, fn), "rb").read()
        n = raw.count(old.encode("utf-8"))
        if n != exp:
            print(f"✗ 预检失败：{fn}「{old[:40]}…」应 {exp} 次，实际 {n} 次 —— 未做任何改动")
            return 1
        total += n
        print(f"✓ {fn}  ×{n}  ({why})")
    print(f"\n预检通过，共 {total} 处。落盘…\n")

    # ---- 第 2 遍：替换 + 校验 + 写回 ----
    touched = {}
    for fn, old, new, exp, why in PLAN:
        p = os.path.join(D, fn)
        raw = open(p, "rb").read()
        ob, nb = old.encode("utf-8"), new.encode("utf-8")
        raw2 = raw.replace(ob, nb)
        if raw2.count(ob) != 0 or (len(raw2) - len(raw)) != exp * (len(nb) - len(ob)):
            print(f"✗ 替换校验失败：{fn}「{old[:30]}…」 —— 未写盘")
            return 1
        try:
            json.loads(raw2.decode("utf-8"))
        except Exception as e:
            print(f"✗ JSON 校验失败：{fn} {e} —— 未写盘")
            return 1
        open(p, "wb").write(raw2)
        touched[fn] = touched.get(fn, 0) + exp
        print(f"✓ {fn}: {why}")

    print("\n===== 落盘结果 =====")
    for fn, c in touched.items():
        print(f"  {fn}: {c} 处")
    print(f"  合计 {sum(touched.values())} 处 / {len(touched)} 个文件")
    return 0


sys.exit(main())
