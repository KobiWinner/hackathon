import logging
import sys


def setup_logging() -> logging.Logger:
    """Basit logging kurulumu."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    return logging.getLogger("mocker")


logger = logging.getLogger("mocker")
