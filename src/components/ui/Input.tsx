import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1 w-full">
        {label && <label className="text-sm font-medium text-text-2">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-md border border-border bg-void px-3 py-2 text-sm text-text-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-blue disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-brand-red focus-visible:ring-brand-red",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-brand-red">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
