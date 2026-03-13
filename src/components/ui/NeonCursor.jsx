import { useEffect, useRef } from "react";

/**
 * NeonCursor — replaces the OS cursor with a glowing neon dot + lagging ring.
 * • Cyan dot: snaps instantly to pointer position.
 * • Violet ring: follows with a soft lerp (feels magnetic).
 * • Ring scales up + brightens when hovering interactive elements.
 * • Auto-disabled on touch devices (won't hide the cursor on mobile).
 * No deps beyond React.
 */
export default function NeonCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Skip on touch-only devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Hide the default system cursor globally
    document.body.style.cursor = "none";

    let mouseX = window.innerWidth  / 2;
    let mouseY = window.innerHeight / 2;
    let ringX  = mouseX;
    let ringY  = mouseY;
    let animId;
    let isOverInteractive = false;

    // ── Dot: instant ─────────────────────────────────────────────────────
    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };
    document.addEventListener("mousemove", onMouseMove);

    // ── Ring: lerp ────────────────────────────────────────────────────────
    const loop = () => {
      ringX += (mouseX - ringX) * 0.13;
      ringY += (mouseY - ringY) * 0.13;
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      animId = requestAnimationFrame(loop);
    };
    loop();

    // ── Interactive hover: ring enlarge ──────────────────────────────────
    const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label, summary";

    const onOver = (e) => {
      if (e.target.closest(INTERACTIVE) && !isOverInteractive) {
        isOverInteractive = true;
        ring.style.width          = "52px";
        ring.style.height         = "52px";
        ring.style.borderColor    = "rgba(138,43,226,0.80)";
        ring.style.boxShadow      =
          "0 0 16px rgba(138,43,226,0.6), 0 0 32px rgba(138,43,226,0.25), inset 0 0 10px rgba(0,217,255,0.15)";
        ring.style.opacity        = "0.85";
        dot.style.background      = "rgba(138,43,226,0.95)";
        dot.style.boxShadow       =
          "0 0 8px rgba(138,43,226,1), 0 0 18px rgba(138,43,226,0.6)";
      }
    };
    const onOut = (e) => {
      if (e.target.closest(INTERACTIVE) && isOverInteractive) {
        const related = e.relatedTarget;
        if (!related || !related.closest?.(INTERACTIVE)) {
          isOverInteractive = false;
          resetStyles();
        }
      }
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout",  onOut);

    // ── Click flash ───────────────────────────────────────────────────────
    const onClick = () => {
      dot.style.transform += " scale(2.5)";
      dot.style.opacity = "0.4";
      setTimeout(() => {
        dot.style.opacity = "1";
      }, 150);
    };
    document.addEventListener("mousedown", onClick);

    // ── Hide cursor when leaving window ───────────────────────────────────
    const onLeave = () => { dot.style.opacity = "0"; ring.style.opacity = "0"; };
    const onEnter = () => {
      dot.style.opacity  = "1";
      ring.style.opacity = isOverInteractive ? "0.85" : "0.55";
    };
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    function resetStyles() {
      ring.style.width       = "40px";
      ring.style.height      = "40px";
      ring.style.borderColor = "rgba(0,217,255,0.60)";
      ring.style.boxShadow   =
        "0 0 10px rgba(0,217,255,0.35), 0 0 20px rgba(0,217,255,0.12), inset 0 0 6px rgba(138,43,226,0.10)";
      ring.style.opacity     = "0.55";
      dot.style.background   = "rgba(0,217,255,0.95)";
      dot.style.boxShadow    =
        "0 0 8px rgba(0,217,255,1), 0 0 18px rgba(0,217,255,0.55)";
    }

    return () => {
      document.body.style.cursor = "";
      cancelAnimationFrame(animId);
      document.removeEventListener("mousemove",  onMouseMove);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mouseout",   onOut);
      document.removeEventListener("mousedown",  onClick);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <>
      {/* Neon dot — snaps to pointer */}
      <div
        ref={dotRef}
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         8,
          height:        8,
          borderRadius:  "50%",
          background:    "rgba(0,217,255,0.95)",
          boxShadow:     "0 0 8px rgba(0,217,255,1), 0 0 18px rgba(0,217,255,0.55)",
          zIndex:        99999,
          pointerEvents: "none",
          willChange:    "transform",
          transition:    "background 0.2s, box-shadow 0.2s, opacity 0.15s",
        }}
      />

      {/* Neon ring — lags behind with lerp */}
      <div
        ref={ringRef}
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         40,
          height:        40,
          borderRadius:  "50%",
          border:        "1.5px solid rgba(0,217,255,0.60)",
          boxShadow:     "0 0 10px rgba(0,217,255,0.35), 0 0 20px rgba(0,217,255,0.12), inset 0 0 6px rgba(138,43,226,0.10)",
          zIndex:        99999,
          pointerEvents: "none",
          willChange:    "transform",
          opacity:       0.55,
          transition:    "width 0.25s cubic-bezier(0.22,1,0.36,1), height 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.2s, box-shadow 0.2s, opacity 0.15s",
        }}
      />
    </>
  );
}
