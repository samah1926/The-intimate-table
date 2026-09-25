"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Walking into a room: it rises gently out of the dark and comes into focus. */
export default function RoomTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985, filter: "blur(6px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.1, ease: [0.22, 0.61, 0.24, 1] }}
      style={{ transformOrigin: "50% 30%" }}
    >
      {children}
    </motion.div>
  );
}
