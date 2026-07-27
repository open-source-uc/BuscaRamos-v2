import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputWithButtonVariants = cva(
  "relative cursor-pointer group block focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all",
  {
    variants: {
      variant: {
        default:
          "border border-border rounded-md hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary-foreground has-[:checked]:text-primary",
        blue: "border border-border rounded-md hover:border-blue-border has-[:checked]:border-blue-border has-[:checked]:bg-blue has-[:checked]:text-blue-foreground",
        green:
          "border border-border rounded-md hover:border-green-border has-[:checked]:border-green-border has-[:checked]:bg-green has-[:checked]:text-green-foreground",
        red: "border border-border rounded-md hover:border-red-border has-[:checked]:border-red-border has-[:checked]:bg-red has-[:checked]:text-red-foreground",
        orange:
          "border border-border rounded-md hover:border-orange-border has-[:checked]:border-orange-border has-[:checked]:bg-orange has-[:checked]:text-orange-foreground",
        purple:
          "border border-border rounded-md hover:border-purple-border has-[:checked]:border-purple-border has-[:checked]:bg-purple has-[:checked]:text-purple-foreground",
      },
      size: {
        default: "p-4",
        sm: "p-3",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconContainerVariants = cva("rounded-lg flex items-center justify-center border shrink-0", {
  variants: {
    variant: {
      default:
        "bg-transparent text-primary border-primary/20 group-has-[:checked]:bg-primary group-has-[:checked]:text-primary-foreground",
      blue: "bg-transparent text-blue-foreground border-blue-border group-has-[:checked]:bg-blue group-has-[:checked]:text-white",
      green:
        "bg-transparent text-green-foreground border-green-border group-has-[:checked]:bg-green-foreground group-has-[:checked]:text-white",
      red: "bg-transparent text-red-foreground border-red-border group-has-[:checked]:bg-red-foreground group-has-[:checked]:text-white",
      orange:
        "bg-transparent text-orange-foreground border-orange-border group-has-[:checked]:bg-orange-foreground group-has-[:checked]:text-white",
      purple:
        "bg-transparent text-purple-foreground border-purple-border group-has-[:checked]:bg-purple-foreground group-has-[:checked]:text-white",
    },
    size: {
      default: "p-2",
      sm: "p-1.5",
      lg: "p-2.5",
      xl: "p-3",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const iconVariants = cva("fill-current", {
  variants: {
    size: {
      default: "h-5 w-5",
      sm: "h-4 w-4",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface InputWithButtonProps
  extends
    Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "htmlFor">,
    VariantProps<typeof inputWithButtonVariants> {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  disabled?: boolean;
  "aria-describedby"?: string;
}

const InputWithButton = React.forwardRef<HTMLLabelElement, InputWithButtonProps>(
  (
    {
      className,
      variant,
      size,
      icon: Icon,
      title,
      subtitle,
      inputProps,
      disabled = false,
      "aria-describedby": ariaDescribedby,
      children,
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility
    const JSJKAS = React.useId();
    const titleId = React.useId();
    const subtitleId = React.useId();
    const inputId = inputProps.id || JSJKAS;

    // Build aria-describedby string
    const describedBy =
      [subtitle ? subtitleId : null, ariaDescribedby].filter(Boolean).join(" ") || undefined;

    const isDisabled = disabled || inputProps.disabled;

    return (
      <label
        ref={ref}
        htmlFor={inputId}
        className={cn(
          inputWithButtonVariants({ variant, size, className }),
          isDisabled && "pointer-events-none cursor-not-allowed opacity-50"
        )}
        aria-describedby={describedBy}
        {...props}
      >
        {/* Hidden input */}
        <input
          {...inputProps}
          id={inputId}
          disabled={isDisabled}
          className="sr-only"
          aria-describedby={describedBy}
        />

        {/* Visible content */}
        <div className="relative flex items-center gap-3">
          {Icon && (
            <div className={cn(iconContainerVariants({ variant, size }))} aria-hidden="true">
              <Icon className={cn(iconVariants({ size }))} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div
              id={titleId}
              className="text-foreground group-has-checked:text-foreground font-medium"
            >
              {title}
            </div>
            {subtitle && (
              <div
                id={subtitleId}
                className="text-muted-foreground group-has-checked:text-muted-foreground text-sm"
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {children}
      </label>
    );
  }
);
InputWithButton.displayName = "InputWithButton";

export { InputWithButton, inputWithButtonVariants, iconContainerVariants, iconVariants };
