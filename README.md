# Stats Visualizations

Interactive desktop app for stats visualizations built with PyQt6. Used for STATS 151 tutoring.

## Setup

```bash
# System dependencies (Ubuntu/Debian)
sudo apt-get install -y libxcb-cursor0

# Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python main.py
```

## Build standalone binary

```bash
bash build.sh
# output: dist/stats-visualizations
```

## Docs

- [`docs/spec.md`](docs/spec.md) — what to build
- [`docs/architecture.md`](docs/architecture.md) — design and structure
- [`docs/implementation-notes.md`](docs/implementation-notes.md) — gotchas and decisions
