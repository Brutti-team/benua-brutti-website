from pathlib import Path
from io import BytesIO

from PIL import Image, ImageEnhance, ImageOps, ImageStat
from rembg import new_session, remove

ASSETS = Path("public/assets")
TEAM = ASSETS / "brutti-team"
OUTPUT = ASSETS / "brutti-team-composite.webp"

SESSION = new_session("u2netp")
RENDER_SCALE = 1.5

# Small final nudges after automatic exposure matching.  The automatic pass does
# most of the work; these only compensate for sources whose shirts / skin still
# read unusually bright or dark after background removal.
TONE_NUDGE = {
    "DSCF8135(1).webp": 1.04,
    "DSCF8091(1).webp": 1.05,
    "DSCF8116(1).webp": 1.04,
    "DSCF8211(1).webp": 1.02,
    "DSCF8186(1).webp": 1.02,
    "DSCF8202(1).webp": 1.02,
    "DSCF8078(1).webp": 0.97,
    "DSCF8148(1).webp": 0.95,
    "DSCF8122(1).webp": 0.94,
    "DSCF8173(1).webp": 0.91,
    "WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp": 0.93,
}


def match_exposure(image: Image.Image, filename: str) -> Image.Image:
    """Match every cut-out to one shared luminance range, then apply one grade."""
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > 48 else 0)

    rgb = image.convert("RGB")
    gray = ImageOps.grayscale(rgb)
    mean_luma = ImageStat.Stat(gray, mask=mask).mean[0] if mask.getbbox() else 112

    target_luma = 112.0
    exposure = target_luma / max(1.0, mean_luma)
    exposure = max(0.82, min(1.18, exposure))
    exposure *= TONE_NUDGE.get(filename, 1.0)

    rgb = ImageEnhance.Brightness(rgb).enhance(exposure)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.035)
    rgb = ImageEnhance.Color(rgb).enhance(1.025)

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

    # Keep hair / bicycle spokes / tools, but clean the faint matte fringe.
    alpha = result.getchannel("A").point(
        lambda value: 0 if value < 7 else (255 if value > 250 else value)
    )
    result.putalpha(alpha)

    bbox = alpha.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        pad = 8
        result = result.crop(
            (
                max(0, left - pad),
                max(0, top - pad),
                min(result.width, right + pad),
                min(result.height, bottom + pad),
            )
        )

    return match_exposure(result, filename)


def resize_height(image: Image.Image, height: int) -> Image.Image:
    ratio = height / max(1, image.height)
    width = max(1, round(image.width * ratio))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def place(canvas: Image.Image, image: Image.Image, center_x: int, bottom: int, height: int) -> None:
    # Layout coordinates below stay easy to tune at the original 1020x720
    # design scale; this function renders them larger for a sharper web asset.
    center_x = round(center_x * RENDER_SCALE)
    bottom = round(bottom * RENDER_SCALE)
    height = round(height * RENDER_SCALE)

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


def strip_brutti_hd_background() -> None:
    """Remove only the background from the existing brutti-hd.webp artwork.

    This intentionally keeps the original team arrangement, faces, proportions,
    props and spacing exactly as supplied.  The build only adds transparency and
    trims empty outer pixels so the portrait can sit directly on the green page.
    """
    source = ASSETS / "brutti-hd.webp"
    image = Image.open(source)
    image = ImageOps.exif_transpose(image).convert("RGBA")

    result = remove(image, session=SESSION)
    if not isinstance(result, Image.Image):
        result = Image.open(BytesIO(result))
    result = result.convert("RGBA")

    # Retain soft hair/tool edges and fine details while removing faint residue.
    alpha = result.getchannel("A").point(
        lambda value: 0 if value < 5 else (255 if value > 252 else value)
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

    result.save(source, "WEBP", quality=96, method=6, exact=True)
    print(f"Removed background from {source} at {result.width}x{result.height}")


# Use the existing Brutti HD artwork itself on the journey page.  Do not rebuild
# or re-space that artwork; only remove its background during deployment.
strip_brutti_hd_background()

# FINAL COMPACT VERSION
# ---------------------
# Kept for other uses that may still reference the generated composite.
canvas = Image.new(
    "RGBA",
    (round(1020 * RENDER_SCALE), round(720 * RENDER_SCALE)),
    (0, 0, 0, 0),
)

# BACK / UPPER ARC — closer together and lower.
place(canvas, cutout("DSCF8135(1).webp"), 108, 490, 310)   # laptop woman
place(canvas, cutout("DSCF8148(1).webp"), 245, 470, 302)   # blue-tool man
place(canvas, cutout("DSCF8091(1).webp"), 382, 492, 350)   # phone / board woman
place(canvas, cutout("DSCF8078(1).webp"), 700, 500, 305)   # drill woman
place(
    canvas,
    cutout("WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp"),
    850,
    545,
    350,
)  # standing woman

# CENTRAL ANCHOR — behind the foreground so lower bicycle / legs disappear
# naturally into the front group.
place(canvas, cutout("DSCF8116(1).webp", max_side=1500), 535, 650, 440)

# FOREGROUND — drawn last and raised aggressively to hide cropped back-row legs.
place(canvas, cutout("DSCF8211(1).webp"), 250, 715, 400)   # sunglasses man
place(canvas, cutout("DSCF8202(1).webp"), 382, 715, 398)   # plain standing man
place(canvas, cutout("DSCF8186(1).webp"), 515, 715, 405)   # front tool man
place(canvas, cutout("DSCF8173(1).webp"), 650, 715, 400)   # front-right man

# Right foreground closes the final gap and covers the lower edge of the drill /
# standing portraits.
place(canvas, cutout("DSCF8122(1).webp"), 835, 716, 420)   # book woman

# Crop almost all transparent breathing room so the website receives a genuinely
# compact image, not a compact group sitting inside a wide empty canvas.
bbox = canvas.getchannel("A").getbbox()
if bbox:
    left, top, right, bottom = bbox
    pad_x = round(6 * RENDER_SCALE)
    pad_top = round(8 * RENDER_SCALE)
    pad_bottom = round(2 * RENDER_SCALE)
    canvas = canvas.crop(
        (
            max(0, left - pad_x),
            max(0, top - pad_top),
            min(canvas.width, right + pad_x),
            min(canvas.height, bottom + pad_bottom),
        )
    )

canvas.save(OUTPUT, "WEBP", quality=95, method=6, exact=True)
print(f"Built {OUTPUT} at {canvas.width}x{canvas.height}")
