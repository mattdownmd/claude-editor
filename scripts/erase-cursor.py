"""Paint the recorded pointer out of a screen recording, so a drawn one can
replace it without a second pointer peeking out from underneath.

    python3 scripts/erase-cursor.py <in.mp4> <track.json> <out.mp4>

track.json is [[x, y, kind], ...] per frame (hotspot, "arrow" | "hand" |
null for none). The pointer's box is refilled row by row from the pixels just
left and right of it — crude, but the drawn pointer sits on top of it, and on
the flat UI chrome a pointer usually rests on it is invisible anyway.
"""
import sys, json, subprocess, numpy as np

W, H = 1920, 1080
src, track_path, out = sys.argv[1:4]
track = json.load(open(track_path))
# Pointer bounds round the hotspot (left, top, right, bottom), padded for the drop shadow.
BOX = {"arrow": (-3, -3, 15, 24), "hand": (-10, -3, 15, 25)}

rd = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
wr = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
     "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", out],
    stdin=subprocess.PIPE,
)
i = 0
while True:
    buf = rd.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
    if i < len(track) and track[i][2]:
        x, y, kind = track[i]
        l, t, r, b = BOX[kind]
        x0, x1 = max(1, x + l), min(W - 2, x + r)
        y0, y1 = max(0, y + t), min(H - 1, y + b)
        left = f[y0:y1, x0 - 1].astype(np.float32)
        right = f[y0:y1, x1 + 1].astype(np.float32)
        w = np.linspace(0, 1, x1 - x0)[None, :, None]
        f[y0:y1, x0:x1] = (left[:, None] * (1 - w) + right[:, None] * w).astype(np.uint8)
    wr.stdin.write(f.tobytes())
    i += 1
wr.stdin.close()
wr.wait()
