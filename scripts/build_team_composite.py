from pathlib import Path
from io import BytesIO

from PIL import Image, ImageEnhance, ImageOps
from rembg import new_session, remove

ASSETS = Path("public/assets")
TEAM = ASSETS / "brutti-team"
OUTPUT = ASSETS / "brutti-team-composite.webp"

SESSION = new_session("u2netp")

# Balance the different source lighting so the collage reads more like one shoot.
TONE = {
    "DSCF8135(1).webp": {"brightness": 1.10, "contrast": 1.04, "color": 1.04},
    "DSCF8091(1).webp": {"brightness": 1.14, "contrast": 1.04, "color": 1.03},
    "DSCF8116(1).webp": {"brightness": 1.08, "contrast": 1.03, "color": 1.03},
    "DSCF8211(1).webp": {"brightness": 1.06, "contrast": 1.03, "color": 1.03},
    "DSCF8186(1).webp": {"brightness": 1.08, "contrast": 1.04, "color": 1.03},
    "DSCF8202(1).webp": {"brightness": 1.08, "contrast": 1.04, "color": 1.03},
    "DSCF8078(1).webp": {"brightness": 0.85, "contrast": 1.10, "color": 1.06},
    "DSCF8148(1).webp": {"brightness": 0.86, "contrast": 1.09, "color": 1.05},
    "DSCF8122(1).webp": {"brightness": 0.88, "contrast": 1.08, "color": 1.05},
    "DSCF8173(1).webp": {"brightness": 0.76, "contrast": 1.14, "color": 1.08},
    "WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp": {
        "brightness": 0.88,
        "contrast": 1.09,
        "color": 1.05,
    },
}


def balance_tone(image: Image.Image, filename: str) -> Image.Image:
    settings = TONE.get(filename)
    if not settings:
        return image

    alpha = image.getchannel("A")
    rgb = image.convert("RGB")
    rgb = ImageEnhance.Brightness(rgb).enhance(settings.get("brightness", 1.0))
    rgb = ImageEnhance.Contrast(rgb).enhance(settings.get("contrast", 1.0))
    rgb = ImageEnhance.Color(rgb).enhance(settings.get("color", 1.0))

    corrected = rgb.convert("RGBA")
    corrected.putalpha(alpha)
    return corrected


def cutout(filename: str, max_side: int = 1150) -> Image.Image:
    image = Image.open(TEAM / filename)
    image = ImageOps.exif_transpose(image).convert("RGBA")
    image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)

    result = remove(image, session=SESSION)
    if not isinstance(result, Image.Image):
        result = Image.open(BytesIO(result))
    result = result.convert("RGBA")

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

    return balance_tone(result, filename)


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


# VERSION 2 — compact poster composition.
# The back row is pushed down and inward, while the foreground row is lifted
# so cropped legs are hidden by the people in front instead of floating apart.
canvas = Image.new("RGBA", (1160, 820), (0, 0, 0, 0))

# BACK / UPPER LAYER — much tighter and lower than before.
place(canvas, cutout("DSCF8135(1).webp"), 165, 600, 345)   # laptop woman
place(canvas, cutout("DSCF8148(1).webp"), 315, 570, 325)   # blue-tool man
place(canvas, cutout("DSCF8091(1).webp"), 465, 585, 400)   # phone / board woman
place(canvas, cutout("DSCF8078(1).webp"), 760, 610, 325)   # drill woman
place(
    canvas,
    cutout("WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp"),
    920,
    650,
    430,
)  # standing woman

# MAIN ANCHOR — pulled slightly lower so foreground people overlap the bicycle.
place(canvas, cutout("DSCF8116(1).webp", max_side=1550), 610, 760, 500)

# RIGHT FOREGROUND — overlaps drill + standing woman and closes the open gap.
place(canvas, cutout("DSCF8122(1).webp"), 875, 820, 475)

# FRONT ROW — drawn last and moved UP so they cover cropped legs of the back row.
place(canvas, cutout("DSCF8211(1).webp"), 300, 800, 430)
place(canvas, cutout("DSCF8186(1).webp"), 445, 800, 425)
place(canvas, cutout("DSCF8202(1).webp"), 590, 800, 425)
place(canvas, cutout("DSCF8173(1).webp"), 735, 800, 430)

# Tight crop so the finished collage itself stays compact on the website.
bbox = canvas.getchannel("A").getbbox()
if bbox:
    left, top, right, bottom = bbox
    pad_x = 10
    pad_top = 12
    pad_bottom = 4
    canvas = canvas.crop(
        (
            max(0, left - pad_x),
            max(0, top - pad_top),
            min(canvas.width, right + pad_x),
            min(canvas.height, bottom + pad_bottom),
        )
    )

canvas.save(OUTPUT, "WEBP", quality=93, method=6, exact=True)
print(f"Built {OUTPUT} at {canvas.width}x{canvas.height}")
