import sys
from pathlib import Path
from PIL import Image


def is_animated(image_path: Path) -> bool:
    try:
        with Image.open(image_path) as img:
            img.seek(1)
            return True
    except EOFError:
        return False


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python script.py <image_path>")
        return

    image_path = Path(sys.argv[1])

    if not image_path.exists():
        print(f"Image file not found: {image_path.resolve()}")
        return

    if is_animated(image_path):
        print(f"{image_path.name} → Dynamic image")
    else:
        print(f"{image_path.name} → Static image")


if __name__ == "__main__":
    main()