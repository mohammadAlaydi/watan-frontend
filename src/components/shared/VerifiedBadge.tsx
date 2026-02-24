import { Check } from "lucide-react";

interface VerifiedBadgeProps {
  label?: string;
  className?: string;
}

export default function VerifiedBadge({
  label = "Verified",
  className = "",
}: VerifiedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-olive-pale px-2.5 py-0.5 text-xs font-semibold text-olive ${className}`}
    >
      <Check className="h-3 w-3" />
      {label}
    </span>
  );
}
