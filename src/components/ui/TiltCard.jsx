import { useRef } from "react";

/**
 * TiltCard — 3D perspective tilt + holographic foil shimmer.
 * Works with any children; preserves all existing className/intensity props.
 * No new dependencies — pure CSS + JS.
 */
export default function TiltCard({ children, className, intensity = 10 }) {
  const ref      = useRef(null);
  const foilRef  = useRef(null);
  const glowRef  = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0 → 1
    const py = (e.clientY - rect.top)  / rect.height;  // 0 → 1

    // 3D tilt
    const rx = (py - 0.5) * -intensity;
    const ry = (px - 0.5) *  intensity;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;

    // ── Holographic foil ────────────────────────────────────────────────
    if (foilRef.current) {
      // Gradient angle follows card tilt so it "rotates" with the card
      const angle    = 115 + ry * 4 + rx * 2;
      const px100    = px * 100;
      const py100    = py * 100;
      // Base hue cycles across the card based on mouse position (0–360°)
      const baseHue  = (px * 360 + py * 180) % 360;

      foilRef.current.style.opacity = "1";
      foilRef.current.style.backgroundImage = [
        // Specular white highlight at cursor
        `radial-gradient(circle at ${px100}% ${py100}%, rgba(255,255,255,0.20) 0%, transparent 50%)`,
        // Iridescent rainbow band — hue shifts with mouse
        `linear-gradient(${angle}deg,
          hsla(${(baseHue +   0) % 360}deg,100%,65%,0.09),
          hsla(${(baseHue +  45) % 360}deg,100%,65%,0.09),
          hsla(${(baseHue +  90) % 360}deg,100%,65%,0.09),
          hsla(${(baseHue + 135) % 360}deg,100%,65%,0.09),
          hsla(${(baseHue + 180) % 360}deg,100%,65%,0.09),
          hsla(${(baseHue + 225) % 360}deg,100%,65%,0.09),
          hsla(${(baseHue + 270) % 360}deg,100%,65%,0.09),
          hsla(${(baseHue + 315) % 360}deg,100%,65%,0.09),
          hsla(${(baseHue + 360) % 360}deg,100%,65%,0.09))`,
      ].join(",");
    }

    // ── Ambient edge glow ────────────────────────────────────────────────
    if (glowRef.current) {
      const px100 = px * 100;
      const py100 = py * 100;
      glowRef.current.style.opacity = "1";
      glowRef.current.style.backgroundImage =
        `radial-gradient(circle at ${px100}% ${py100}%, rgba(138,43,226,0.30) 0%, rgba(0,217,255,0.12) 45%, transparent 70%)`;
    }
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    if (foilRef.current) foilRef.current.style.opacity = "0";
    if (glowRef.current) glowRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
        transformStyle: "preserve-3d",
        position: "relative",
        isolation: "isolate",
      }}
      className={className}
    >
      {children}

      {/* Holographic rainbow foil — screen blend so it brightens colours underneath */}
      <div
        ref={foilRef}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          opacity: 0,
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
          zIndex: 10,
          mixBlendMode: "screen",
        }}
      />

      {/* Ambient glow behind the card content */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          opacity: 0,
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
          zIndex: 9,
        }}
      />
    </div>
  );
}
