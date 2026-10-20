# -*- coding: utf-8 -*-
"""工程路径基准（公开版）。

历史脚本原本写死了开发机的 F: 盘路径。公开仓库统一改为相对本文件解析，
这样 clone 到任意目录都能直接运行：`python scripts/<script>.py`。
"""
import os

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPTS_DIR)
PROJECT_ROOT = os.path.join(REPO_ROOT, "工程")
DATA = os.path.join(PROJECT_ROOT, "data")
DESIGN_DOC_DIR = os.path.join(REPO_ROOT, "设计文档_完善版")
