import * as React from "react";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg border transition-all duration-150 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90",
        outline: "border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80",
        ghost: "border-transparent hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline border-transparent",
        // Course-specific variants
        green: "bg-green-light text-green border-green/20 hover:bg-green/10",
        red: "bg-red-light text-red border-red/20 hover:bg-red/10",
        purple: "bg-purple-light text-purple border-purple/20 hover:bg-purple/10",
        yellow: "bg-yellow-light text-yellow border-yellow/20 hover:bg-yellow/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size">,
    VariantProps<typeof iconButtonVariants> {
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: "left" | "right";
  loading?: boolean;
  loadingText?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    icon: Icon, 
    iconPosition = "left", 
    loading = false,
    loadingText,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const iconClass = cn(
      size === "icon" || size === "icon-sm" ? "h-4 w-4" : "h-4 w-4 sm:h-5 sm:w-5",
      "flex-shrink-0"
    );

    const content = (
      <>
        {loading && (
          <div className={cn(iconClass, "animate-spin rounded-full border-2 border-current border-t-transparent")} />
        )}
        {!loading && Icon && iconPosition === "left" && (
          <Icon className={iconClass} />
        )}
        {children && (
          <span className={cn(loading && loadingText && "sr-only")}>
            {loading && loadingText ? loadingText : children}
          </span>
        )}
        {!loading && Icon && iconPosition === "right" && (
          <Icon className={iconClass} />
        )}
      </>
    );

    return (
      <button
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants, type IconButtonProps };