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


# VERSION 2 — compact layered portrait.
# The important change here is that the upper staff sit LOWER and CLOSER to the
# centre. The foreground men deliberately overlap / cover the cropped legs of
# the upper portraits, matching the supplied reference instead of looking like
# two separated rows.
canvas = Image.new("RGBA", (1320, 820), (0, 0, 0, 0))

# BACK / UPPER LAYER — tight arc, lowered into the foreground group.
# 8135 = black-hijab laptop woman
# 8148 = man holding blue tool
# 8091 = phone / board woman
# 8078 = drill woman
# WhatsApp = standing woman with glasses
place(canvas, cutout("DSCF8135(1).webp"), 175, 535, 410)
place(canvas, cutout("DSCF8148(1).webp"), 355, 485, 365)
place(canvas, cutout("DSCF8091(1).webp"), 525, 470, 340)
place(canvas, cutout("DSCF8078(1).webp"), 875, 540, 420)
place(
    canvas,
    cutout("WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp"),
    1080,
    590,
    475,
)

# MAIN ANCHOR — bicycle pair remains central but is kept inside the group so
# the surrounding staff can overlap it naturally.
place(canvas, cutout("DSCF8116(1).webp", max_side=1550), 690, 720, 575)

# RIGHT FOREGROUND — lowered so the book portrait closes the gap beneath the
# drill / standing portraits rather than floating on its own.
place(canvas, cutout("DSCF8122(1).webp"), 1015, 815, 470)

# FRONT ROW — these four are intentionally drawn last so they cover the cut
# legs / lower edges of the upper portraits, exactly like the Version 2 layout.
place(canvas, cutout("DSCF8211(1).webp"), 270, 820, 510)
place(canvas, cutout("DSCF8186(1).webp"), 455, 820, 465)
place(canvas, cutout("DSCF8202(1).webp"), 640, 820, 465)
place(canvas, cutout("DSCF8173(1).webp"), 830, 820, 500)

# Crop only genuinely empty transparent space. Keep a little breathing room so
# heads and raised tools never touch the website edge after scaling.
bbox = canvas.getchannel("A").getbbox()
if bbox:
    left, top, right, bottom = bbox
    pad_x = 18
    pad_top = 18
    pad_bottom = 6
    canvas = canvas.crop(
        (
            max(0, left - pad_x),
            max(0, top - pad_top),
            min(canvas.width, right + pad_x),
            min(canvas.height, bottom + pad_bottom),
        )
    )

canvas.save(OUTPUT, "WEBP", quality=92, method=6, exact=True)
print(f"Built {OUTPUT} at {canvas.width}x{canvas.height}")
