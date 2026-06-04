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

## Structure
```
main.py              # entry point
app/
  main_window.py     # top-level QMainWindow
  widgets/           # individual visualization widgets (add here)
```

## Adding a visualization
1. Create a new file in `app/widgets/`, subclassing `QWidget`
2. Embed a matplotlib figure using `FigureCanvasQTAgg`
3. Add it to `MainWindow` (tab, sidebar item, etc.)

## Notes
- PyQt desktop UI is intentionally separate from any future web/deployable frontend
- Keep each visualization self-contained in its own widget file
