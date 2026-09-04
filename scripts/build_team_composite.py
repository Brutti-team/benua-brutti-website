from pathlib import Path
from io import BytesIO

from PIL import Image, ImageOps
from rembg import new_session, remove

ASSETS = Path("public/assets")
TEAM = ASSETS / "brutti-team"
OUTPUT = ASSETS / "brutti-team-composite.webp"

# Reuse one lightweight background-removal session for all staff photos.
SESSION = new_session("u2netp")


def cutout(filename: str, max_side: int = 1150) -> Image.Image:
    image = Image.open(TEAM / filename)
    image = ImageOps.exif_transpose(image).convert("RGBA")
    image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)

    result = remove(image, session=SESSION)
    if not isinstance(result, Image.Image):
        result = Image.open(BytesIO(result))
    result = result.convert("RGBA")

    # Remove only the faint fringe so hair, bicycle spokes and tools stay intact.
    alpha = result.getchannel("A").point(
        lambda value: 0 if value < 7 else (255 if value > 250 else value)
    )
    result.putalpha(alpha)

    bbox = alpha.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        pad = 10
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


def place(
    canvas: Image.Image,
    image: Image.Image,
    center_x: int,
    bottom: int,
    height: int,
) -> None:
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


# VERSION 2 REFERENCE
# -------------------
# The supplied version 2 is a wide, compact team portrait rather than two rows.
# This 1368 x 774 working canvas follows the same visual proportions and keeps
# the bicycle pair in the centre, with the remaining staff wrapping around it.
canvas = Image.new("RGBA", (1368, 774), (0, 0, 0, 0))

# File mapping confirmed from the existing GitHub team photos:
# 8078 = drill woman
# 8091 = phone / board woman
# 8135 = black-hijab laptop woman
# 8122 = beige-hijab book woman
# WhatsApp = standing woman with glasses
# 8148 = man holding blue tool
# 8211 = sunglasses + cane
# 8186 = front man with cane
# 8202 = front man holding tool
# 8173 = front man with mallet / orange cane
# 8116 = bicycle pair

# BACK / UPPER LAYER — matching version 2 from left to right.
# Blue-tool man sits behind the laptop woman, then phone/board woman,
# drill woman and standing woman form the upper arc.
place(canvas, cutout("DSCF8148(1).webp"), 405, 421, 390)
place(canvas, cutout("DSCF8135(1).webp"), 213, 520, 435)
place(canvas, cutout("DSCF8091(1).webp"), 621, 372, 348)
place(canvas, cutout("DSCF8078(1).webp"), 932, 489, 420)
place(
    canvas,
    cutout("WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp"),
    1145,
    627,
    558,
)

# MAIN ANCHOR — bicycle pair in the centre, bridging upper and lower layers.
place(canvas, cutout("DSCF8116(1).webp", max_side=1550), 738, 696, 570)

# RIGHT FOREGROUND — book woman overlaps the drill / standing group just like
# the supplied version 2 reference.
place(canvas, cutout("DSCF8122(1).webp"), 1062, 726, 508)

# FRONT ROW — four men form one clean baseline across the lower half.
place(canvas, cutout("DSCF8211(1).webp"), 278, 774, 550)
place(canvas, cutout("DSCF8186(1).webp"), 492, 774, 464)
place(canvas, cutout("DSCF8202(1).webp"), 696, 774, 452)
place(canvas, cutout("DSCF8173(1).webp"), 915, 774, 485)

# Crop transparent dead space only. The resulting aspect ratio stays wide so
# the website can display the whole group without cutting heads or feet.
bbox = canvas.getchannel("A").getbbox()
if bbox:
    left, top, right, bottom = bbox
    pad_x = 14
    pad_y = 8
    canvas = canvas.crop(
        (
            max(0, left - pad_x),
            max(0, top - pad_y),
            min(canvas.width, right + pad_x),
            min(canvas.height, bottom + pad_y),
        )
    )

canvas.save(OUTPUT, "WEBP", quality=92, method=6, exact=True)
print(f"Built {OUTPUT} at {canvas.width}x{canvas.height}")
