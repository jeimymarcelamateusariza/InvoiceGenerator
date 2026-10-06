"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface NavigationCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  actionText?: string;
  color?: "default" | "primary" | "success" | "warning" | "destructive" | "info";
}

export function NavigationCard({
  title,
  description,
  href,
  icon,
  badge,
  actionText = "Ir al módulo",
  color = "primary",
}: NavigationCardProps) {
  return (
    <Link href={href} className="block group/nav h-full">
      <Card
        variant="highlight"
        color={color}
        className="h-full justify-between p-6 sm:p-8 cursor-pointer transition-all duration-300"
      >
        <CardContent className="p-0 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 group-hover/nav:bg-primary group-hover/nav:text-white transition-colors duration-200">
                {icon}
              </div>
              {badge && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground">
                  {badge}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover/nav:text-primary transition-colors">
              {title}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </CardContent>

        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between font-semibold text-sm text-primary">
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/nav:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}
