import { ImageResponse } from "next/og";
export const dynamic = "force-static";
export const alt = "Luxe Salon — A little time. Entirely yours.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "#eeeee5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#30382d",
      }}
    >
      <div style={{ fontSize: 100, letterSpacing: 18 }}>LUXE</div>
      <div style={{ fontSize: 20, letterSpacing: 13 }}>SALON</div>
      <div style={{ fontSize: 42, marginTop: 65 }}>
        A little time. Entirely yours.
      </div>
      <div style={{ fontSize: 18, marginTop: 35, color: "#8a7654" }}>
        MAYFAIR & CHELSEA · LONDON
      </div>
    </div>,
    size,
  );
}
