import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/styles";
import { Badge } from "@/components/badge";

type SectionHeadingProps = PropsWithChildren<{
  eyebrow?: string;
  description?: ReactNode;
  align?: "left" | "center";
}>;

export function SectionHeading({ children, eyebrow, description, align = "left" }: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";

  return (
    <div className={cn("max-w-3xl space-y-4", alignment)}>
      {eyebrow && (
        <Badge
          variant="outline"
          className={cn(
            "text-xs uppercase tracking-wide text-slate-500",
            align === "center" ? "mx-auto" : ""
          )}
        >
          {eyebrow}
        </Badge>
      )}
      <h2 className={cn("text-3xl font-semibold text-slate-900", align === "center" && "mx-auto")}>{children}</h2>
      {description && <p className="text-base text-slate-600">{description}</p>}
    </div>
  );
}
