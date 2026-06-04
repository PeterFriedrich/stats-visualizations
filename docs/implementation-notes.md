# Implementation Notes

<!-- Running log of non-obvious decisions, gotchas, and patterns discovered during coding. -->
<!-- Format: date, what, why. -->

## Setup
- venv at `.venv/`, not committed
- Run with `python main.py` from project root

## PyInstaller build
- `--hidden-import matplotlib.backends.backend_qtagg` required — PyInstaller misses it otherwise
- `libxcb-cursor0` must be installed on the host or the binary won't launch (not bundleable)
- Binary is ~100MB due to Qt + matplotlib + numpy being large
