from pathlib import Path
from io import BytesIO

from PIL import Image, ImageOps
from rembg import new_session, remove

ASSETS = Path("public/assets")
TEAM = ASSETS / "brutti-team"
OUTPUT = ASSETS / "brutti-team-composite.webp"

# Reuse one lightweight background-removal session for every team cut-out.
SESSION = new_session("u2netp")


def cutout(filename: str, max_side: int = 1150) -> Image.Image:
    image = Image.open(TEAM / filename)
    image = ImageOps.exif_transpose(image).convert("RGBA")
    image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)

    result = remove(image, session=SESSION)
    if not isinstance(result, Image.Image):
        result = Image.open(BytesIO(result))
    result = result.convert("RGBA")

    # Keep fine hair, fabric edges, tools and bicycle spokes while removing
    # only the nearly invisible fringe left by the background-removal model.
    alpha = result.getchannel("A").point(
        lambda value: 0 if value < 7 else (255 if value > 250 else value)
    )
    result.putalpha(alpha)

    bbox = alpha.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        pad = 12
        result = result.crop(
            (
                max(0, left - pad),
                max(0, top - pad),
                min(result.width, right + pad),
                min(result.height, bottom + pad),
            )
        )
    return result


def resize_height(image: Image.Image, height: int) -> Image.Image:
    ratio = height / max(1, image.height)
    width = max(1, round(image.width * ratio))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def place(canvas: Image.Image, image: Image.Image, center_x: int, bottom: int, height: int) -> None:
    image = resize_height(image, height)
    x = round(center_x - image.width / 2)
    y = round(bottom - image.height)

    src_left = max(0, -x)
    src_top = max(0, -y)
    src_right = min(image.width, canvas.width - x)
    src_bottom = min(image.height, canvas.height - y)

    if src_right <= src_left or src_bottom <= src_top:
        return

    clipped = image.crop((src_left, src_top, src_right, src_bottom))
    canvas.alpha_composite(clipped, (max(0, x), max(0, y)))


# Version 2 reference layout:
# - laptop woman anchors the upper-left
# - blue-tool man sits just to her right and slightly higher
# - phone/board woman bridges into the centre
# - bicycle pair remains the main focal point
# - drill woman + standing woman balance the upper-right
# - book woman overlaps the right foreground
# - four men form a clean, tight foreground row
canvas = Image.new("RGBA", (1400, 1010), (0, 0, 0, 0))

# Back / upper layer. These are deliberately staggered rather than laid out
# as a straight row, matching the compact editorial silhouette of Version 2.
back_layer = [
    ("DSCF8135(1).webp", 185, 505, 455),   # laptop, upper-left
    ("DSCF8148(1).webp", 360, 430, 430),   # blue tool, raised behind left foreground
    ("DSCF8091(1).webp", 575, 455, 445),   # phone / board, upper-middle
    ("DSCF8078(1).webp", 920, 500, 475),   # drill, upper-right of focal pair
    ("WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp", 1180, 555, 500),
]

for filename, center_x, bottom, height in back_layer:
    place(canvas, cutout(filename), center_x, bottom, height)

# Bicycle pair is the visual anchor and bridges upper + lower groups.
place(canvas, cutout("DSCF8116(1).webp", max_side=1550), 725, 805, 690)

# Right foreground: keep the book figure close to the bicycle and under the
# standing figure, just like the supplied Version 2 arrangement.
place(canvas, cutout("DSCF8122(1).webp"), 1065, 955, 540)

# Foreground row. Bottoms are aligned closely, while x positions overlap the
# focal pair enough to read as one portrait instead of isolated cut-outs.
foreground = [
    ("DSCF8211(1).webp", 245, 1000, 505),  # sunglasses / cane
    ("DSCF8202(1).webp", 465, 1002, 510),  # centre-left
    ("DSCF8186(1).webp", 685, 1005, 515),  # tool, centre foreground
    ("DSCF8173(1).webp", 895, 1000, 525),  # hammer, centre-right
]

for filename, center_x, bottom, height in foreground:
    place(canvas, cutout(filename), center_x, bottom, height)

# Crop transparent dead space so CSS scales the people themselves, not an
# oversized empty canvas. Keep only a small breathing margin around the group.
bbox = canvas.getchannel("A").getbbox()
if bbox:
    left, top, right, bottom = bbox
    pad_x = 14
    pad_y = 10
    canvas = canvas.crop(
        (
            max(0, left - pad_x),
            max(0, top - pad_y),
            min(canvas.width, right + pad_x),
            min(canvas.height, bottom + pad_y),
        )
    )

canvas.save(OUTPUT, "WEBP", quality=92, method=6, exact=True)
print(f"Built Version 2 team composite: {OUTPUT} at {canvas.width}x{canvas.height}")
