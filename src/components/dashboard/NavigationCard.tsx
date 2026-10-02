"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface NavigationCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  actionText?: string;
}

export function NavigationCard({
  title,
  description,
  href,
  icon,
  badge,
  actionText = "Ir al módulo",
}: NavigationCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-primary/60 dark:hover:border-primary/60 transition-all duration-200 hover:-translate-y-1"
    >
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="p-3.5 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-purple-300 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
            {icon}
          </div>
          {badge && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700/80 dark:text-slate-300">
              {badge}
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
          {title}
        </h2>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between font-semibold text-sm text-primary dark:text-purple-300">
        <span>{actionText}</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
