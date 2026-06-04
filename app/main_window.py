from PyQt6.QtWidgets import QMainWindow
from app.widgets.bessel_correction import BesselCorrectionWidget


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Stats Visualizations")
        self.setMinimumSize(1000, 650)
        self.setCentralWidget(BesselCorrectionWidget())
