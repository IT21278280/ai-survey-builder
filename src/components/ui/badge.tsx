import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-indigo-100 text-indigo-700 border-transparent",
  secondary: "bg-zinc-100 text-zinc-700 border-transparent",
  success: "bg-green-100 text-green-700 border-transparent",
  warning: "bg-yellow-100 text-yellow-700 border-transparent",
  danger: "bg-red-100 text-red-700 border-transparent",
  outline: "border border-zinc-300 text-zinc-700 bg-transparent",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
