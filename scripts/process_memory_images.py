# -*- coding: utf-8 -*-
"""批次5：处理回忆与尾声图片。

- 裁掉 AI 生成图底部水印区
- 居中裁切到目标比例
- 回忆图统一为黑白胶片影调（颗粒 + 暗角）
- 尾声图降饱和、提亮、轻微柔光
- Memory_7 叠加可读的处方文字
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "vibe_images"
OUT = ROOT / "工程" / "img" / "pictures"

WATERMARK_CROP = 56

MEMORIES = [
    ("memory1_well_grandmother*", "Memory_1.png"),
    ("memory2_red_cup*", "Memory_2.png"),
    ("memory3_hospital_corridor*", "Memory_3.png"),
    ("memory4_forest_dusk*", "Memory_4.png"),
    ("memory5_bus_window*", "Memory_5.png"),
    ("memory6_worker_badge*", "Memory_6.png"),
    ("memory7_prescription*", "Memory_7.png"),
    ("memory8_two_cups*", "Memory_8.png"),
    ("memory9_old_man_home*", "Memory_9.png"),
    ("memory10_woman_bar*", "Memory_10.png"),
    ("memory11_village_crossroads*", "Memory_11.png"),
    ("memory12_empty_room*", "Memory_12.png"),
]

FONT_SONG = "C:/Windows/Fonts/simsun.ttc"
FONT_KAI = "C:/Windows/Fonts/simkai.ttf"


def find_source(pattern: str) -> Path:
    matches = sorted(SRC.glob(pattern))
    if not matches:
        raise FileNotFoundError(pattern)
    return matches[-1]


def crop_to_ratio(im: Image.Image, ratio: float) -> Image.Image:
    w, h = im.size
    im = im.crop((0, 0, w, h - WATERMARK_CROP))
    cw, ch = im.size
    if cw / ch > ratio:
        nw = round(ch * ratio)
        left = (cw - nw) // 2
        im = im.crop((left, 0, left + nw, ch))
    else:
        nh = round(cw / ratio)
        top = (ch - nh) // 2
        im = im.crop((0, top, cw, top + nh))
    return im


def grain_and_vignette(im: Image.Image, seed: int, sigma: float, vignette: float) -> Image.Image:
    arr = np.asarray(im, dtype=np.float32)
    rng = np.random.default_rng(seed)
    arr += rng.normal(0.0, sigma, arr.shape)
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = (w - 1) / 2.0, (h - 1) / 2.0
    dist = np.sqrt(((xx - cx) / (w / 2.0)) ** 2 + ((yy - cy) / (h / 2.0)) ** 2) / np.sqrt(2.0)
    mask = 1.0 - vignette * dist ** 2
    if arr.ndim == 3:
        mask = mask[..., None]
    arr *= mask
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def draw_rotated_text(base: Image.Image, text: str, center, size: int,
                      font_path: str, angle: float = -11.6,
                      fill=(52, 52, 52, 215)) -> None:
    font = ImageFont.truetype(font_path, size)
    bbox = font.getbbox(text)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    layer = Image.new("RGBA", (tw + 10, th + 10), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.text((5 - bbox[0], 5 - bbox[1]), text, font=font, fill=fill)
    layer = layer.rotate(angle, expand=True, resample=Image.BICUBIC)
    x = int(center[0] - layer.width / 2)
    y = int(center[1] - layer.height / 2)
    base.alpha_composite(layer, (x, y))


def process_memory(idx: int, src: Path, dst: Path) -> None:
    im = Image.open(src).convert("RGB")
    im = crop_to_ratio(im, 4 / 3).resize((640, 480), Image.LANCZOS)
    im = ImageOps.grayscale(im)
    im = ImageEnhance.Contrast(im).enhance(1.07)
    im = ImageEnhance.Brightness(im).enhance(0.97)

    if idx == 7:
        im = im.convert("RGBA")
        draw_rotated_text(im, "处方笺", (345, 162), 13, FONT_SONG, fill=(70, 70, 70, 200))
        draw_rotated_text(im, "氟西汀", (278, 235), 20, FONT_SONG, fill=(45, 45, 45, 225))
        draw_rotated_text(im, "20mg", (350, 249), 13, FONT_SONG, fill=(60, 60, 60, 210))
        draw_rotated_text(im, "穆兰雪", (243, 392), 21, FONT_KAI, fill=(40, 40, 40, 230))
        im = im.convert("L")

    im = grain_and_vignette(im, seed=1000 + idx, sigma=5.2, vignette=0.24)
    im.save(dst, "PNG", optimize=True)


def process_epilogue(src: Path, dst: Path) -> None:
    im = Image.open(src).convert("RGB")
    im = crop_to_ratio(im, 816 / 624).resize((816, 624), Image.LANCZOS)
    im = ImageEnhance.Color(im).enhance(0.52)
    im = ImageEnhance.Brightness(im).enhance(1.05)
    im = ImageEnhance.Contrast(im).enhance(0.97)
    soft = im.filter(ImageFilter.GaussianBlur(7))
    im = Image.blend(im, soft, 0.16)
    arr = np.asarray(im, dtype=np.float32)
    rng = np.random.default_rng(2099)
    arr += rng.normal(0.0, 2.4, arr.shape)
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = (w - 1) / 2.0, (h - 1) / 2.0
    dist = np.sqrt(((xx - cx) / (w / 2.0)) ** 2 + ((yy - cy) / (h / 2.0)) ** 2) / np.sqrt(2.0)
    arr *= (1.0 - 0.05 * dist ** 2)[..., None]
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(dst, "PNG", optimize=True)


def contact_sheet(paths) -> None:
    cols, rows = 4, 4
    cell_w, cell_h = 320, 260
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (18, 18, 18))
    d = ImageDraw.Draw(sheet)
    try:
        label_font = ImageFont.truetype(FONT_SONG, 16)
    except OSError:
        label_font = ImageFont.load_default()
    for i, p in enumerate(paths):
        im = Image.open(p).convert("RGB")
        im.thumbnail((cell_w - 12, cell_h - 32), Image.LANCZOS)
        x = (i % cols) * cell_w + (cell_w - im.width) // 2
        y = (i // cols) * cell_h + 6
        sheet.paste(im, (x, y))
        d.text(((i % cols) * cell_w + 8, (i // cols) * cell_h + cell_h - 24),
               p.stem, fill=(220, 220, 220), font=label_font)
    sheet.save(SRC / "_contact_sheet.png")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    saved = []
    for i, (pattern, name) in enumerate(MEMORIES, start=1):
        dst = OUT / name
        process_memory(i, find_source(pattern), dst)
        saved.append(dst)
        print("memory", name, "->", Image.open(dst).size)
    epi = OUT / "尾声_醒来.png"
    process_epilogue(find_source("epilogue_waking_morning*"), epi)
    saved.append(epi)
    print("epilogue ->", Image.open(epi).size)
    contact_sheet(saved)


if __name__ == "__main__":
    main()
