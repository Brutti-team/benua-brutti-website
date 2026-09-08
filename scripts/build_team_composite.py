from pathlib import Path
from io import BytesIO

from PIL import Image, ImageEnhance, ImageOps, ImageStat
from rembg import new_session, remove

ASSETS = Path("public/assets")
TEAM = ASSETS / "brutti-team"
OUTPUT = ASSETS / "brutti-team-composite.webp"

# Full U2Net gives cleaner hair, sleeves, tools and bicycle edges than u2netp.
SESSION = new_session("u2net")
RENDER_SCALE = 1.5

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


def estimate_matte(image: Image.Image) -> tuple[int, int, int]:
    """Estimate the original flat background colour from the four corners."""
    rgb = image.convert("RGB")
    width, height = rgb.size
    patch = max(4, min(32, min(width, height) // 24))
    boxes = [
        (0, 0, patch, patch),
        (width - patch, 0, width, patch),
        (0, height - patch, patch, height),
        (width - patch, height - patch, width, height),
    ]
    corner_colours = [ImageStat.Stat(rgb.crop(box)).median for box in boxes]
    return tuple(
        int(round(sum(colour[channel] for colour in corner_colours) / len(corner_colours)))
        for channel in range(3)
    )


def decontaminate_matte(image: Image.Image, matte: tuple[int, int, int]) -> Image.Image:
    """Remove old background colour trapped in semi-transparent edge pixels."""
    image = image.convert("RGBA")
    pixels = image.load()

    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a <= 0 or a >= 255:
                continue

            alpha = max(a / 255.0, 0.035)
            cleaned = []
            for channel, background in zip((r, g, b), matte):
                value = (channel - background * (1.0 - alpha)) / alpha
                cleaned.append(max(0, min(255, int(round(value)))))

            pixels[x, y] = (*cleaned, a)

    return image


def polish_alpha(image: Image.Image, low: int = 24, high: int = 232) -> Image.Image:
    """Remove the remaining pale/green fringe while keeping normal antialiasing."""
    alpha = image.getchannel("A")

    def remap(value: int) -> int:
        if value <= low:
            return 0
        if value >= high:
            return 255
        t = (value - low) / max(1, high - low)
        return int(round(255 * (t ** 1.28)))

    image.putalpha(alpha.point(remap))
    return image


def remove_clean(image: Image.Image) -> Image.Image:
    """Create a true transparent cutout with no white/green matte around it."""
    matte = estimate_matte(image)
    result = remove(
        image,
        session=SESSION,
        alpha_matting=True,
        alpha_matting_foreground_threshold=235,
        alpha_matting_background_threshold=18,
        alpha_matting_erode_size=6,
    )
    if not isinstance(result, Image.Image):
        result = Image.open(BytesIO(result))
    result = result.convert("RGBA")
    result = decontaminate_matte(result, matte)
    return polish_alpha(result)


def match_exposure(image: Image.Image, filename: str) -> Image.Image:
    """Match the separate portraits to one shared brightness range."""
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

    result = remove_clean(image)
    alpha = result.getchannel("A")

    bbox = alpha.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        pad = 6
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


# Build the Journey portrait from the individual staff photos instead of using
# the old flattened team artwork. This guarantees the web asset itself is RGBA
# with a genuinely transparent background rather than relying on CSS blending.
canvas = Image.new(
    "RGBA",
    (round(1020 * RENDER_SCALE), round(720 * RENDER_SCALE)),
    (0, 0, 0, 0),
)

# BACK / UPPER ARC
place(canvas, cutout("DSCF8135(1).webp"), 108, 490, 310)
place(canvas, cutout("DSCF8148(1).webp"), 245, 470, 302)
place(canvas, cutout("DSCF8091(1).webp"), 382, 492, 350)
place(canvas, cutout("DSCF8078(1).webp"), 700, 500, 305)
place(
    canvas,
    cutout("WhatsApp Image 2026-09-04 at 12.05.41 PM(1).webp"),
    850,
    545,
    350,
)

# CENTRAL ANCHOR
place(canvas, cutout("DSCF8116(1).webp", max_side=1500), 535, 650, 440)

# FOREGROUND
place(canvas, cutout("DSCF8211(1).webp"), 250, 715, 400)
place(canvas, cutout("DSCF8202(1).webp"), 382, 715, 398)
place(canvas, cutout("DSCF8186(1).webp"), 515, 715, 405)
place(canvas, cutout("DSCF8173(1).webp"), 650, 715, 400)
place(canvas, cutout("DSCF8122(1).webp"), 835, 716, 420)

# Tight crop: no rectangular transparent padding around the team.
bbox = canvas.getchannel("A").getbbox()
if bbox:
    left, top, right, bottom = bbox
    pad_x = round(4 * RENDER_SCALE)
    pad_top = round(5 * RENDER_SCALE)
    pad_bottom = round(1 * RENDER_SCALE)
    canvas = canvas.crop(
        (
            max(0, left - pad_x),
            max(0, top - pad_top),
            min(canvas.width, right + pad_x),
            min(canvas.height, bottom + pad_bottom),
        )
    )

canvas.save(OUTPUT, "WEBP", quality=96, method=6, exact=True)
print(f"Built clean transparent {OUTPUT} at {canvas.width}x{canvas.height}")
