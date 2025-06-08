"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform } from "framer-motion";
import React from "react";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
  showRadialGradient?: boolean;
  [key: string]: any;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const x = useTransform(mouseX, (val) => `${val}px`);
  const y = useTransform(mouseY, (val) => `${val}px`);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    if (!currentTarget) return;
    const { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "relative flex h-full min-h-screen w-full flex-col bg-background text-foreground transition-colors duration-300",
        className
      )}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className={cn(
            `
            [--aurora-gradient:repeating-linear-gradient(100deg,var(--aurora-primary)_0%,var(--aurora-secondary)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--aurora-primary)_16%)]
            [background-image:var(--aurora-gradient)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter-blur-[10px]
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--aurora-gradient)]
            after:[background-size:200%,_100%]
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute
            -inset-0.5
            opacity-50
            will-change-transform`
          )}
        />
      </div>
      {showRadialGradient && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 hidden [--size:400px] lg:block"
          style={
            {
              "--x": x,
              "--y": y,
              background:
                "radial-gradient(var(--size) circle at var(--x) var(--y), var(--aurora-secondary), transparent 100%)",
            } as React.CSSProperties
          }
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}; 