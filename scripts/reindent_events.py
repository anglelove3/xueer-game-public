# -*- coding: utf-8 -*-
"""按 MZ 编辑器习惯重算事件指令缩进（仅影响编辑器显示，不影响运行）。"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from batch5_patch import load, save_map  # noqa: E402


def reindent(commands):
    stack = []
    indent = 0
    for cmd in commands:
        code = cmd["code"]
        if code == 111:  # if
            cmd["indent"] = indent
            stack.append(("if", indent))
            indent += 1
        elif code == 411:  # else
            if stack and stack[-1][0] == "if":
                cmd["indent"] = stack[-1][1]
                indent = cmd["indent"] + 1
            else:
                cmd["indent"] = indent
        elif code == 412:  # end if
            if stack and stack[-1][0] == "if":
                _, opener = stack.pop()
                cmd["indent"] = opener
                indent = opener
            else:
                cmd["indent"] = indent
        elif code == 102:  # choice
            cmd["indent"] = indent
            stack.append(("choice", indent))
        elif code == 402:  # when
            if stack and stack[-1][0] == "choice":
                opener = stack[-1][1]
                cmd["indent"] = opener
                indent = opener + 1
            else:
                cmd["indent"] = indent
        elif code == 404:  # end choice
            if stack and stack[-1][0] == "choice":
                _, opener = stack.pop()
                cmd["indent"] = opener
                indent = opener
            else:
                cmd["indent"] = indent
        else:
            cmd["indent"] = indent


MAPS = [1, 2, 3, 4, 5, 7, 13, 14, 18, 19, 20, 21, 30, 31, 32, 33, 36, 41]


def main():
    for mid in MAPS:
        m = load(f"Map{mid:03d}.json")
        for event in m["events"]:
            if not event:
                continue
            for page in event["pages"]:
                reindent(page["list"])
        save_map(mid, m)
    print("reindented maps:", ", ".join(str(x) for x in MAPS))


if __name__ == "__main__":
    main()
