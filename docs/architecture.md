# Architecture

## Stack
- **GUI**: PyQt6
- **Plotting**: matplotlib (`FigureCanvasQTAgg` embedded in Qt)
- **Data**: numpy, pandas

## Structure
```
main.py                  # entry point, boots QApplication
app/
  main_window.py         # top-level QMainWindow, navigation/layout
  widgets/               # one file per visualization widget
    <name>.py            # subclass QWidget, self-contained
```

## Widget pattern
Each visualization lives in its own file under `app/widgets/`. It:
- Subclasses `QWidget`
- Owns its matplotlib figure and canvas
- Exposes controls (sliders, dropdowns) internally

## Navigation
<!-- How are visualizations surfaced? Tabs, sidebar, dropdown? TBD. -->
- TBD — decide once we have 2+ visualizations

## Future
- UI layer (PyQt) stays separate so a web frontend can be swapped in later
