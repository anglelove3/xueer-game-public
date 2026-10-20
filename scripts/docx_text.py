# -*- coding: utf-8 -*-
import zipfile, re, sys, io, os
from xml.etree import ElementTree as ET
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
def docx_text(path):
    out=[]
    with zipfile.ZipFile(path) as z:
        xml = z.read('word/document.xml')
    root = ET.fromstring(xml)
    for p in root.iter(W+'p'):
        txt=''.join(t.text or '' for t in p.iter(W+'t'))
        # 图片计数
        imgs = len(list(p.iter()))
        if txt.strip():
            out.append(txt)
    return out
p = sys.argv[1]
lines = docx_text(p)
print(f"### {os.path.basename(p)}  段落数={len(lines)}")
for l in lines:
    print(l)
