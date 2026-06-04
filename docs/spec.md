# Spec

## Purpose
Desktop app for interactive stats visualizations, used for STATS 151 tutoring.

## Users
- Instructor / tutor (Peter) running visualizations during sessions

## Visualizations

### 1. Bessel's Correction
Demonstrate why dividing by n-1 instead of n gives an unbiased estimator of population variance.

#### Population setup
- Distribution type: normal (fixed for now)
- True parameters: μ and σ² (user-configurable) — these are ground truth
- Large finite population (N = 100,000) to approximate infinite

#### Simulation parameters
- Sample size n — small n makes bias more visible (default: n = 5)
- Number of iterations (default: 1,000)

#### Per-iteration logic
For each iteration:
1. Draw n observations from population with replacement
2. Compute sample mean x̄
3. Compute biased variance: Σ(xᵢ - x̄)² / n
4. Compute unbiased variance: Σ(xᵢ - x̄)² / (n-1)
5. Store both

#### Aggregation
- Mean of all biased estimates → should converge to σ² × (n-1)/n
- Mean of all unbiased estimates → should converge to σ²
- Bias for each: mean estimate − true σ²

#### Visualization output
- Two histograms: distribution of biased vs unbiased variance estimates
- Vertical reference line at true σ²
- Vertical line at mean of each estimator
- Label showing bias for each

#### Interactivity
- Slider or input for n — watch gap shrink as n grows (since (n-1)/n → 1)
- Slider or input for number of iterations
- Inputs for μ and σ²

## Out of scope (for now)
- Web/deployable frontend (separate concern for later)
- Other distribution types
