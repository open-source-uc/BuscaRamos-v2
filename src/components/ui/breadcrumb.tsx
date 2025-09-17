import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Navegación de migas de pan" 
      className={cn("flex", className)}
      role="navigation"
    >
      <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon 
                className="mx-2 h-4 w-4 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            {item.current || !item.href ? (
              <span 
                className="font-medium text-foreground"
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Structured data for breadcrumbs (SEO)
export function BreadcrumbStructuredData({ items }: BreadcrumbProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
      .filter(item => item.href)
      .map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://buscaramos.com'}${item.href}`
      }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}