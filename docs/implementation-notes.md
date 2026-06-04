# Implementation Notes

<!-- Running log of non-obvious decisions, gotchas, and patterns discovered during coding. -->
<!-- Format: date, what, why. -->

## Setup
- venv at `.venv/`, not committed
- Always run via `.venv/bin/python`, not system `python` — system Python doesn't have PyQt6
- System deps required: `sudo apt-get install -y libxcb-cursor0`
- For headless/CI rendering: `sudo apt-get install -y xvfb x11-apps imagemagick`

## Running the app

```bash
source .venv/bin/activate
python main.py
```

## PyInstaller build
- `--hidden-import matplotlib.backends.backend_qtagg` required — PyInstaller misses it otherwise
- `libxcb-cursor0` must be installed on the host or the binary won't launch (not bundleable)
- Binary is ~100MB due to Qt + matplotlib + numpy being large

## Headless verification (CI / no display)

`scrot` does not reliably capture PyQt6 windows under xvfb. Use `xwd` + `convert` instead.

The correct pattern — wrap everything in one `xvfb-run` call so DISPLAY is consistent:

```bash
xvfb-run -s "-screen 0 1280x1024x24" bash -c "
  QT_QPA_PLATFORM=xcb .venv/bin/python main.py &
  APP_PID=\$!
  sleep 6
  xwd -root -silent -display \$DISPLAY > /tmp/out.xwd
  kill \$APP_PID
"
convert /tmp/out.xwd /tmp/screenshot.png
```

Key gotchas:
- Must set `QT_QPA_PLATFORM=xcb` — without it PyQt6 may fail to find a platform plugin under xvfb
- `scrot` captures a black screen; `xwd -root` works correctly
- Starting Xvfb manually and then running the app separately risks DISPLAY mismatch — use `xvfb-run` to avoid this
- Stale `/tmp/.X*-lock` files from a crashed Xvfb will block new instances; remove them first

## Programmatic simulation verification

To verify plots render correctly without needing a full window interaction:

```python
from PyQt6.QtWidgets import QApplication
from app.widgets.bessel_correction import BesselCorrectionWidget
import sys

app = QApplication(sys.argv)
w = BesselCorrectionWidget()
w._run()
w.fig.savefig("output.png", dpi=100, bbox_inches="tight")
```

Run this under `xvfb-run` as above. Confirmed output (n=5, σ²=1.0, 1000 iterations):
- Biased estimator mean ≈ 0.82 (≈ σ²·(n−1)/n = 0.8) — visibly left of true σ²
- Unbiased estimator mean ≈ 1.02 — sitting on true σ²
