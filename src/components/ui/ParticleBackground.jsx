import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ParticleBackground — deep-space nebula using Three.js WebGL.
 * Drop-in replacement for the old 2D-canvas version.
 * Three.js (^0.171.0) is already installed; no new deps required.
 *
 * Visual layers (back → front):
 *  1. Nebula dust — large, low-opacity additive blobs (violet + cyan)
 *  2. Mid-field stars — medium points with blue / purple tints
 *  3. Foreground stars — tiny bright white-blue specks
 * Scene rotates slowly; camera follows mouse with soft lerp.
 */
export default function ParticleBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ─────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    // Make sure the canvas fills the mount div
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
    mount.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      120,
    );
    camera.position.z = 5;

    // ── Helper: build a Points layer ─────────────────────────────────────
    function makePoints({ count, rMin, rMax, sizeMin, sizeMax, opacity, blending, colorFn }) {
      const positions = new Float32Array(count * 3);
      const colors    = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        // Random point on a sphere shell
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const r     = rMin + Math.random() * (rMax - rMin);
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const [cr, cg, cb] = colorFn(Math.random());
        colors[i * 3]     = cr;
        colors[i * 3 + 1] = cg;
        colors[i * 3 + 2] = cb;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        vertexColors: true,
        transparent: true,
        opacity,
        sizeAttenuation: true,
        blending: blending ?? THREE.NormalBlending,
        depthWrite: false,
      });

      return new THREE.Points(geo, mat);
    }

    // ── Layer 1: Nebula dust (large additive blobs) ──────────────────────
    const nebula = makePoints({
      count: 350,
      rMin: 6, rMax: 18,
      sizeMin: 1.8, sizeMax: 3.0,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      colorFn: (t) =>
        t < 0.45
          ? [0.42, 0.08, 0.85]   // deep violet
          : t < 0.75
            ? [0.00, 0.55, 0.85] // cyan-blue
            : [0.55, 0.10, 0.70], // purple-pink
    });
    scene.add(nebula);

    // ── Layer 2: Mid-field stars (coloured) ──────────────────────────────
    const midStars = makePoints({
      count: 800,
      rMin: 10, rMax: 30,
      sizeMin: 0.06, sizeMax: 0.12,
      opacity: 0.65,
      colorFn: (t) =>
        t < 0.5
          ? [0.65, 0.75, 1.00]   // blue-white
          : t < 0.75
            ? [0.80, 0.55, 1.00] // lavender
            : [0.30, 0.55, 1.00], // cold blue
    });
    scene.add(midStars);

    // ── Layer 3: Foreground stars (tiny, bright) ─────────────────────────
    const fgStars = makePoints({
      count: 2200,
      rMin: 14, rMax: 40,
      sizeMin: 0.025, sizeMax: 0.055,
      opacity: 0.80,
      colorFn: (t) =>
        t < 0.65
          ? [0.92, 0.93, 1.00]   // near-white
          : t < 0.85
            ? [0.60, 0.70, 1.00] // blue-tinted
            : [0.82, 0.65, 1.00], // soft violet
    });
    scene.add(fgStars);

    // ── Layer 4: Bright nebula cores (tiny dense clusters) ───────────────
    const cores = makePoints({
      count: 60,
      rMin: 5, rMax: 12,
      sizeMin: 0.5, sizeMax: 1.2,
      opacity: 0.07,
      blending: THREE.AdditiveBlending,
      colorFn: (t) =>
        t < 0.5
          ? [0.20, 0.05, 1.00]   // indigo glow
          : [0.00, 0.80, 1.00],  // electric cyan
    });
    scene.add(cores);

    // ── Mouse parallax ────────────────────────────────────────────────────
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth  - 0.5) * 0.6;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────────────────────
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Slow scene rotation
      scene.rotation.y += 0.00007;
      scene.rotation.x += 0.000025;

      // Camera follows mouse softly
      camera.position.x += (targetX  - camera.position.x) * 0.025;
      camera.position.y += (-targetY - camera.position.y) * 0.025;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    />
  );
}
