"""Find where a recording is silent, so cuts can go in the gaps.

    python3 scripts/gaps.py <recording> [--floor -45] [--gap 0.25]

Measures a 10 ms RMS of the audio and prints one line per spoken phrase
(start, end, length) with the pause that follows it. Cut in those pauses, never
inside a phrase: a transcript's word times can run 0.3-0.5 s late, but the
sound level does not lie. Needs ffmpeg and numpy.
"""
import subprocess, sys
import numpy as np

args = sys.argv[1:]
if not args or args[0].startswith("-"):
    sys.exit(__doc__)
src = args[0]
opt = lambda k, d: float(args[args.index(k) + 1]) if k in args else d
FLOOR, GAP = opt("--floor", -45.0), opt("--gap", 0.25)

SR, WIN = 16000, 160  # 10 ms windows
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", src, "-vn", "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
    capture_output=True, check=True,
).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768
n = len(x) // WIN
db = 20 * np.log10(np.sqrt((x[: n * WIN].reshape(n, WIN) ** 2).mean(axis=1)) + 1e-9)
voiced = db > FLOOR

phrases, i = [], 0
while i < n:
    if not voiced[i]:
        i += 1
        continue
    j = i
    quiet = 0
    while j < n and quiet * 0.01 < GAP:
        quiet = 0 if voiced[j] else quiet + 1
        j += 1
    end = j - quiet
    phrases.append((i * 0.01, end * 0.01))
    i = j

print(f"{len(phrases)} phrases, speech above {FLOOR:.0f} dB, gaps of {GAP:.2f}s or more")
for k, (a, b) in enumerate(phrases):
    nxt = phrases[k + 1][0] - b if k + 1 < len(phrases) else 0
    print(f"{k:3d}  {a:8.2f} - {b:8.2f}  ({b - a:5.2f}s)   pause after {nxt:5.2f}s")
