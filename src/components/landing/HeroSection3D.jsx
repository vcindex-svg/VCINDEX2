import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createPageUrl } from "@/utils";
import { ArrowRight, Zap } from "lucide-react";
import CyclingText from "@/components/ui/CyclingText";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import SquishyButton from "@/components/ui/SquishyButton";

export default function HeroSection3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ── Neural sphere ──
    const group = new THREE.Group();
    scene.add(group);

    const RADIUS = 2.2;
    const NUM_NODES = 90;
    const nodePositions = [];

    for (let i = 0; i < NUM_NODES; i++) {
      const theta = Math.acos(1 - 2 * (i + 0.5) / NUM_NODES);
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;
      nodePositions.push(new THREE.Vector3(
        RADIUS * Math.sin(theta) * Math.cos(phi),
        RADIUS * Math.sin(theta) * Math.sin(phi),
        RADIUS * Math.cos(theta)
      ));
    }

    // Nodes (points)
    const pGeo = new THREE.BufferGeometry().setFromPoints(nodePositions);
    const pMat = new THREE.PointsMaterial({
      color: 0xa78bfa,
      size: 0.055,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    group.add(new THREE.Points(pGeo, pMat));

    // Connections
    const linePts = [];
    const MAX_DIST = 1.6;
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < MAX_DIST) {
          linePts.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
          linePts.push(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z);
        }
      }
    }
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePts, 3));
    const lMat = new THREE.LineBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    group.add(new THREE.LineSegments(lGeo, lMat));

    // Outer glow ring
    const ringGeo = new THREE.TorusGeometry(2.6, 0.008, 4, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 4;
    group.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.005, 4, 120),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending })
    );
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.y = Math.PI / 5;
    group.add(ring2);

    // Floating ambient particles
    const ambientPts = [];
    for (let i = 0; i < 200; i++) {
      ambientPts.push(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8
      );
    }
    const ambGeo = new THREE.BufferGeometry();
    ambGeo.setAttribute("position", new THREE.Float32BufferAttribute(ambientPts, 3));
    const ambMat = new THREE.PointsMaterial({
      color: 0x6d28d9,
      size: 0.03,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(ambGeo, ambMat));

    // Mouse parallax
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 0.8;
      mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 0.5;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Resize
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // Animate
    let animId;
    let t = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.005;

      // Smooth mouse follow
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      group.rotation.y = t * 0.15 + mouse.x;
      group.rotation.x = Math.sin(t * 0.3) * 0.1 + mouse.y;
      ring1.rotation.z += 0.003;
      ring2.rotation.z -= 0.002;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* 3D Canvas */}
      <div
        ref={mountRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Radial glow behind sphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Hero content */}
      <div className="relative px-4 text-center max-w-4xl mx-auto" style={{ zIndex: 2 }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Built by vibers, for everyone
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6">
          <span className="text-foreground">Discover</span>{" "}
          <CyclingText words={["AI-Powered", "Vibe-Coded", "Next-Gen", "Indie"]} />
          <br />
          <span className="text-foreground">Tools by Vibe Coders</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          The curated marketplace for next-gen tools, apps, and systems — built with AI, discovered by humans.
          No sign-up required to browse.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href={createPageUrl("Marketplace")}>
            <SquishyButton variant="primary">
              Explore Tools <ArrowRight className="w-4 h-4" />
            </SquishyButton>
          </a>
          <a href={createPageUrl("CreatorSignup")}>
            <SquishyButton variant="outline">
              <Zap className="w-4 h-4 text-primary" /> List Your Tool
            </SquishyButton>
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-16 flex-wrap">
          {[
            { label: "Tools Listed",  to: 500,  suffix: "+" },
            { label: "Categories",    to: 10,   suffix: ""  },
            { label: "Vibe Coders",   to: 120,  suffix: "+" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold gradient-text">
                <AnimatedCounter to={s.to} suffix={s.suffix} />
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}