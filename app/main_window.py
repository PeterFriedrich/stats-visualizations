from PyQt6.QtWidgets import QMainWindow, QLabel, QVBoxLayout, QWidget
from PyQt6.QtCore import Qt


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Stats Visualizations")
        self.setMinimumSize(800, 600)

        placeholder = QLabel("Stats Visualizations")
        placeholder.setAlignment(Qt.AlignmentFlag.AlignCenter)

        layout = QVBoxLayout()
        layout.addWidget(placeholder)

        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)
