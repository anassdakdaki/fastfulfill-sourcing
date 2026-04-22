import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FastFulfill";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0f172a",
          color: "white",
          padding: "72px",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "56px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 800,
            }}
          >
            F
          </div>
          <div style={{ fontSize: "34px", fontWeight: 800 }}>FastFulfill</div>
        </div>
        <div style={{ maxWidth: "840px", fontSize: "62px", lineHeight: 1.05, fontWeight: 900 }}>
          Product sourcing and fulfillment from China
        </div>
        <div style={{ marginTop: "28px", maxWidth: "780px", fontSize: "28px", lineHeight: 1.4, color: "#cbd5e1" }}>
          Get clear product prices, warehouse QC, packing, shipping, and tracking for ecommerce orders.
        </div>
      </div>
    ),
    size
  );
}
