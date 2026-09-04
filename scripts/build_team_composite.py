from pathlib import Path
from io import BytesIO

from PIL import Image, ImageOps
from rembg import new_session, remove

ASSETS = Path("public/assets")
TEAM = ASSETS / "brutti-team"
OUTPUT = ASSETS / "brutti-team-composite.webp"

# u2netp is the lightweight rembg model. Reusing one session keeps the
# deployment build fast while producing genuine transparent cut-outs.
SESSION = new_session("u2netp")


def cutout(filename: str, max_side: int = 1050) -> Image.Image:
    image = Image.open(TEAM / filename)
    image = ImageOps.exif_transpose(image).convert("RGBA")
    image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)

    result = remove(image, session=SESSION)
    if not isinstance(result, Image.Image):
        result = Image.open(BytesIO(result))
    result = result.convert("RGBA")

    # Clean only the nearly invisible fringe. Keep semi-transparent hair,
    # fabric and bicycle spokes intact.
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

    # Clip safely when a tool or limb extends outside the composition.
    src_left = max(0, -x)
    src_top = max(0, -y)
    src_right = min(image.width, canvas.width - x)
    src_bottom = min(image.height, canvas.height - y)

    if src_right <= src_left or src_bottom <= src_top:
        return

    clipped = image.crop((src_left, src_top, src_right, src_bottom))
    canvas.alpha_composite(clipped, (max(0, x), max(0, y)))


# The stage follows the approved composition: women above, bicycle as the
# central focal point, men below. The slight overlaps make it read as one
# editorial team portrait instead of a grid of individual photos.
canvas = Image.new("RGBA", (1900, 1120), (0, 0, 0, 0))

women = [
    ("DSCF8078(1).webp", 230, 505, 505),
    ("DSCF8091(1).webp", 560, 485, 430),
    ("DSCF8135(1).webp", 900, 500, 455),
    ("DSCF8122(1).webp", 1250, 500, 445),
    ("WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp", 1580, 510, 475),
]

men = [
    ("DSCF8211(1).webp", 220, 1105, 445),
    ("DSCF8202(1).webp", 540, 1105, 440),
    ("DSCF8186(1).webp", 860, 1105, 455),
    ("DSCF8173(1).webp", 1325, 1105, 455),
    ("DSCF8148(1).webp", 1655, 1105, 455),
]

# Back layer.
for filename, center_x, bottom, height in women:
    place(canvas, cutout(filename), center_x, bottom, height)
for filename, center_x, bottom, height in men:
    place(canvas, cutout(filename), center_x, bottom, height)

# Bicycle pair sits in front and bridges the two rows, matching the chosen
# reference composition while keeping the bicycle visually centred.
place(canvas, cutout("DSCF8116(1).webp", max_side=1400), 1010, 930, 700)

# Preserve transparency in WebP so the site background and glow can show
# naturally around every person with no visible photo rectangles.
canvas.save(OUTPUT, "WEBP", quality=91, method=6, exact=True)
print(f"Built {OUTPUT}")
