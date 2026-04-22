import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FastFulfill blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #020617 0%, #312e81 100%)",
          color: "white",
          padding: 64,
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 900,
            }}
          >
            F
          </div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>FastFulfill</div>
        </div>
        <div>
          <div
            style={{
              display: "inline-flex",
              borderRadius: 999,
              background: "rgba(129,140,248,0.18)",
              color: "#c7d2fe",
              padding: "10px 18px",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Blog
          </div>
          <h1
            style={{
              marginTop: 28,
              maxWidth: 960,
              fontSize: 64,
              lineHeight: 1.05,
              fontWeight: 900,
              letterSpacing: -2,
            }}
          >
            {title}
          </h1>
        </div>
      </div>
    ),
    { ...size }
  );
}
