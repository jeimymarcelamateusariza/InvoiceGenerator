"use client";

import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function DashboardHeader() {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <span>¡Bienvenido!</span>
          <span className="inline-block animate-bounce text-2xl sm:text-3xl">👋</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Seleccioná un módulo para comenzar a trabajar.
        </p>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <ThemeToggle />
        <div className="h-6 w-px bg-border hidden sm:block" />
        <div className="border border-border rounded-xl hover:border-destructive/40 transition-colors">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
