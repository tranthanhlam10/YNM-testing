from pathlib import Path

import cv2
import numpy as np


def bytes_to_ndarray(image_bytes: bytes) -> np.ndarray:
    """Convert image bytes to a numpy array."""
    image_array = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(image_array, cv2.IMREAD_COLOR)


def main() -> None:
    image_name = "TestData/oABfAUly3FW69EyFQpEDtFfKQcIpgg1dBcWKLR~tplv-tiktokx-360p.webp"
    image_path = Path(image_name)

    if not image_path.exists():
        print(f"Image file not found: {image_path.resolve()}")
        return

    image_bytes = image_path.read_bytes()
    img = bytes_to_ndarray(image_bytes)
    if img is None:
        print("This is dynamic image")
        return

    print("This is static image")


if __name__ == "__main__":
    main()