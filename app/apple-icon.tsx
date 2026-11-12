import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const alt = "NWACUHO conference app";

export default function AppleIcon() {
  // Render a PNG from the same approved NWACUHO short mark as the PWA icon.
  // Apple touch icons require a raster image on iPhone.
  const svg = readFileSync(join(process.cwd(), "public", "branding", "nwacuho-app-icon.svg"));
  const src = `data:image/svg+xml;base64,${svg.toString("base64")}`;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1F443E" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width="180" height="180" alt="" />
    </div>,
    { ...size }
  );
}
