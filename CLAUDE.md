# Stats Visualizations

Desktop app for interactive stats visualizations, built with PyQt6. Intended for STATS 151 tutoring.

## Stack
- **GUI**: PyQt6 (native desktop window)
- **Plotting**: matplotlib (embedded in Qt via `FigureCanvasQTAgg`)
- **Data**: numpy, pandas

## Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Running
```bash
python main.py
```

## Docs pipeline
New features follow this order:
1. **`docs/spec.md`** — what to build and why
2. **`docs/architecture.md`** — how it fits into the structure
3. Code — implement per the architecture
4. **`docs/implementation-notes.md`** — log any non-obvious decisions

## Structure
```
main.py              # entry point
app/
  main_window.py     # top-level QMainWindow
  widgets/           # one file per visualization widget
docs/
  spec.md            # requirements and feature list
  architecture.md    # design and widget pattern
  implementation-notes.md  # gotchas and decisions log
```

## Adding a visualization
1. Add it to `docs/spec.md`
2. Note any structural changes in `docs/architecture.md`
3. Create `app/widgets/<name>.py`, subclassing `QWidget`
4. Embed matplotlib via `FigureCanvasQTAgg`
5. Register it in `MainWindow`
