"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const directionMap = {
    up: { y: 16, x: 0 },
    left: { x: -16, y: 0 },
    right: { x: 16, y: 0 },
  };

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    // The "left"/"right" initial state translates x by ±16px before it's
    // revealed — every not-yet-scrolled-into-view instance on the page sits
    // at that offset simultaneously, which was enough to widen the page's
    // scrollable area and produce a second (horizontal) scrollbar. Rather
    // than rely on some ancestor clipping it correctly, this wrapper clips
    // the transform locally so ScrollReveal can never leak overflow
    // regardless of where it's used. className moves here (not the animated
    // child) so existing layout classes like grid column spans still apply
    // to the right box.
    <div className={`overflow-x-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 0, ...directionMap[direction], filter: "blur(4px)" }}
        whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
