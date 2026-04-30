import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #4a6c4f 0%, #6b9070 50%, #d8a3a8 100%)",
          borderRadius: "22%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 110,
            lineHeight: 1,
          }}
        >
          🐾
        </div>
      </div>
    ),
    { ...size }
  );
}
