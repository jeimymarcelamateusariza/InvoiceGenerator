"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showThemeToggle?: boolean;
}

export function Breadcrumbs({ items, showThemeToggle = true }: BreadcrumbsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-border">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
        >
          <Home className="w-4 h-4 text-primary" />
          <span>Inicio</span>
        </Link>

        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            {item.href ? (
              <Link
                href={item.href}
                className="font-medium hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground px-2 py-1">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {showThemeToggle && (
        <div className="self-end sm:self-center">
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}
