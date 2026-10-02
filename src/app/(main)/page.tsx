import React from "react";
import { FileText, MapPin } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NavigationCard } from "@/components/dashboard/NavigationCard";

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 justify-between gap-8">
      {/* Header section */}
      <DashboardHeader />

      {/* Main Content: Module Cards */}
      <main className="my-auto py-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200">
            ¿Qué querés gestionar hoy?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Accedé rápidamente a la gestión de facturas o a las rutas de entrega asignadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <NavigationCard
            title="Facturas"
            description="Consultá y gestioná las facturas de clientes, estados de cobro, vistas previas e impresión de comprobantes."
            href="/invoices"
            icon={<FileText className="w-7 h-7 sm:w-8 sm:h-8" />}
            badge="Módulo Principal"
            actionText="Ir a Facturas"
          />

          <NavigationCard
            title="Rutas de Entrega"
            description="Controlá la secuencia de visitas por clientes, ordenamiento de entregas y estado operacional de rutas."
            href="/rutas"
            icon={<MapPin className="w-7 h-7 sm:w-8 sm:h-8" />}
            badge="Módulo Operaciones"
            actionText="Ir a Rutas"
          />
        </div>
      </main>

      {/* Footer info */}
      <footer className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
        Invoice & Route Generator System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
