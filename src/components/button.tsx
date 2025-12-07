import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement } from "react";
import { cn } from "@/lib/styles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  asChild?: boolean;
};

const VARIANT_STYLES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500",
  secondary: "bg-slate-900 text-white hover:bg-slate-800",
  ghost: "bg-transparent text-slate-200 hover:bg-slate-800/60",
};

export function Button({ className, variant = "primary", asChild, children, ...rest }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition",
    VARIANT_STYLES[variant],
    className
  );

  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error("Button with asChild expects a single React element child");
    }

    return cloneElement(children as ReactElement<{ className?: string }>, {
      className: cn(classes, (children as ReactElement<{ className?: string }>).props.className),
    });
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
