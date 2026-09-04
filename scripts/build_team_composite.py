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


# Dense poster-style composition based on the supplied reference. Everyone
# is intentionally pulled toward the bicycle so the collage reads as one
# layered team portrait instead of two separate rows of people.
canvas = Image.new("RGBA", (1320, 1060), (0, 0, 0, 0))

# Upper group: form a shallow arc and let shoulders / silhouettes overlap.
women = [
    ("DSCF8078(1).webp", 190, 500, 490),
    ("DSCF8091(1).webp", 405, 430, 390),
    ("DSCF8135(1).webp", 615, 420, 425),
    ("DSCF8122(1).webp", 830, 435, 420),
    ("WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp", 1105, 500, 465),
]

# Lower group: keep the men close enough to read as a single foreground row.
men = [
    ("DSCF8211(1).webp", 205, 1050, 450),
    ("DSCF8202(1).webp", 425, 1055, 455),
    ("DSCF8186(1).webp", 645, 1058, 470),
    ("DSCF8173(1).webp", 875, 1055, 460),
    ("DSCF8148(1).webp", 1100, 1050, 455),
]

for filename, center_x, bottom, height in women:
    place(canvas, cutout(filename), center_x, bottom, height)

for filename, center_x, bottom, height in men:
    place(canvas, cutout(filename), center_x, bottom, height)

# The bicycle pair is the visual anchor. It overlaps both rows, matching the
# tighter stacked hierarchy of the reference artwork.
place(canvas, cutout("DSCF8116(1).webp", max_side=1500), 675, 865, 720)

# Remove transparent dead space around the finished group. This is important
# because the website can then scale the actual people rather than scaling an
# oversized empty canvas.
bbox = canvas.getchannel("A").getbbox()
if bbox:
    left, top, right, bottom = bbox
    pad = 10
    canvas = canvas.crop(
        (
            max(0, left - pad),
            max(0, top - pad),
            min(canvas.width, right + pad),
            min(canvas.height, bottom + pad),
        )
    )

canvas.save(OUTPUT, "WEBP", quality=92, method=6, exact=True)
print(f"Built {OUTPUT} at {canvas.width}x{canvas.height}")
