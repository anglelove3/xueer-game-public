# -*- coding: utf-8 -*-
"""批次5：生成自定义标题画面与中文标题按钮。

输出：
- 工程/img/titles1/Title_Main.png   （816x624，全屏标题背景）
- 工程/img/titles2/Command_0..2.png  （60px 高，上帧选中 / 下帧未选中）
- 工程/img/titles2/Cursor.png        （暖白光标点）
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "vibe_images"
OUT_T1 = ROOT / "工程" / "img" / "titles1"
OUT_T2 = ROOT / "工程" / "img" / "titles2"

FONT_KAI = "C:/Windows/Fonts/simkai.ttf"
FONT_SONG = "C:/Windows/Fonts/simsun.ttc"

CREAM = (240, 234, 222)
MUTED = (188, 182, 170)


def source_image() -> Image.Image:
    matches = sorted(SRC.glob("title_dawn_window*"))
    if not matches:
        raise FileNotFoundError("title_dawn_window")
    return Image.open(matches[-1]).convert("RGB")


def crop_ratio(im: Image.Image, ratio: float, cut_bottom: int = 56) -> Image.Image:
    w, h = im.size
    im = im.crop((0, 0, w, h - cut_bottom))
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


def spaced_text(draw: ImageDraw.ImageDraw, xy, text: str, font: ImageFont.FreeTypeFont,
                tracking: int, fill, shadow=(0, 0, 0, 150)) -> None:
    x, y = xy
    for ch in text:
        draw.text((x + 1, y + 2), ch, font=font, fill=shadow)
        draw.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + tracking


def text_width_spaced(text: str, font: ImageFont.FreeTypeFont, tracking: int) -> int:
    return int(sum(font.getlength(ch) for ch in text) + tracking * (len(text) - 1))


def soft_glow_text(layer: Image.Image, xy, text, font, fill, glow) -> None:
    x, y = xy
    glow_layer = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.text((x, y), text, font=font, fill=glow)
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(4))
    layer.alpha_composite(glow_layer)
    ImageDraw.Draw(layer).text((x, y), text, font=font, fill=fill)


def build_background() -> None:
    im = source_image()
    im = crop_ratio(im, 816 / 624).resize((816, 624), Image.LANCZOS)
    im = Image.blend(im, im.convert("L").convert("RGB"), 0.55)
    arr = np.asarray(im, dtype=np.float32)

    h, w = arr.shape[:2]
    x = np.arange(w, dtype=np.float32)
    y = np.arange(h, dtype=np.float32)
    left = np.clip((365 - x) / 365.0, 0, 1) ** 1.35 * 0.66
    bottom = np.clip((y - 430) / (h - 430), 0, 1) ** 1.4 * 0.35
    alpha = 1.0 - (1.0 - left)[None, :] * (1.0 - bottom)[:, None]
    arr *= (1.0 - alpha)[..., None]

    rng = np.random.default_rng(507)
    arr += rng.normal(0, 2.6, arr.shape)
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert("RGBA")

    line_font = ImageFont.truetype(FONT_KAI, 22)
    big_font = ImageFont.truetype(FONT_KAI, 76)
    small_font = ImageFont.truetype(FONT_SONG, 12)
    tag_font = ImageFont.truetype(FONT_SONG, 14)

    spaced_text(ImageDraw.Draw(im), (66, 94), "一位抑郁症患者的", line_font, 5,
                (216, 210, 198, 225))
    spaced_text(ImageDraw.Draw(im), (62, 124), "独白", big_font, 12,
                (243, 238, 228, 250))

    d = ImageDraw.Draw(im)
    d.line([(66, 240), (150, 240)], fill=(196, 188, 172, 130), width=1)
    spaced_text(d, (66, 252), "A MONOLOGUE", small_font, 4, (188, 182, 170, 190))
    spaced_text(d, (66, 280), "有些话，说不出口。", tag_font, 1, (172, 166, 156, 200))

    im.convert("RGB").save(OUT_T1 / "Title_Main.png", "PNG", optimize=True)


def draw_tracked_text(layer: Image.Image, xy, text: str,
                      font: ImageFont.FreeTypeFont, fill, tracking: int) -> int:
    """从左往右逐字绘制，返回文本右边缘的 x。"""
    d = ImageDraw.Draw(layer)
    x, y = xy
    for ch in text:
        d.text((x + 1, y + 1), ch, font=font, fill=(0, 0, 0, 150))
        d.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + tracking
    return int(x - tracking)


def build_commands() -> None:
    labels = ["重新开始", "继续游戏", "选项"]
    font = ImageFont.truetype(FONT_SONG, 21)
    tracking = 3
    frame_w, frame_h = 168, 28
    for i, label in enumerate(labels):
        top = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
        glow_layer = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow_layer)
        gx = 10
        for ch in label:
            gd.text((gx, 2), ch, font=font, fill=(238, 229, 211, 110))
            gx += font.getlength(ch) + tracking
        glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(3))
        top.alpha_composite(glow_layer)
        right = draw_tracked_text(top, (10, 2), label, font,
                                  (246, 240, 228, 255), tracking)
        ImageDraw.Draw(top).line([(10, 25), (right, 25)],
                                 fill=(212, 203, 186, 150), width=1)

        bottom = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
        draw_tracked_text(bottom, (10, 2), label, font,
                          (168, 163, 153, 228), tracking)

        canvas = Image.new("RGBA", (frame_w, frame_h * 2), (0, 0, 0, 0))
        canvas.alpha_composite(top, (0, 0))
        canvas.alpha_composite(bottom, (0, frame_h))
        canvas.save(OUT_T2 / f"Command_{i}.png", "PNG", optimize=True)


def build_cursor() -> None:
    size = 18
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    d.ellipse((2, 2, 16, 16), fill=(235, 228, 212, 45))
    canvas = canvas.filter(ImageFilter.GaussianBlur(2))
    d = ImageDraw.Draw(canvas)
    d.ellipse((7, 7, 11, 11), fill=(244, 238, 226, 235))
    canvas.save(OUT_T2 / "Cursor.png", "PNG", optimize=True)


def main() -> None:
    import sys
    OUT_T1.mkdir(parents=True, exist_ok=True)
    OUT_T2.mkdir(parents=True, exist_ok=True)
    if "--menu-only" not in sys.argv:
        build_background()
    build_commands()
    build_cursor()
    print("title assets done", Image.open(OUT_T1 / "Title_Main.png").size)


if __name__ == "__main__":
    main()
