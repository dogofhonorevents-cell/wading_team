import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "20%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
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
