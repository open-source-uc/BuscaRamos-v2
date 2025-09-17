import * as React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconVariant?: "purple" | "green" | "red" | "yellow";
  className?: string;
  children: React.ReactNode;
}

const iconVariantStyles = {
  purple: "bg-purple-light text-purple border-purple/20",
  green: "bg-green-light text-green border-green/20", 
  red: "bg-red-light text-red border-red/20",
  yellow: "bg-yellow-light text-yellow border-yellow/20",
};

export function FormSection({ 
  title, 
  description, 
  icon: Icon, 
  iconVariant = "purple",
  className,
  children 
}: FormSectionProps) {
  return (
    <div className={cn("border-border rounded-md border p-3 sm:p-6", className)}>
      <div className="mb-4">
        <h3 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold">
          {Icon && (
            <div className={cn(
              "rounded-lg border p-2",
              iconVariantStyles[iconVariant]
            )}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
            </div>
          )}
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

interface FormFieldGroupProps {
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormFieldGroup({ 
  label, 
  description, 
  required, 
  error, 
  className,
  children 
}: FormFieldGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          required && "after:content-['*'] after:ml-0.5 after:text-red"
        )}>
          {label}
        </label>
      )}
      {description && (
        <p className="text-muted-foreground text-xs">
          {description}
        </p>
      )}
      {children}
      {error && (
        <p className="text-red text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

interface FormRowProps {
  columns?: 1 | 2 | 3;
  gap?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

export function FormRow({ 
  columns = 2, 
  gap = "md", 
  className,
  children 
}: FormRowProps) {
  const gapStyles = {
    sm: "gap-2",
    md: "gap-4", 
    lg: "gap-6",
  };

  const columnStyles = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={cn(
      "grid",
      columnStyles[columns],
      gapStyles[gap],
      className
    )}>
      {children}
    </div>
  );
}