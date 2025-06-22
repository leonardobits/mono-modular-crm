"use client";

import { motion } from "framer-motion";

interface GridBackgroundProps {
  x: any;
  y: any;
}

export function GridBackground({ x, y }: GridBackgroundProps) {
  return (
    <>
      <motion.div
        className="absolute inset-0 z-0 h-full w-full opacity-60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
        style={{
          background: `radial-gradient(circle at ${x} ${y}, #3b82f680, #0D1117 20%)`,
        }}
        suppressHydrationWarning
      />
      <div
        className="absolute inset-0 z-0 h-full w-full opacity-40 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #8b5cf650 1px, transparent 1px)",
          backgroundSize: "2rem 2rem",
        }}
        suppressHydrationWarning
      />
    </>
  );
}
