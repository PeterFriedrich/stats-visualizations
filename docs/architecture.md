# Architecture

## Stack
- **GUI**: PyQt6
- **Plotting**: matplotlib (`FigureCanvasQTAgg` embedded in Qt)
- **Data**: numpy, pandas

## Structure
```
main.py                        # entry point, boots QApplication
app/
  main_window.py               # top-level QMainWindow, navigation/layout
  widgets/                     # one file per visualization widget
    bessel_correction.py       # Bessel's correction demo
```

## Widget pattern
Each visualization lives in its own file under `app/widgets/`. It:
- Subclasses `QWidget`
- Owns its matplotlib figure and canvas
- Exposes controls (sliders, spinboxes) internally
- Runs simulation logic internally (no shared state)

## BesselCorrectionWidget layout
```
┌─────────────────────────────────────────────────┐
│  Controls (top bar)                             │
│  μ: [____]  σ²: [____]  n: [slider]  iters: [__]│
│  [ Run Simulation ]                             │
├─────────────────────────────────────────────────┤
│  Plot area                                      │
│  ┌──────────────────┬──────────────────────┐   │
│  │  Biased (÷n)     │  Unbiased (÷n-1)     │   │
│  │  hist + lines    │  hist + lines        │   │
│  └──────────────────┴──────────────────────┘   │
│  Bias summary text below                        │
└─────────────────────────────────────────────────┘
```

Lines on each histogram:
- True σ² (red dashed)
- Mean of estimator (blue solid)

## Navigation
- Single visualization for now; `MainWindow` loads `BesselCorrectionWidget` directly
- Will add tabs/sidebar once there are 2+ visualizations

## Future
- UI layer (PyQt) stays separate so a web frontend can be swapped in later
