import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ScrollReveal({ children, delay = 0, direction = "up", className }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const initial = {
    opacity: 0,
    y: direction === "up" ? 48 : direction === "down" ? -48 : 0,
    x: direction === "left" ? 48 : direction === "right" ? -48 : 0,
    scale: 0.96,
  };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={visible ? { opacity: 1, y: 0, x: 0, scale: 1 } : initial}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}