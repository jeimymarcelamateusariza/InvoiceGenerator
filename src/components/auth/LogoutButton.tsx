"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { usePermissions } from "@/context/PermissionsContext";

export function LogoutButton() {
  const { logout } = usePermissions();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      type="button"
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      Cerrar sesión
    </button>
  );
}
