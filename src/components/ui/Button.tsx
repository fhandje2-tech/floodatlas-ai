import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-brand-blue text-text-1 hover:bg-brand-blue-dim shadow-glow-blue": variant === "primary",
            "bg-elevated text-text-1 hover:bg-surface border border-border": variant === "secondary",
            "bg-transparent text-text-2 hover:text-text-1 hover:bg-elevated": variant === "ghost",
            "border border-border bg-transparent hover:bg-elevated text-text-1": variant === "outline",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-4 py-2 text-sm": size === "md",
            "h-14 px-8 text-base": size === "lg",
            "w-full": fullWidth,
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
