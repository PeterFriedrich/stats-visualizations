import numpy as np
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QSlider, QSpinBox, QDoubleSpinBox, QSizePolicy
)
from PyQt6.QtCore import Qt
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg
from matplotlib.figure import Figure


class BesselCorrectionWidget(QWidget):
    def __init__(self):
        super().__init__()
        self._build_controls()
        self._build_canvas()
        self._build_summary()

        layout = QVBoxLayout()
        layout.addLayout(self._controls_layout)
        layout.addWidget(self.canvas)
        layout.addWidget(self.summary_label)
        self.setLayout(layout)

    def _build_controls(self):
        self._controls_layout = QHBoxLayout()

        self.mu_input = QDoubleSpinBox()
        self.mu_input.setRange(-100, 100)
        self.mu_input.setValue(0.0)
        self.mu_input.setSingleStep(0.5)

        self.sigma2_input = QDoubleSpinBox()
        self.sigma2_input.setRange(0.01, 1000)
        self.sigma2_input.setValue(1.0)
        self.sigma2_input.setSingleStep(0.5)

        self.n_slider = QSlider(Qt.Orientation.Horizontal)
        self.n_slider.setRange(2, 100)
        self.n_slider.setValue(5)
        self.n_slider.setFixedWidth(150)
        self.n_label = QLabel("n = 5")
        self.n_slider.valueChanged.connect(lambda v: self.n_label.setText(f"n = {v}"))

        self.iters_input = QSpinBox()
        self.iters_input.setRange(100, 50000)
        self.iters_input.setValue(1000)
        self.iters_input.setSingleStep(500)

        run_btn = QPushButton("Run Simulation")
        run_btn.clicked.connect(self._run)

        for label, widget in [
            ("μ", self.mu_input),
            ("σ²", self.sigma2_input),
            ("n:", self.n_slider),
            ("", self.n_label),
            ("iterations", self.iters_input),
        ]:
            if label:
                self._controls_layout.addWidget(QLabel(label))
            self._controls_layout.addWidget(widget)

        self._controls_layout.addStretch()
        self._controls_layout.addWidget(run_btn)

    def _build_canvas(self):
        self.fig = Figure(figsize=(10, 4), tight_layout=True)
        self.ax_biased, self.ax_unbiased = self.fig.subplots(1, 2)
        self.canvas = FigureCanvasQTAgg(self.fig)
        self.canvas.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

    def _build_summary(self):
        self.summary_label = QLabel("")
        self.summary_label.setAlignment(Qt.AlignmentFlag.AlignCenter)

    def _run(self):
        mu = self.mu_input.value()
        sigma2 = self.sigma2_input.value()
        n = self.n_slider.value()
        iters = self.iters_input.value()

        sigma = np.sqrt(sigma2)
        population = np.random.normal(mu, sigma, 100_000)

        biased = np.empty(iters)
        unbiased = np.empty(iters)

        for i in range(iters):
            sample = np.random.choice(population, size=n, replace=True)
            deviations = sample - sample.mean()
            sq_sum = np.dot(deviations, deviations)
            biased[i] = sq_sum / n
            unbiased[i] = sq_sum / (n - 1)

        mean_biased = biased.mean()
        mean_unbiased = unbiased.mean()
        bias_biased = mean_biased - sigma2
        bias_unbiased = mean_unbiased - sigma2

        self._draw(biased, unbiased, sigma2, mean_biased, mean_unbiased, n)

        self.summary_label.setText(
            f"Biased estimator mean = {mean_biased:.4f}  (bias = {bias_biased:+.4f})    |    "
            f"Unbiased estimator mean = {mean_unbiased:.4f}  (bias = {bias_unbiased:+.4f})    |    "
            f"True σ² = {sigma2:.4f}    |    "
            f"Expected biased mean = σ²·(n−1)/n = {sigma2 * (n - 1) / n:.4f}"
        )

    def _draw(self, biased, unbiased, sigma2, mean_biased, mean_unbiased, n):
        for ax in (self.ax_biased, self.ax_unbiased):
            ax.clear()

        for ax, estimates, mean_est, title in [
            (self.ax_biased,   biased,   mean_biased,   f"Biased estimator (÷{n})"),
            (self.ax_unbiased, unbiased, mean_unbiased, f"Unbiased estimator (÷{n-1})"),
        ]:
            ax.hist(estimates, bins=60, color="steelblue", alpha=0.7, density=True)
            ax.axvline(sigma2,    color="red",  linestyle="--", linewidth=1.5, label=f"True σ² = {sigma2:.3f}")
            ax.axvline(mean_est,  color="navy", linestyle="-",  linewidth=1.5, label=f"Estimator mean = {mean_est:.3f}")
            ax.set_title(title)
            ax.set_xlabel("Variance estimate")
            ax.set_ylabel("Density")
            ax.legend(fontsize=8)

        self.canvas.draw()
