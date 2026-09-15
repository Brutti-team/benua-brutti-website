from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
THRESHOLD_BYTES = 500 * 1024
QUALITY = 95
SUPPORTED = {".png", ".jpg", ".jpeg"}
TEXT_EXTENSIONS = {".jsx", ".js", ".tsx", ".ts", ".css", ".html", ".json", ".md"}


def has_alpha(image: Image.Image) -> bool:
    return image.mode in {"RGBA", "LA"} or (
        image.mode == "P" and "transparency" in image.info
    )


def human_size(value: int) -> str:
    units = ["B", "KB", "MB", "GB"]
    amount = float(value)
    for unit in units:
        if amount < 1024 or unit == units[-1]:
            return f"{amount:.1f} {unit}"
        amount /= 1024
    return f"{value} B"


def convert_image(source: Path, destination: Path) -> tuple[int, int, tuple[int, int], tuple[int, int]]:
    original_bytes = source.stat().st_size

    with Image.open(source) as raw:
        original_size = raw.size
        image = ImageOps.exif_transpose(raw)
        converted_size = image.size
        alpha = has_alpha(image)

        icc_profile = raw.info.get("icc_profile")
        exif = image.getexif().tobytes() if image.getexif() else None

        save_kwargs = {
            "format": "WEBP",
            "method": 6,
        }
        if alpha:
            # Keep transparent artwork pixel-clean while still benefiting from WebP.
            save_kwargs.update({"lossless": True, "exact": True})
        else:
            # High quality keeps the landing page visually unchanged while reducing transfer size.
            save_kwargs.update({"quality": QUALITY})

        if icc_profile:
            save_kwargs["icc_profile"] = icc_profile
        if exif:
            save_kwargs["exif"] = exif

        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, **save_kwargs)

    with Image.open(destination) as check:
        if check.size != converted_size:
            destination.unlink(missing_ok=True)
            raise RuntimeError(
                f"Dimension mismatch for {source}: {converted_size} -> {check.size}"
            )

    return original_bytes, destination.stat().st_size, original_size, converted_size


def update_references(mapping: dict[str, str]) -> list[Path]:
    changed: list[Path] = []
    candidates = [ROOT / "index.html"]
    candidates.extend(
        path for path in (ROOT / "src").rglob("*")
        if path.is_file() and path.suffix.lower() in TEXT_EXTENSIONS
    )

    for path in candidates:
        if not path.exists() or not path.is_file():
            continue

        text = path.read_text(encoding="utf-8")
        updated = text

        for old, new in mapping.items():
            updated = updated.replace(old, new)

        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(path.relative_to(ROOT))

    return changed


def main() -> None:
    candidates = sorted(
        path for path in ASSETS.rglob("*")
        if path.is_file()
        and path.suffix.lower() in SUPPORTED
        and path.stat().st_size > THRESHOLD_BYTES
    )

    if not candidates:
        print("No heavy non-WebP landing assets found.")
        return

    converted: list[tuple[Path, Path, int, int, tuple[int, int], tuple[int, int]]] = []
    mapping: dict[str, str] = {}

    # Only basename-replace names that are unique inside public/assets.
    all_asset_names: dict[str, int] = {}
    for asset in ASSETS.rglob("*"):
        if asset.is_file():
            all_asset_names[asset.name] = all_asset_names.get(asset.name, 0) + 1

    for source in candidates:
        destination = source.with_suffix(".webp")
        if destination.exists():
            print(f"SKIP existing: {destination.relative_to(ROOT)}")
            continue

        old_bytes, new_bytes, old_size, new_size = convert_image(source, destination)
        converted.append((source, destination, old_bytes, new_bytes, old_size, new_size))

        source_rel = source.relative_to(ASSETS).as_posix()
        dest_rel = destination.relative_to(ASSETS).as_posix()

        # Full path forms used in CSS/JS/HTML.
        mapping[f"assets/{source_rel}"] = f"assets/{dest_rel}"
        mapping[f"/assets/{source_rel}"] = f"/assets/{dest_rel}"
        mapping[source_rel] = dest_rel

        # Components often call asset('filename.ext'). Replace basename only when unambiguous.
        if all_asset_names.get(source.name, 0) == 1:
            mapping[source.name] = destination.name

    changed_files = update_references(mapping)

    print("\nHigh-quality WebP conversion summary")
    print("=" * 72)
    total_old = 0
    total_new = 0
    for source, destination, old_bytes, new_bytes, old_size, new_size in converted:
        total_old += old_bytes
        total_new += new_bytes
        reduction = (1 - new_bytes / old_bytes) * 100 if old_bytes else 0
        orientation_note = "" if old_size == new_size else f" (display-oriented {old_size} -> {new_size})"
        print(
            f"{source.relative_to(ROOT)} -> {destination.relative_to(ROOT)} | "
            f"{human_size(old_bytes)} -> {human_size(new_bytes)} | "
            f"-{reduction:.1f}% | {new_size[0]}x{new_size[1]}{orientation_note}"
        )

    if total_old:
        total_reduction = (1 - total_new / total_old) * 100
        print("-" * 72)
        print(
            f"TOTAL converted transfer: {human_size(total_old)} -> {human_size(total_new)} "
            f"(-{total_reduction:.1f}%)"
        )

    print("\nUpdated references:")
    for path in changed_files:
        print(f"  - {path}")

    if converted and not changed_files:
        print("WARNING: assets were converted but no source references changed.")


if __name__ == "__main__":
    main()
