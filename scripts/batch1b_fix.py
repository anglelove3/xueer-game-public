# -*- coding: utf-8 -*-
"""
批次1 收尾补漏 —— 合规残留 3 处 + 改名语义错位 4 处
=====================================================
做法：**二进制字节级替换**（不是文本模式！）
  · 用 rb/wb 读写 → BOM、换行符、缩进全部原样保留，零格式噪音
  · 替换词全中文（UTF-8 多字节）、JSON 结构字符全 ASCII，二者不相交
    → 数学上不可能破坏 JSON 语法
  · 每处替换断言出现次数，数目不对立即中止（不给"改了但没生效"留口子）
  · 落盘前 json.loads 自校验
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
from _paths import DATA as D
# (文件, 原文, 改后, 期望出现次数, 说明)
PLAN = [
    ("Map007.json", "天使的使者基督们", "拂晓教的神使们", 1,
     "A1 合规残留：替换表无裸词「基督」"),
    ("Map007.json", "你给我们拂晓之神去看吧", "你拿去给拂晓教的神使看看吧", 1,
     "B4 语义错位：此处「拂晓之神」指教派（原文为「万能的主」）"),
    ("Map007.json", "你给去那边的女", "你给去那边的", 1,
     "A2 合规残留·上半：跨 401 行拆分的「女」｜「基督」"),
    ("Map007.json", "基督去看吧", "圣女去看吧", 1,
     "A2 合规残留·下半：裸文本替换匹配不到跨行词"),
    ("Map003.json", "拂晓之神那帮", "拂晓教那帮", 1,
     "B1 语义错位：指教派的人，不是神"),
    ("Map003.json", "拂晓之神的", "拂晓教的", 1,
     "B2 语义错位：下一行以「人。」开头，拼起来即「拂晓教的人。」"),
    ("Map031.json", "万能的神使", "神使", 2,
     "A3 合规残留：A1 清单列了但未落实（事件#14/#15 各 1 处）"),
    ("Map019.json", "拂晓之神那帮人", "拂晓教那帮人", 1,
     "B3 语义错位：指教派的人，不是神"),
]

def main():
    # ---- 第 1 遍：全部预检，一处不符就整体中止 ----
    total = 0
    for fn, old, new, exp, why in PLAN:
        p = os.path.join(D, fn)
        raw = open(p, "rb").read()
        n = raw.count(old.encode("utf-8"))
        if n != exp:
            print(f"✗ 预检失败：{fn}  「{old}」应出现 {exp} 次，实际 {n} 次 —— 未做任何改动")
            return 1
        total += n
        print(f"✓ 预检 {fn}  「{old}」× {n}  ({why})")
    print(f"\n预检通过，共 {total} 处。开始落盘…\n")

    # ---- 第 2 遍：替换 + 自校验 + 写回 ----
    touched = {}
    for fn, old, new, exp, why in PLAN:
        p = os.path.join(D, fn)
        raw = open(p, "rb").read()
        ob, nb = old.encode("utf-8"), new.encode("utf-8")
        raw2 = raw.replace(ob, nb)
        # 校验：① 旧串必须彻底消失 ② 文件字节数变化必须恰好等于 exp×(新长−旧长)
        # （不能用"新串计数差"——新串是旧串前缀时会失真，2026-10-09 踩过）
        if raw2.count(ob) != 0 or (len(raw2) - len(raw)) != exp * (len(nb) - len(ob)):
            print(f"✗ 替换校验失败：{fn}「{old}」 —— 未写盘")
            return 1
        try:
            json.loads(raw2.decode("utf-8"))          # ← 语法自校验
        except Exception as e:
            print(f"✗ JSON 校验失败：{fn} {e} —— 未写盘")
            return 1
        open(p, "wb").write(raw2)
        touched[fn] = touched.get(fn, 0) + exp
        print(f"✓ {fn}: 「{old}」→「{new}」× {exp}")

    print("\n===== 落盘结果 =====")
    for fn, c in touched.items():
        print(f"  {fn}: {c} 处")
    print(f"  合计 {sum(touched.values())} 处，{len(touched)} 个文件")
    return 0

sys.exit(main())
