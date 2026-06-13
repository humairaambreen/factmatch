import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FactMatch — Swipe right on knowledge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a2a35 40%, #0d1f2d 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Background grid dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(22,160,133,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: 200,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(41,128,185,0.14) 0%, transparent 70%)",
          }}
        />

        {/* Floating fact cards preview */}
        {[
          { top: 48, right: 120, rotate: 6, color: "#16a085", label: "Science" },
          { top: 160, right: 320, rotate: -4, color: "#8e44ad", label: "Space" },
          { top: 80, right: 520, rotate: 3, color: "#c0392b", label: "History" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              position: "absolute",
              top: card.top,
              right: card.right,
              width: 160,
              height: 200,
              borderRadius: 20,
              background: `linear-gradient(160deg, ${card.color}22 0%, #1a2530 100%)`,
              border: `1px solid ${card.color}40`,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-end",
              padding: "14px 16px",
              transform: `rotate(${card.rotate}deg)`,
            }}
          >
            <div style={{ fontSize: 10, color: card.color, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", marginBottom: 4 }} />
            <div style={{ width: "70%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)" }} />
          </div>
        ))}

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, #16a085, #2980b9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.9)" }} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 3, textTransform: "uppercase" }}>
            FactMatch
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#e5e4e2",
            lineHeight: 1.05,
            letterSpacing: -2,
            marginBottom: 20,
            maxWidth: 700,
          }}
        >
          Swipe right on knowledge.
        </div>

        {/* Sub */}
        <div style={{ fontSize: 24, color: "rgba(229,228,226,0.5)", fontWeight: 400, maxWidth: 560 }}>
          63 topics. Live from Wikipedia. Everything stays on your device.
        </div>

        {/* Pill badges */}
        <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
          {["Science", "History", "AI", "Space", "Philosophy"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid rgba(229,228,226,0.15)",
                color: "rgba(229,228,226,0.6)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
