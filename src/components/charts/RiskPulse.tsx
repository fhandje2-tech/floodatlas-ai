import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface RiskPulseProps {
  score: number;
  className?: string;
}

export function RiskPulse({ score, className }: RiskPulseProps) {
  // Score > 70 → red, 2.4s pulse
  // Score 30–70 → amber, static
  // Score < 30 → teal, 3.2s breathe

  let color = "var(--teal)";
  let pulseAnimate = {};
  let transition = {};

  if (score > 70) {
    color = "var(--red)";
    pulseAnimate = { scale: [1, 1.04, 1], opacity: [1, 0.7, 1] };
    transition = { duration: 2.4, repeat: Infinity, ease: "easeInOut" };
  } else if (score >= 30) {
    color = "var(--amber)";
    pulseAnimate = {};
  } else {
    color = "var(--teal)";
    pulseAnimate = { scale: [1, 1.02, 1], opacity: [1, 0.85, 1] };
    transition = { duration: 3.2, repeat: Infinity, ease: "easeInOut" };
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: 140, height: 140 }}>
      <motion.svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        className="absolute inset-0"
        animate={pulseAnimate}
        transition={transition}
      >
        <circle
          cx="70"
          cy="70"
          r="66"
          fill="none"
          stroke={color}
          strokeWidth="8"
        />
      </motion.svg>
      <span className="font-data font-bold text-text-1 z-10" style={{ fontSize: '48px' }}>
        {score}
      </span>
    </div>
  );
}
