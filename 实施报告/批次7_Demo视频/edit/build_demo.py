#!/usr/bin/env python3
# 批次7 Demo 成片构建脚本（临时工具，随批次归档）
import os, subprocess, sys, json

FF = os.environ.get("FFMPEG", "ffmpeg")  # 可用 FFMPEG 环境变量指定 ffmpeg 路径
BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
BATCH = os.path.join(BASE, "实施报告", "批次7_Demo视频")
RAW = os.path.join(BATCH, "raw")
EDIT = os.path.join(BATCH, "edit")
TMP = os.path.join(EDIT, "tmp")
A = os.path.join(EDIT, "assets")
PROJ = os.path.join(BASE, "工程")

os.makedirs(TMP, exist_ok=True)

def run(label, args):
    print(f"\n== {label} ==")
    p = subprocess.run([FF, "-hide_banner", "-y"] + args, capture_output=True,
                       text=True, encoding="utf-8", errors="replace")
    if p.returncode != 0:
        print("FAILED", label)
        print(p.stderr[-4000:])
        sys.exit(1)
    tail = p.stderr.strip().splitlines()[-2:]
    print("ok", " | ".join(tail))
    return p

def enc(name, cq=24, maxrate="7M"):
    return ["-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", str(cq),
            "-b:v", "0", "-maxrate", maxrate, "-bufsize", "14M",
            "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", "30", "-g", "60",
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
            "-movflags", "+faststart", name]

def pillarbox(label_idx, dur, fi, fo, border=True):
    b = ("drawbox=x=254:y=0:w=1412:h=1080:color=white@0.05:t=1" if border else "")
    base = (
        "[x]split=2[sv][bgv];"
        "[bgv]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
        "gblur=sigma=42,hue=s=0.55,colorlevels=rimax=0.72:gimax=0.72:bimax=0.72[bg];"
        "[sv]scale=1412:1080:flags=lanczos[fg];"
        "[bg][fg]overlay=254:0,overlay=0:0" + ("," + b if b else "") + "[base0];"
    )
    if label_idx is not None:
        base += f"[base0][{label_idx}:v]overlay=44:820[lab];"
    else:
        base += "[base0]null[lab];"
    base += f"[lab]fade=t=in:st=0:d={fi},fade=t=out:st={dur-fo}:d={fo},setsar=1,format=yuv420p[v]"
    return base

def game_segment(name, src, ss, dur, label, fi=0.3, fo=0.4, audio=True):
    fc = ("[0:v]fps=30,setpts=PTS-STARTPTS[x];" +
          pillarbox(2, dur, fi, fo))
    if audio:
        fc += (f";[0:a]asetpts=PTS-STARTPTS,atrim=0:{dur},aresample=48000,"
               f"afade=t=in:st=0:d=0.15,afade=t=out:st={dur-0.3}:d=0.3[a]")
    else:
        fc += f";[3:a]atrim=0:{dur},asetpts=PTS-STARTPTS[a]"
    args = ["-ss", str(ss), "-t", str(dur), "-i", src,
            "-i", os.path.join(A, "bar_scrim.png"),
            "-i", os.path.join(A, f"label_{label}.png")]
    if not audio:
        args += ["-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=48000:cl=stereo"]
    args += ["-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-t", str(dur)] + enc(os.path.join(TMP, name))
    run(name, args)

# ---- 01 title ----
dur = 7.0
fc = ("[0:v]scale=1632:1248:flags=lanczos,"
      "zoompan=z='min(1+0.00025*on,1.0525)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=816x624:fps=30,"
      f"trim=duration={dur},setpts=PTS-STARTPTS[x];" +
      pillarbox(None, dur, 0.7, 0.5) +
      f";[2:a]atrim=0:{dur},asetpts=PTS-STARTPTS[a]")
run("01_title", ["-loop", "1", "-framerate", "30", "-t", str(dur), "-i", os.path.join(A, "title_frame.png"),
                 "-i", os.path.join(A, "bar_scrim.png"),
                 "-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=48000:cl=stereo",
                 "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-t", str(dur)] + enc(os.path.join(TMP, "01_title.mp4")))

# ---- 02 sky ----
game_segment("02_sky.mp4", os.path.join(RAW, "sky.webm"), 0.4, 20.0, "sky", 0.3, 0.4)
# ---- 03 home ----
game_segment("03_home.mp4", os.path.join(RAW, "home.webm"), 0.2, 8.0, "home", 0.3, 0.3)

# ---- 04 slip (pre + flashback still + tail) ----
dur = 14.4
fc = (
    "[0:v]fps=30,setpts=PTS-STARTPTS[pre];"
    "[2:v]scale=1632:1248:flags=lanczos,"
    "zoompan=z='min(1+0.0004*on,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=816x624:fps=30,"
    "trim=duration=4.2,setpts=PTS-STARTPTS[still];"
    "[1:v]fps=30,setpts=PTS-STARTPTS[tail];"
    "[pre][still]xfade=transition=fade:duration=0.6:offset=5.5[ps];"
    "[ps][tail]concat=n=2:v=1:a=0[x];" +
    pillarbox(4, dur, 0.3, 0.3) +
    ";[0:a]asetpts=PTS-STARTPTS,atrim=0:5.5,aresample=48000,afade=t=out:st=5.35:d=0.15[ap];"
    "[5:a]atrim=0:1.51,asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,"
    "volume=0.28,afade=t=out:st=1.0:d=0.51,apad=whole_dur=4.2[as];"
    "[1:a]asetpts=PTS-STARTPTS,atrim=0:4.7,aresample=48000,"
    "afade=t=in:st=0:d=0.15,afade=t=out:st=4.4:d=0.3[at];"
    "[ap][as][at]concat=n=3:v=0:a=1[a]"
)
run("04_slip", ["-ss", "0.4", "-t", "6.1", "-i", os.path.join(RAW, "slip.webm"),
                "-ss", "6.1", "-t", "4.7", "-i", os.path.join(RAW, "slip_tail.webm"),
                "-loop", "1", "-framerate", "30", "-t", "4.2", "-i", os.path.join(A, "slip_flash_clean.png"),
                "-i", os.path.join(A, "bar_scrim.png"),
                "-i", os.path.join(A, "label_slip.png"),
                "-i", os.path.join(PROJ, "audio/se/Darkness2.ogg"),
                "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-t", str(dur),
                ] + enc(os.path.join(TMP, "04_slip.mp4")))

# ---- 05 truth ----
game_segment("05_truth.mp4", os.path.join(RAW, "truth.webm"), 0.6, 26.7, "truth", 0.3, 0.4)
# ---- 06 door ----
game_segment("06_door.mp4", os.path.join(RAW, "door.webm"), 0.7, 8.6, "door", 0.3, 0.4)
# ---- 07 epilogue ----
game_segment("07_epilogue.mp4", os.path.join(RAW, "epilogue.webm"), 0.0, 26.0, "epilogue", 0.5, 0.6)

# ---- 08 end card ----
dur = 8.0
run("08_end", ["-loop", "1", "-framerate", "30", "-t", str(dur), "-i", os.path.join(A, "end_card.png"),
               "-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=48000:cl=stereo",
               "-filter_complex",
               f"[0:v]fade=t=in:st=0:d=0.8,fade=t=out:st={dur-1.0}:d=1.0,setsar=1,format=yuv420p[v]",
               "-map", "[v]", "-map", "1:a", "-t", str(dur)] + enc(os.path.join(TMP, "08_end.mp4")))

# ---- concat ----
names = ["01_title.mp4","02_sky.mp4","03_home.mp4","04_slip.mp4","05_truth.mp4","06_door.mp4","07_epilogue.mp4","08_end.mp4"]
with open(os.path.join(TMP, "concat.txt"), "w", encoding="utf-8") as f:
    for n in names:
        f.write("file '%s'\n" % os.path.join(TMP, n).replace("\\", "/"))
run("concat", ["-f", "concat", "-safe", "0", "-i", os.path.join(TMP, "concat.txt"),
               "-c", "copy", "-movflags", "+faststart", os.path.join(TMP, "master.mp4")])

print("SEGMENTS DONE")
