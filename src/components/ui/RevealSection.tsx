"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
}

export default function RevealSection({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: Props) {
  const initial =
    direction === "up"    ? { opacity: 0, y: 48 }    :
    direction === "left"  ? { opacity: 0, x: -48 }   :
    direction === "right" ? { opacity: 0, x: 48 }    :
                            { opacity: 0 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.72,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
