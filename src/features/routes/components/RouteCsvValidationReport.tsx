'use client';

import { useState } from 'react';
import type { CsvValidationReport } from '../services/csvRouteOrderingService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Layers,
  Users,
  DollarSign,
  XCircle,
  Info,
} from 'lucide-react';

interface RouteCsvValidationReportProps {
  report: CsvValidationReport;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function RouteCsvValidationReport({ report }: RouteCsvValidationReportProps) {
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});

  const toggleExpandClient = (clientId: string) => {
    setExpandedClients((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  // BLOCKING ERROR VIEW
  if (!report.isValid) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-6 w-6 shrink-0" />
            <div>
              <CardTitle className="text-lg text-destructive">
                Error Bloqueante de Validaciones CSV
              </CardTitle>
              <CardDescription className="text-destructive/80 text-xs">
                El archivo CSV contiene errores estructurales que impiden generar la lista de facturas ordenadas.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {report.blockingErrors.map((err, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-destructive/30 bg-background text-sm space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
                    {err.code}
                  </span>
                  {err.lineNumbers && err.lineNumbers.length > 0 && (
                    <span className="text-xs font-mono font-semibold text-muted-foreground">
                      {err.lineNumbers.length === 1
                        ? `Línea ${err.lineNumbers[0]}`
                        : `Líneas: ${err.lineNumbers.join(', ')}`}
                    </span>
                  )}
                </div>
                <p className="font-medium text-foreground">{err.message}</p>
                {err.details && (
                  <p className="text-xs text-muted-foreground font-mono">{err.details}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // VALID / WARNINGS VIEW
  const hasWarnings = report.warnings.length > 0;

  return (
    <div className="space-y-6">
      {/* Status & Summary Metrics Card */}
      <Card className={hasWarnings ? 'border-amber-300 dark:border-amber-800' : 'border-emerald-300 dark:border-emerald-800'}>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {hasWarnings ? (
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <div>
                <CardTitle className="text-lg">
                  {hasWarnings ? 'Validación Completada con Advertencias' : 'Validación Completada Exitosamente'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {hasWarnings
                    ? 'Se detectaron discrepancias entre el CSV y la ruta, pero la lista de facturas ordenadas fue generada correctamente.'
                    : 'Todas las entradas del CSV coinciden perfectamente con los clientes y facturas activas de la ruta.'}
                </CardDescription>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                hasWarnings
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              }`}
            >
              {hasWarnings ? 'Con Advertencias' : 'Ordenamiento Aplicado'}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/40 border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Clientes Ordenados</p>
                <p className="text-xl font-bold font-mono text-foreground">
                  {report.totalMatchedClients}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Facturas Totales</p>
                <p className="text-xl font-bold font-mono text-foreground">
                  {report.totalOrderedInvoices}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Monto Grand Total</p>
                <p className="text-xl font-bold font-mono text-foreground">
                  {formatCurrency(report.grandTotalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Discrepancy Warnings Summary Cards */}
          {hasWarnings && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Resumen de Discrepancias
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* CSV Clients Without Active Route Invoices */}
                {report.discrepancies.clientsWithoutInvoices.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-300 dark:border-amber-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-900 dark:text-amber-200">
                        Clientes en CSV sin Factura Activa ({report.discrepancies.clientsWithoutInvoices.length})
                      </span>
                    </div>
                    <p className="text-amber-800/80 dark:text-amber-300/80">
                      Entradas en el CSV que no tienen facturas activas encontradas en la ruta.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {report.discrepancies.clientsWithoutInvoices.map((cid) => (
                        <span
                          key={cid}
                          className="font-mono bg-background text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800"
                        >
                          {cid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Route Clients Omitted from CSV */}
                {report.discrepancies.routeClientsNotInCsv.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-300 dark:border-blue-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-900 dark:text-blue-200">
                        Clientes de Ruta Omitidos en CSV ({report.discrepancies.routeClientsNotInCsv.length})
                      </span>
                    </div>
                    <p className="text-blue-800/80 dark:text-blue-300/80">
                      Clientes de la ruta con facturas activas no incluidos en el archivo CSV subido.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {report.discrepancies.routeClientsNotInCsv.map((cid) => (
                        <span
                          key={cid}
                          className="font-mono bg-background text-blue-900 dark:text-blue-200 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800"
                        >
                          {cid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ordered Client Invoices Table / List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Facturas Reordenadas por CSV</CardTitle>
            </div>
            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded border">
              Orden Ascendente (1...N)
            </span>
          </div>
          <CardDescription>
            Lista de clientes y facturas ordenadas strictly según la columna{' '}
            <code className="font-mono text-xs font-bold">orden</code> del archivo CSV.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {report.orderedClients.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-2">
              <Info className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-medium">No hay facturas coincidentes para mostrar.</p>
            </div>
          ) : (
            <div className="divide-y border-t">
              {report.orderedClients.map((client) => {
                const isExpanded = !!expandedClients[client.clientId];

                return (
                  <div key={client.clientId} className="transition-colors hover:bg-muted/30">
                    <div
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                      onClick={() => toggleExpandClient(client.clientId)}
                    >
                      {/* Left side: Orden Badge & Client ID */}
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm bg-primary/10 text-primary px-3 py-1 rounded-md border border-primary/20 shrink-0">
                          #{client.orden}
                        </span>

                        <div className="font-mono font-semibold text-sm bg-muted/80 px-2.5 py-1 rounded border">
                          {client.clientId}
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          {client.invoices.length} Factura{client.invoices.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Right side: Amount & Expand toggle */}
                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>
                            Total Cliente:{' '}
                            <strong className="text-foreground font-mono text-sm">
                              {formatCurrency(client.totalAmount)}
                            </strong>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandClient(client.clientId);
                          }}
                          className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Invoices List */}
                    {isExpanded && (
                      <div className="bg-muted/40 p-4 border-t space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Facturas Asociadas ({client.invoices.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {client.invoices.map((inv) => (
                            <div
                              key={inv.id}
                              className="bg-background border rounded-lg p-3 space-y-2 text-sm shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-primary flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5" />
                                  {inv.id}
                                </span>
                                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded">
                                  {inv.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t">
                                <div>
                                  <span>Fecha Emisión:</span>
                                  <p className="text-foreground font-medium">
                                    {inv.issue_date || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <span>Vencimiento:</span>
                                  <p className="text-foreground font-medium">
                                    {inv.due_date || 'N/A'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t text-xs">
                                <span className="text-muted-foreground">Monto Total:</span>
                                <span className="font-mono font-bold text-sm text-foreground">
                                  {formatCurrency(inv.total_amount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
