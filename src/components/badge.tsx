import type { PropsWithChildren } from "react";
import { cn } from "@/lib/styles";

type BadgeProps = PropsWithChildren<{
  variant?: "default" | "outline";
  className?: string;
}>;

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variant === "default"
          ? "bg-blue-100 text-blue-700"
          : "border border-slate-200 bg-white text-slate-600",
        className
      )}
    >
      {children}
    </span>
  );
}
