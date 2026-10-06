'use client';

import { useState, useEffect } from 'react';
import type {
  CsvValidationReport,
  OrderedClientInvoices,
  OrderSource,
} from '../services/csvRouteOrderingService';
import {
  reorderClientList,
  areClientOrdersEqual,
  buildDefaultProcessingOrder,
} from '../services/csvRouteOrderingService';
import type { RouteClientProcessingState } from '@/app/(main)/rutas/[id]/procesar/page';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
  GripVertical,
  RotateCcw,
  Search,
  Eye,
} from 'lucide-react';

interface RouteCsvValidationReportProps {
  report: CsvValidationReport | null;
  clientStates: RouteClientProcessingState[];
  routeId?: string;
  onResetReport?: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function RouteCsvValidationReport({
  report,
  clientStates,
  routeId: propRouteId,
  onResetReport,
}: RouteCsvValidationReportProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const activeRouteId = propRouteId || params?.id || '';

  const getInitialOrder = (): OrderedClientInvoices[] => {
    if (report && report.isValid) {
      return report.orderedClients;
    }
    return buildDefaultProcessingOrder(clientStates);
  };

  const getInitialSource = (): OrderSource => {
    if (report && report.isValid) {
      return report.source || 'CSV';
    }
    return 'PROCESSING';
  };

  const [orderedClients, setOrderedClients] = useState<OrderedClientInvoices[]>(getInitialOrder);
  const [initialOrder, setInitialOrder] = useState<OrderedClientInvoices[]>(getInitialOrder);
  const [orderSource, setOrderSource] = useState<OrderSource>(getInitialSource);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (report && report.isValid) {
      setOrderedClients(report.orderedClients);
      setInitialOrder(report.orderedClients);
      setOrderSource(report.source || 'CSV');
    } else {
      const defaultOrder = buildDefaultProcessingOrder(clientStates);
      setOrderedClients(defaultOrder);
      setInitialOrder(defaultOrder);
      setOrderSource('PROCESSING');
    }
    setDraggedIndex(null);
    setDropTargetIndex(null);
  }, [report, clientStates]);

  const handleOpenPreview = () => {
    const orderedInvoiceIds = orderedClients.flatMap((client) => client.invoices.map((inv) => inv.id));
    if (activeRouteId && typeof window !== 'undefined') {
      sessionStorage.setItem(`route_preview_${activeRouteId}`, JSON.stringify(orderedInvoiceIds));
      router.push(`/rutas/${activeRouteId}/preview`);
    }
  };

  const toggleExpandClient = (clientId: string) => {
    setExpandedClients((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  const isFilterActive = searchQuery.trim().length > 0;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isFilterActive) return;
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (isFilterActive || draggedIndex === null) return;
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetIndex !== index) {
      setDropTargetIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (isFilterActive || draggedIndex === null) return;

    if (draggedIndex !== dropIndex) {
      const newOrderedList = reorderClientList(orderedClients, draggedIndex, dropIndex);
      setOrderedClients(newOrderedList);

      const modified = !areClientOrdersEqual(newOrderedList, initialOrder);
      if (modified) {
        setOrderSource('MANUAL');
      } else {
        const baseSource: OrderSource = report && report.isValid ? 'CSV' : 'PROCESSING';
        setOrderSource(baseSource);
      }
    }

    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleResetOrder = () => {
    setOrderedClients(initialOrder);
    const baseSource: OrderSource = report && report.isValid ? 'CSV' : 'PROCESSING';
    setOrderSource(baseSource);
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const hasWarnings = report ? report.isValid && report.warnings.length > 0 : false;
  const filteredClients = isFilterActive
    ? orderedClients.filter((client) =>
        client.clientId.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : orderedClients;

  const totalMatchedClients = orderedClients.length;
  const totalOrderedInvoices = orderedClients.reduce(
    (acc, client) => acc + client.invoices.length,
    0
  );
  const grandTotalAmount = orderedClients.reduce(
    (acc, client) => acc + client.totalAmount,
    0
  );

  return (
    <div className="space-y-6">
      {/* BLOCKING ERRORS CARD (If CSV report exists and is invalid) */}
      {report && !report.isValid && (
        <Card className="border-destructive/50 bg-destructive/5 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-6 w-6 shrink-0" />
              <div>
                <CardTitle className="text-lg text-destructive">
                  Error Bloqueante de Validaciones CSV
                </CardTitle>
                <CardDescription className="text-destructive/80 text-xs">
                  El archivo CSV contiene errores estructurales que impiden generar la lista de facturas ordenadas. Se utiliza el orden de procesamiento por defecto.
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
      )}

      {/* Status & Summary Metrics Card */}
      <Card
        className={
          hasWarnings
            ? 'border-amber-300 dark:border-amber-800'
            : report && !report.isValid
            ? 'border-slate-300 dark:border-slate-700'
            : 'border-emerald-300 dark:border-emerald-800'
        }
      >
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {hasWarnings ? (
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
              ) : report && !report.isValid ? (
                <AlertCircle className="h-6 w-6 text-slate-500 shrink-0" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <div>
                <CardTitle className="text-lg">
                  {hasWarnings
                    ? 'Validación Completada con Advertencias'
                    : report && !report.isValid
                    ? 'Orden de Procesamiento (CSV con Errores)'
                    : report && report.isValid
                    ? 'Validación Completada Exitosamente'
                    : 'Orden de Procesamiento de Ruta'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {hasWarnings
                    ? 'Se detectaron discrepancias entre el CSV y la ruta, pero la lista de facturas ordenadas fue generada correctamente.'
                    : report && !report.isValid
                    ? 'No se pudo aplicar el ordenamiento CSV debido a errores en el archivo. Se utiliza el orden de procesamiento por defecto.'
                    : report && report.isValid
                    ? 'Todas las entradas del CSV coinciden perfectamente con los clientes y facturas activas de la ruta.'
                    : 'Lista de facturas ordenadas según el orden de procesamiento original de la ruta.'}
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                type="button"
                onClick={handleOpenPreview}
                disabled={orderedClients.length === 0}
                className="inline-flex items-center gap-2 font-semibold shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Eye className="h-4 w-4" />
                Vista previa de facturas
              </Button>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                  orderSource === 'MANUAL' || orderSource === 'MANUAL_INPUT'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : orderSource === 'CSV'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                }`}
              >
                {orderSource === 'MANUAL'
                  ? 'Orden modificado manualmente'
                  : orderSource === 'MANUAL_INPUT'
                  ? 'Orden manual'
                  : orderSource === 'CSV'
                  ? 'Orden CSV'
                  : 'Orden de procesamiento'}
              </span>
            </div>
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
                  {totalMatchedClients}
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
                  {totalOrderedInvoices}
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
                  {formatCurrency(grandTotalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Discrepancy Warnings Summary Cards */}
          {report && report.isValid && hasWarnings && (
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {orderSource === 'CSV'
                  ? 'Facturas Reordenadas por CSV'
                  : orderSource === 'MANUAL' || orderSource === 'MANUAL_INPUT'
                  ? 'Facturas Reordenadas Manualmente'
                  : 'Facturas por Orden de Procesamiento'}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {orderSource === 'MANUAL' ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Orden modificado manualmente
                  </span>
                  <button
                    type="button"
                    onClick={handleResetOrder}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-background border border-input hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restablecer orden anterior
                  </button>
                </>
              ) : orderSource === 'MANUAL_INPUT' ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Orden manual
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onResetReport) onResetReport();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-background border border-input hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Quitar orden manual
                  </button>
                </>
              ) : orderSource === 'CSV' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Orden CSV
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Orden de procesamiento
                </span>
              )}
            </div>
          </div>
          <CardDescription>
            {orderSource === 'CSV'
              ? 'Lista de clientes y facturas ordenadas según el archivo CSV subido.'
              : orderSource === 'MANUAL' || orderSource === 'MANUAL_INPUT'
              ? 'Lista de clientes y facturas ajustadas manualmente.'
              : 'Lista de clientes y facturas ordenadas según el orden de procesamiento de la ruta.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {/* Search / Filter input bar */}
          <div className="p-4 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar cliente por ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {isFilterActive && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Reordenamiento manual deshabilitado durante búsquedas
              </span>
            )}
          </div>

          {filteredClients.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-2">
              <Info className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-medium">No hay facturas coincidentes para mostrar.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredClients.map((client) => {
                const isExpanded = !!expandedClients[client.clientId];
                const realIndex = orderedClients.findIndex((c) => c.clientId === client.clientId);
                const isDragging = draggedIndex === realIndex;
                const isDropTarget = dropTargetIndex === realIndex;

                return (
                  <div
                    key={client.clientId}
                    onDragOver={(e) => handleDragOver(e, realIndex)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, realIndex)}
                    className={`transition-colors ${
                      isDragging ? 'opacity-40 border-dashed border-2 border-primary bg-primary/5' : ''
                    } ${
                      isDropTarget && !isDragging ? 'border-t-2 border-primary bg-primary/5' : ''
                    } hover:bg-muted/30`}
                  >
                    <div
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                      onClick={() => toggleExpandClient(client.clientId)}
                    >
                      {/* Left side: Grip Handle, Orden Badge & Client ID */}
                      <div className="flex items-center gap-3">
                        <div
                          draggable={!isFilterActive}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            handleDragStart(e, realIndex);
                          }}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => e.stopPropagation()}
                          className={`p-1 rounded-md transition-colors flex items-center justify-center ${
                            isFilterActive
                              ? 'opacity-30 cursor-not-allowed text-muted-foreground'
                              : 'cursor-grab active:cursor-grabbing hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                          title={
                            isFilterActive
                              ? 'Reordenamiento manual deshabilitado durante búsquedas'
                              : 'Arrastrar para reordenar'
                          }
                          aria-label="Arrastrar para reordenar"
                        >
                          <GripVertical className="h-4 w-4 shrink-0" />
                        </div>

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
