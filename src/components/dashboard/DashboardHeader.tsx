"use client";

import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function DashboardHeader() {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <span>¡Bienvenido!</span>
          <span className="inline-block animate-bounce text-2xl sm:text-3xl">👋</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Seleccioná un módulo para comenzar a trabajar.
        </p>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <ThemeToggle />
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700/80 hidden sm:block" />
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
