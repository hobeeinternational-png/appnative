from pathlib import Path

from PIL import Image


ASSET_DIR = Path(__file__).resolve().parent.parent / "assets" / "images"
TARGETS = (
    "icon.png",
    "splash-icon.png",
    "favicon.png",
    "android-icon-foreground.png",
)


def optimize_png(path: Path) -> None:
    with Image.open(path) as image:
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        image.save(path, format="PNG", optimize=True, compress_level=9)


for filename in TARGETS:
    optimize_png(ASSET_DIR / filename)
