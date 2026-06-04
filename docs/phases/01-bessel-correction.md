# Phase 01 — Bessel's Correction

## Spec

Demonstrate why dividing by n-1 instead of n gives an unbiased estimator of population variance.

### Population setup
- Distribution type: normal (fixed for now)
- True parameters: μ and σ² (user-configurable) — these are ground truth
- Large finite population (N = 100,000) to approximate infinite

### Simulation parameters
- Sample size n — small n makes bias more visible (default: n = 5)
- Number of iterations (default: 1,000)

### Per-iteration logic
1. Draw n observations from population with replacement
2. Compute sample mean x̄
3. Compute biased variance: Σ(xᵢ - x̄)² / n
4. Compute unbiased variance: Σ(xᵢ - x̄)² / (n-1)
5. Store both

### Aggregation
- Mean of all biased estimates → should converge to σ² × (n-1)/n
- Mean of all unbiased estimates → should converge to σ²
- Bias for each: mean estimate − true σ²

### Visualization output
- Two histograms: distribution of biased vs unbiased variance estimates
- Vertical reference line at true σ² (red dashed)
- Vertical line at mean of each estimator (blue solid)
- Summary bar showing bias for each estimator

### Interactivity
- Slider for n — watch gap shrink as n grows (since (n-1)/n → 1)
- Spinbox for number of iterations
- Spinboxes for μ and σ²

---

## Architecture

**File**: `app/widgets/bessel_correction.py` → `BesselCorrectionWidget`

### Layout
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

### Key methods
- `_build_controls()` — constructs top bar widgets
- `_build_canvas()` — sets up matplotlib figure with two subplots
- `_run()` — runs simulation, calls `_draw()`
- `_draw()` — clears and redraws both histograms
