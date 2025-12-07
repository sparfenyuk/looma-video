import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/styles";

type CardProps = PropsWithChildren<{
  title?: string;
  description?: ReactNode;
  className?: string;
  footer?: ReactNode;
}>;

export function Card({ title, description, children, className, footer }: CardProps) {
  return (
    <div className={cn("rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm", className)}>
      {(title || description) && (
        <div className="mb-6 space-y-1">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {description && <p className="text-sm text-slate-600">{description}</p>}
        </div>
      )}
      <div className="space-y-4 text-sm text-slate-700">{children}</div>
      {footer && <div className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-500">{footer}</div>}
    </div>
  );
}
