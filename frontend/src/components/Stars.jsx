import { Star } from "lucide-react";

export default function Stars({ value = 0, size = 14, className = "" }) {
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={i <= Math.round(value) ? "text-amber-500" : "text-zinc-200"}
          style={{ width: size, height: size }}
          fill={i <= Math.round(value) ? "#f59e0b" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
