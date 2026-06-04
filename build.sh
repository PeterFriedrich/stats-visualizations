#!/bin/bash
set -e

source .venv/bin/activate

pyinstaller \
  --onefile \
  --windowed \
  --name stats-visualizations \
  --hidden-import matplotlib.backends.backend_qtagg \
  main.py

echo "Build complete: dist/stats-visualizations"
