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

    # Keep hair, fabric edges, tools and bicycle spokes while removing only
    # the nearly invisible fringe left by the background-removal model.
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


# Compact editorial group: the previous version was too wide and read like
# two separate rows. This canvas deliberately pulls everyone toward the
# bicycle so the section feels like one team portrait instead of a roster.
canvas = Image.new("RGBA", (1500, 1040), (0, 0, 0, 0))

# Upper group — slightly staggered and overlapping.
women = [
    ("DSCF8078(1).webp", 235, 455, 440),
    ("DSCF8091(1).webp", 470, 445, 375),
    ("DSCF8135(1).webp", 720, 465, 405),
    ("DSCF8122(1).webp", 990, 455, 395),
    ("WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp", 1250, 460, 420),
]

# Lower group — brought inward so the edges no longer feel empty.
men = [
    ("DSCF8211(1).webp", 285, 1025, 400),
    ("DSCF8202(1).webp", 500, 1025, 395),
    ("DSCF8186(1).webp", 700, 1025, 410),
    ("DSCF8173(1).webp", 1045, 1025, 410),
    ("DSCF8148(1).webp", 1270, 1025, 410),
]

for filename, center_x, bottom, height in women:
    place(canvas, cutout(filename), center_x, bottom, height)

for filename, center_x, bottom, height in men:
    place(canvas, cutout(filename), center_x, bottom, height)

# Bicycle pair bridges both groups and remains the focal point, but is kept
# contained so it does not overpower the copy beside it.
place(canvas, cutout("DSCF8116(1).webp", max_side=1400), 790, 880, 640)

canvas.save(OUTPUT, "WEBP", quality=91, method=6, exact=True)
print(f"Built {OUTPUT}")
