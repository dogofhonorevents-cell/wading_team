"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...rest }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-8 text-sm",
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27 viewBox=%270 0 12 8%27 fill=%27none%27><path d=%27M1 1l5 5 5-5%27 stroke=%27%2378716c%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/></svg>')]",
        "bg-[length:12px_8px] bg-[right_0.75rem_center] bg-no-repeat",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600",
        "disabled:cursor-not-allowed disabled:opacity-60",
        invalid
          ? "border-red-500 focus-visible:ring-red-500"
          : "border-stone-300",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";
