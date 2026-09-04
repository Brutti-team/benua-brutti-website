from pathlib import Path
from io import BytesIO

from PIL import Image, ImageEnhance, ImageOps
from rembg import new_session, remove

ASSETS = Path("public/assets")
TEAM = ASSETS / "brutti-team"
OUTPUT = ASSETS / "brutti-team-composite.webp"

# Reuse one lightweight background-removal session for all staff photos.
SESSION = new_session("u2netp")

# Per-photo tone balancing. The source photos were shot under different light,
# so these small corrections bring skin tones and green shirts closer together
# without making the collage look filtered or artificial.
TONE = {
    # darker sources -> lift brightness / contrast slightly
    "DSCF8135(1).webp": {"brightness": 1.08, "contrast": 1.03, "color": 1.03},
    "DSCF8091(1).webp": {"brightness": 1.10, "contrast": 1.03, "color": 1.02},
    "DSCF8116(1).webp": {"brightness": 1.04, "contrast": 1.02, "color": 1.02},
    "DSCF8211(1).webp": {"brightness": 1.04, "contrast": 1.02, "color": 1.02},
    "DSCF8186(1).webp": {"brightness": 1.07, "contrast": 1.03, "color": 1.02},
    "DSCF8202(1).webp": {"brightness": 1.06, "contrast": 1.03, "color": 1.02},

    # brighter / washed sources -> bring highlights back down and restore colour
    "DSCF8078(1).webp": {"brightness": 0.96, "contrast": 1.04, "color": 1.04},
    "DSCF8148(1).webp": {"brightness": 0.97, "contrast": 1.03, "color": 1.03},
    "DSCF8122(1).webp": {"brightness": 0.95, "contrast": 1.04, "color": 1.04},
    "DSCF8173(1).webp": {"brightness": 0.88, "contrast": 1.08, "color": 1.08},
    "WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp": {
        "brightness": 0.98,
        "contrast": 1.03,
        "color": 1.03,
    },
}


def balance_tone(image: Image.Image, filename: str) -> Image.Image:
    """Apply gentle RGB corrections while preserving the cut-out alpha."""
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

    return balance_tone(result, filename)


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


# VERSION 2 — compact layered portrait with a consistent visual human scale.
# Seated / cropped poses naturally have different total pixel heights, so the
# values below are tuned by perceived head-and-torso size rather than forcing
# every cut-out to the exact same bounding-box height.
canvas = Image.new("RGBA", (1320, 820), (0, 0, 0, 0))

# BACK / UPPER LAYER — similar face / torso scale, tightly grouped.
# 8135 = black-hijab laptop woman
# 8148 = man holding blue tool
# 8091 = phone / board woman
# 8078 = drill woman
# WhatsApp = standing woman with glasses
place(canvas, cutout("DSCF8135(1).webp"), 175, 535, 400)
place(canvas, cutout("DSCF8148(1).webp"), 355, 500, 395)
place(canvas, cutout("DSCF8091(1).webp"), 525, 490, 385)
place(canvas, cutout("DSCF8078(1).webp"), 865, 540, 390)
place(
    canvas,
    cutout("WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp"),
    1065,
    585,
    430,
)

# MAIN ANCHOR — still the centre focal point, but no longer oversized against
# the surrounding staff.
place(canvas, cutout("DSCF8116(1).webp", max_side=1550), 690, 720, 545)

# RIGHT FOREGROUND — kept at the same perceived body scale as the other women.
place(canvas, cutout("DSCF8122(1).webp"), 1005, 815, 430)

# FRONT ROW — normalized so heads / shoulders read at one consistent scale.
# They still overlap the upper layer to hide cropped legs and keep the compact
# Version 2 poster shape.
place(canvas, cutout("DSCF8211(1).webp"), 270, 820, 455)
place(canvas, cutout("DSCF8186(1).webp"), 445, 820, 445)
place(canvas, cutout("DSCF8202(1).webp"), 625, 820, 445)
place(canvas, cutout("DSCF8173(1).webp"), 815, 820, 455)

# Crop only genuinely empty transparent space. Keep breathing room for raised
# tools / heads so the web layout never clips them after scaling.
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

canvas.save(OUTPUT, "WEBP", quality=93, method=6, exact=True)
print(f"Built {OUTPUT} at {canvas.width}x{canvas.height}")
