"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
}

const sizeMap = {
  sm: { icon: 28, text: "text-base", gap: "gap-2" },
  md: { icon: 36, text: "text-xl", gap: "gap-2.5" },
  lg: { icon: 44, text: "text-2xl", gap: "gap-3" },
} as const;

export default function Logo({ size = "md", theme = "light" }: LogoProps) {
  const s = sizeMap[size];
  const textColor = theme === "dark" ? "text-white" : "text-charcoal";

  return (
    <div className={`flex items-center ${s.gap}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Olive rounded square background */}
        <rect width="44" height="44" rx="12" fill="#4A5C3A" />
        {/* Gold circle outline */}
        <circle cx="22" cy="18" r="8" stroke="#C9A84C" strokeWidth="2.5" fill="none" />
        {/* Gold vertical line below circle (pin/person) */}
        <line x1="22" y1="28" x2="22" y2="37" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className={`font-extrabold tracking-tight ${s.text} ${textColor}`}>
        <span className="text-[1.1em]">W</span>atan
      </span>
    </div>
  );
}
