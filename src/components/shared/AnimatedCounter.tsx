"use client";

import { useEffect, useRef, useState } from "react";
import {
  useMotionValue,
  useInView,
  animate,
} from "framer-motion";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}

export default function AnimatedCounter({
  end,
  duration = 2,
  suffix = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(motionValue, end, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplay(
          latest >= 1000
            ? `${(latest / 1000).toFixed(latest >= 10000 ? 0 : 1)}k`
            : Math.round(latest).toString()
        );
      },
    });

    return () => controls.stop();
  }, [isInView, end, duration, motionValue]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
