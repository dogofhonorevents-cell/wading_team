import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "neutral"
  | "booked"
  | "tentative"
  | "new"
  | "primary"
  | "secondary"
  | "confirmed";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral: "bg-stone-100 text-sage-700 border-stone-200",
  booked: "bg-emerald-700 text-white border-emerald-700",
  tentative:
    "bg-rose-100 text-rose-800 border-rose-200",
  new: "bg-blush-100 text-sage-800 border-blush-300",
  primary: "bg-sage-900 text-blush-300 border-sage-900",
  secondary: "bg-stone-200 text-sage-700 border-stone-300",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function Badge({
  className,
  tone = "neutral",
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
        toneClasses[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
