from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/upload/logoHOBEE.jpg")
TARGET = Path("/home/ubuntu/hobee-mobile/assets/images/hobee-official-mark.png")


def main() -> None:
    source = Image.open(SOURCE).convert("RGB")
    # Preserve the official honeycomb mark and droplet; the source background remains
    # intentionally dark to blend with the compact Travel header mark container.
    mark = source.crop((65, 230, 635, 800)).resize((512, 512), Image.Resampling.LANCZOS)
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    mark.save(TARGET, "PNG", optimize=True)


if __name__ == "__main__":
    main()
