# NWACUHO 2027 conference branding

## Approved visual assets

Two high-resolution PNG source variants were supplied by the conference team on November 12, 2026:

- `NWACUHO 2027 Conference Logo (1).png`: 2048 × 1582 RGBA image with a **transparent background**. Preferred for the forest-green Vancouver homepage hero and on-brand backgrounds.
- `NWACUHO 2027 Conference Logo.png`: 2048 × 1582 RGBA image with a **white background**. Preferred on white layouts, print PDFs and social/marketing collateral.

Both are the same approved badge illustration: green six-sided border, Vancouver skyline/mountains, red maple leaves, and “VANCOUVER, BC / NWACUHO 2027.” Do **not** crop away the green border, recolor, stretch, redraw, or replace the official lettering. Apply an appropriate size and ample clear space.

The site currently displays `public/branding/nwacuho-2027-badge.svg` as an embedded optimized copy in the 2027 attendee hero. The original high-resolution PNG source variants were shared in the ChatGPT project conversation; **the originals have not yet been committed as binary files to the repository**. Before final production promotion, import the original assets into `public/branding/` and replace the preview derivative, preserving original aspect ratio. Prefer an optimized PNG/WebP derivative for the website and keep an archival original.

## Intended usage

- 2027 homepage hero: transparent logo in a prominent centered location, with accessible alt text.
- Shared header: official NWACUHO organization wordmark, not the full conference badge at small sizes.
- App/favicon: simplified approved icon; do not assume the detailed skyline badge is legible at 32 px.
- Print/sponsor materials: white-background variant when needed for reliable contrast.
- Never use an expired temporary image URL as the production source.

## Release checklist

- Verify logo looks correct in mobile portrait and desktop widescreen.
- Confirm transparency and text sharpness; avoid blurry enlarged tiny previews.
- Verify both light and dark backgrounds.
- Test loading the branded image from a protected Preview and confirm accessible alt text.
- Preserve production `nwacuho.app` until separately approved.
