import numpy as np
import pytest
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent / "output"
RNG_SEED = 42


def run_simulation(mu, sigma2, n, iters, seed=RNG_SEED):
    rng = np.random.default_rng(seed)
    sigma = np.sqrt(sigma2)
    population = rng.normal(mu, sigma, 100_000)

    biased = np.empty(iters)
    unbiased = np.empty(iters)

    for i in range(iters):
        sample = rng.choice(population, size=n, replace=True)
        deviations = sample - sample.mean()
        sq_sum = np.dot(deviations, deviations)
        biased[i] = sq_sum / n
        unbiased[i] = sq_sum / (n - 1)

    return biased, unbiased


# --- unit tests ---

def test_unbiased_converges_to_true_variance():
    _, unbiased = run_simulation(mu=0, sigma2=1.0, n=5, iters=5000)
    assert abs(unbiased.mean() - 1.0) < 0.05


def test_biased_underestimates():
    n = 5
    biased, _ = run_simulation(mu=0, sigma2=1.0, n=n, iters=5000)
    expected = 1.0 * (n - 1) / n
    assert abs(biased.mean() - expected) < 0.05


def test_bias_shrinks_with_larger_n():
    _, unbiased_small = run_simulation(mu=0, sigma2=1.0, n=3,  iters=3000)
    _, unbiased_large = run_simulation(mu=0, sigma2=1.0, n=50, iters=3000)
    bias_small = abs(unbiased_small.mean() - 1.0)
    bias_large = abs(unbiased_large.mean() - 1.0)
    assert bias_large < bias_small


def test_works_with_nondefault_parameters():
    _, unbiased = run_simulation(mu=5.0, sigma2=4.0, n=10, iters=3000)
    assert abs(unbiased.mean() - 4.0) < 0.2


# --- visual test (saves PNG for inspection) ---

def test_visual_output():
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    sigma2 = 1.0
    n = 5
    biased, unbiased = run_simulation(mu=0, sigma2=sigma2, n=n, iters=2000)

    fig, (ax_b, ax_u) = plt.subplots(1, 2, figsize=(10, 4), tight_layout=True)

    for ax, estimates, title in [
        (ax_b, biased,   f"Biased estimator (÷{n})"),
        (ax_u, unbiased, f"Unbiased estimator (÷{n-1})"),
    ]:
        ax.hist(estimates, bins=60, color="steelblue", alpha=0.7, density=True)
        ax.axvline(sigma2,          color="red",  linestyle="--", linewidth=1.5, label=f"True σ² = {sigma2}")
        ax.axvline(estimates.mean(), color="navy", linestyle="-",  linewidth=1.5, label=f"Mean = {estimates.mean():.3f}")
        ax.set_title(title)
        ax.set_xlabel("Variance estimate")
        ax.set_ylabel("Density")
        ax.legend(fontsize=8)

    out_path = OUTPUT_DIR / "bessel_correction.png"
    fig.savefig(out_path, dpi=120)
    plt.close(fig)

    assert out_path.exists()
    print(f"\nVisual output saved to: {out_path}")
