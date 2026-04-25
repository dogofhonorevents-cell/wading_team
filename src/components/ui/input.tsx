"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm",
        "placeholder:text-stone-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-600",
        "disabled:cursor-not-allowed disabled:opacity-60",
        invalid
          ? "border-red-500 focus-visible:ring-red-500"
          : "border-stone-300",
        className
      )}
      {...rest}
    />
  )
);

Input.displayName = "Input";
