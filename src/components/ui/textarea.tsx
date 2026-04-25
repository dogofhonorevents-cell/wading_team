"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 3, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "flex w-full rounded-lg border bg-white px-3 py-2 text-sm",
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

Textarea.displayName = "Textarea";
