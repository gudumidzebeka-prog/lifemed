import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lifemed-400 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.98]",
          {
            "gradient-primary text-white shadow-md shadow-lifemed-500/20 hover:shadow-lg hover:shadow-lifemed-500/30":
              variant === "primary",
            "bg-surface-elevated text-foreground border border-border hover:bg-lifemed-50 dark:hover:bg-lifemed-950/30":
              variant === "secondary",
            "text-muted hover:text-foreground hover:bg-surface-elevated": variant === "ghost",
            "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20": variant === "danger",
            "border border-border bg-transparent hover:bg-surface-elevated": variant === "outline",
            "h-9 px-4 text-sm": size === "sm",
            "h-11 px-5 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10": size === "icon",
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

export { Button };
