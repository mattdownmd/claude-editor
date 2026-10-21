"""Find the baked-in macOS pointer in every frame of a screen recording.

Masked SSD against two templates, the arrow and the link hand: only the
pointer's own pixels (dark fill/outline plus the light pixels hugging them) are
compared, so the score does not depend on what the pointer sits on. Searched in
a window round the last hit, the whole frame when that fails.

    python3 scripts/track-cursor.py <clip> [t0 t1]

Prints one JSON line per frame: t, x, y (the hotspot), kind, e (rms error;
above 40 the frame is a miss — fast moves blur the pointer out).
"""
import sys, json, subprocess, numpy as np
from numpy.fft import rfft2, irfft2

W, H, FPS = 1920, 1080, 30
HERE = __file__.rsplit("/", 1)[0]
# (cropped pointer image, offset of its top-left from the hotspot, w, h)
TEMPLATES = {
    "arrow": (f"{HERE}/cursor-arrow.png", -3, -3, 16, 22),
    "hand": (f"{HERE}/cursor-hand.png", -8, -3, 22, 25),
}

def still(path, w, h):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w).astype(np.float64)

def build(path, dx, dy, w, h):
    T = still(path, w, h)
    dark = T < 90
    near = np.zeros_like(dark)
    for oy in (-1, 0, 1):
        for ox in (-1, 0, 1):
            near |= np.roll(np.roll(dark, oy, 0), ox, 1)
    M = (dark | (near & (T > 200))).astype(np.float64)
    return {"T": T, "M": M, "MT": M * T, "c": (M * T * T).sum(), "n": M.sum(), "dx": dx, "dy": dy}

tpls = {k: build(*v) for k, v in TEMPLATES.items()}

def corr(a, k):
    th, tw = k.shape
    sh = (a.shape[0] + th - 1, a.shape[1] + tw - 1)
    return irfft2(rfft2(a, s=sh) * rfft2(k[::-1, ::-1], s=sh), s=sh)[th - 1:a.shape[0], tw - 1:a.shape[1]]

def best(region, ox, oy):
    out = None
    r2 = region ** 2
    for kind, t in tpls.items():
        s = (corr(r2, t["M"]) - 2 * corr(region, t["MT"]) + t["c"]) / t["n"]
        k = np.unravel_index(np.argmin(s), s.shape)
        e = float(np.sqrt(max(s[k], 0)))
        if out is None or e < out[3]:
            out = (ox + k[1] - t["dx"], oy + k[0] - t["dy"], kind, e)
    return out

src = sys.argv[1]
cmd = ["ffmpeg", "-v", "error"]
t0 = 0.0
if len(sys.argv) > 3:
    t0 = float(sys.argv[2])
    cmd += ["-ss", sys.argv[2], "-i", src, "-t", str(float(sys.argv[3]) - t0)]
else:
    cmd += ["-i", src]
p = subprocess.Popen(cmd + ["-r", str(FPS), "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)
last, i = None, 0
while True:
    buf = p.stdout.read(W * H)
    if len(buf) < W * H:
        break
    f = np.frombuffer(buf, np.uint8).reshape(H, W).astype(np.float64)
    hit = None
    if last is not None:
        x0, y0 = max(0, last[0] - 200), max(0, last[1] - 200)
        hit = best(f[y0:min(H, last[1] + 200), x0:min(W, last[0] + 200)], x0, y0)
    if hit is None or hit[3] > 40:
        hit = best(f, 0, 0)
    if hit[3] <= 40:
        last = hit[:2]
    print(json.dumps({"t": round(t0 + i / FPS, 3), "x": int(hit[0]), "y": int(hit[1]), "kind": hit[2], "e": round(hit[3], 1)}), flush=True)
    i += 1
