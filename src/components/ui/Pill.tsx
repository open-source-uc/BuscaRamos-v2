import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pillVariants = cva("inline-flex items-center rounded-lg border font-medium", {
  variants: {
    variant: {
      blue: "bg-primary-foreground text-primary border-primary/20",
      pink: "bg-pink text-pink-foreground border-pink-border",
      green: "bg-green text-green-foreground border-green-border",
      purple: "bg-purple text-purple-foreground border-purple-border",
      orange: "bg-orange text-orange-foreground border-orange-border",
      red: "bg-red text-red-foreground border-red-border",
      yellow: "bg-yellow text-yellow-foreground border-yellow-border",
      ghost_blue: "bg-transparent text-muted-foreground border-border",
      ghost_pink: "bg-transparent text-muted-foreground border-border",
      ghost_green: "bg-transparent text-muted-foreground border-border",
      ghost_purple: "bg-transparent text-muted-foreground border-border",
      ghost_orange: "bg-transparent text-muted-foreground border-border",
      ghost_red: "bg-transparent text-muted-foreground border-border",
      ghost_yellow: "bg-transparent text-muted-foreground border-border",
      schedule_blue: "bg-primary-foreground text-primary border-primary/20 rounded-sm",
      schedule_pink: "bg-pink text-pink-foreground border-pink-border rounded-sm",
      schedule_green: "bg-green text-green-foreground border-green-border rounded-sm",
      schedule_purple: "bg-purple text-purple-foreground border-purple-border rounded-sm",
      schedule_orange: "bg-orange text-orange-foreground border-orange-border rounded-sm",
      schedule_red: "bg-red text-red-foreground border-red-border rounded-sm",
      schedule_yellow: "bg-yellow text-yellow-foreground border-yellow-border rounded-sm",
    },
    size: {
      xs: "gap-1 px-2 py-0.5 text-xs",
      sm: "gap-1 px-2 py-1 text-xs",
      md: "gap-2 px-3 py-1.5 text-sm",
      lg: "gap-2 px-4 py-2 text-base",
      xl: "gap-3 px-5 py-2.5 text-lg",
    },
  },
  defaultVariants: {
    variant: "blue",
    size: "md",
  },
});

export interface PillProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof pillVariants> {
  icon?: React.ComponentType<{ className?: string }>;
}

const Pill = React.forwardRef<HTMLDivElement, PillProps>(
  ({ className, variant, size, icon: Icon, children, ...props }, ref) => {
    const iconSize =
      size === "xs"
        ? "h-3 w-3 min-w-[0.75rem] min-h-[0.75rem]"
        : size === "sm"
          ? "h-3 w-3 min-w-[0.75rem] min-h-[0.75rem]"
          : size === "lg"
            ? "h-5 w-5 min-w-[1.25rem] min-h-[1.25rem]"
            : size === "xl"
              ? "h-6 w-6 min-w-[1.5rem] min-h-[1.5rem]"
              : "h-4 w-4 min-w-[1rem] min-h-[1rem]";

    // Determine icon color for ghost variants
    const getIconColor = () => {
      if (!variant?.startsWith("ghost_")) return "fill-current";

      switch (variant) {
        case "ghost_blue":
          return "fill-primary";
        case "ghost_pink":
          return "fill-pink";
        case "ghost_green":
          return "fill-green";
        case "ghost_purple":
          return "fill-purple";
        case "ghost_orange":
          return "fill-orange";
        case "ghost_red":
          return "fill-red";
        default:
          return "fill-current";
      }
    };

    return (
      <div className={cn(pillVariants({ variant, size, className }))} ref={ref} {...props}>
        {Icon && <Icon className={`${iconSize} ${getIconColor()} shrink-0`} />}
        {children}
      </div>
    );
  }
);
Pill.displayName = "Pill";

export { Pill, pillVariants };
