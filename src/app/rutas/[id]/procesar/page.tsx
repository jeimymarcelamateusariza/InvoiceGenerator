'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  AlertCircle,
  Users,
  Layers,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { invoiceService } from '@/features/invoices/api/invoiceService';
import type { InvoiceFromApi } from '@/features/invoices/types';
import { RouteCsvUploader } from '@/features/routes/components/RouteCsvUploader';
import { RouteCsvValidationReport } from '@/features/routes/components/RouteCsvValidationReport';
import {
  parseAndValidateCsv,
  type CsvValidationReport,
} from '@/features/routes/services/csvRouteOrderingService';

export interface RouteClientProcessingState {
  clientId: string;
  status: 'pending' | 'processing' | 'success' | 'empty' | 'error';
  invoices: InvoiceFromApi[];
  error?: string;
}

export interface RouteProcessingMetrics {
  total: number;
  processed: number;
  withInvoices: number;
  empty: number;
  error: number;
  isRunning: boolean;
  isCompleted: boolean;
}

interface RouteDetail {
  id: string;
  nombre: string;
  created_at: string;
  updated_at?: string;
  id_clientes: string[];
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function BatchProcessRoutePage() {
  const params = useParams<{ id: string }>();
  const routeId = params.id;
  const router = useRouter();

  const [route, setRoute] = useState<RouteDetail | null>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(true);
  const [routeError, setRouteError] = useState<string | null>(null);

  const [clientStates, setClientStates] = useState<RouteClientProcessingState[]>([]);
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});

  const [metrics, setMetrics] = useState<RouteProcessingMetrics>({
    total: 0,
    processed: 0,
    withInvoices: 0,
    empty: 0,
    error: 0,
    isRunning: false,
    isCompleted: false,
  });

  // State hooks for CSV Route Ordering
  const [csvReport, setCsvReport] = useState<CsvValidationReport | null>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  const handleCsvFileSelected = (fileContent: string, fileName: string) => {
    const report = parseAndValidateCsv(fileContent, clientStates);
    setCsvReport(report);
    setCsvFileName(fileName);
  };

  const handleResetCsv = () => {
    setCsvReport(null);
    setCsvFileName(null);
  };

  // Ref to cancel or track active processing execution loop if needed
  const isCancelledRef = useRef<boolean>(false);

  // Fetch route detail on mount
  const fetchRouteDetail = useCallback(async () => {
    if (!routeId) return;
    try {
      setLoadingRoute(true);
      setRouteError(null);
      const res = await fetch(`/api/rutas/${routeId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('La ruta especificada no existe.');
        }
        throw new Error('Error al cargar la ruta para el procesamiento.');
      }
      const json = await res.json();
      const routeData: RouteDetail = json.data;
      setRoute(routeData);

      const initialStates: RouteClientProcessingState[] = (routeData.id_clientes || []).map((cid) => ({
        clientId: cid,
        status: 'pending',
        invoices: [],
      }));

      setClientStates(initialStates);
      setMetrics({
        total: initialStates.length,
        processed: 0,
        withInvoices: 0,
        empty: 0,
        error: 0,
        isRunning: false,
        isCompleted: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al cargar la ruta.';
      setRouteError(msg);
      toast.error(msg);
    } finally {
      setLoadingRoute(false);
    }
  }, [routeId]);

  useEffect(() => {
    fetchRouteDetail();
  }, [fetchRouteDetail]);

  // Sequential async processing loop runner
  const startProcessing = async () => {
    if (!route || route.id_clientes.length === 0) {
      toast.error('La ruta no tiene clientes para procesar.');
      return;
    }

    isCancelledRef.current = false;
    setCsvReport(null);
    setCsvFileName(null);

    // Reset client states to pending
    const initialStates: RouteClientProcessingState[] = route.id_clientes.map((cid) => ({
      clientId: cid,
      status: 'pending',
      invoices: [],
    }));
    setClientStates(initialStates);

    setMetrics({
      total: route.id_clientes.length,
      processed: 0,
      withInvoices: 0,
      empty: 0,
      error: 0,
      isRunning: true,
      isCompleted: false,
    });

    let withInvoicesAcc = 0;
    let emptyAcc = 0;
    let errorAcc = 0;
    let processedAcc = 0;

    for (let i = 0; i < route.id_clientes.length; i++) {
      if (isCancelledRef.current) break;

      const clientId = route.id_clientes[i];

      // Mark current client as processing
      setClientStates((prev) =>
        prev.map((c) => (c.clientId === clientId ? { ...c, status: 'processing' } : c))
      );

      try {
        const result = await invoiceService.getInvoicesByClientId(clientId, { status: 'ISSUED' });

        if (isCancelledRef.current) break;

        if (result.status === 'success') {
          withInvoicesAcc++;
          setClientStates((prev) =>
            prev.map((c) =>
              c.clientId === clientId
                ? { ...c, status: 'success', invoices: result.invoices, error: undefined }
                : c
            )
          );
        } else if (result.status === 'empty') {
          emptyAcc++;
          setClientStates((prev) =>
            prev.map((c) =>
              c.clientId === clientId
                ? { ...c, status: 'empty', invoices: [], error: undefined }
                : c
            )
          );
        } else {
          errorAcc++;
          setClientStates((prev) =>
            prev.map((c) =>
              c.clientId === clientId
                ? {
                    ...c,
                    status: 'error',
                    invoices: [],
                    error: result.error?.message || 'Error al consultar facturas del cliente',
                  }
                : c
            )
          );
        }
      } catch (err: unknown) {
        if (isCancelledRef.current) break;
        errorAcc++;
        const errMsg = err instanceof Error ? err.message : 'Error inesperado durante la consulta';
        setClientStates((prev) =>
          prev.map((c) =>
            c.clientId === clientId
              ? { ...c, status: 'error', invoices: [], error: errMsg }
              : c
          )
        );
      }

      processedAcc++;

      setMetrics({
        total: route.id_clientes.length,
        processed: processedAcc,
        withInvoices: withInvoicesAcc,
        empty: emptyAcc,
        error: errorAcc,
        isRunning: i < route.id_clientes.length - 1,
        isCompleted: i === route.id_clientes.length - 1,
      });
    }

    if (!isCancelledRef.current) {
      toast.success('Procesamiento de facturas finalizado');
    }
  };

  const toggleExpandClient = (clientId: string) => {
    setExpandedClients((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  if (loadingRoute) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Cargando datos de la ruta...</p>
      </div>
    );
  }

  if (routeError || !route) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        <div className="mb-6">
          <Link
            href="/rutas"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Rutas
          </Link>
        </div>
        <Card className="border-destructive/30 bg-destructive/5 text-center py-12">
          <CardContent className="flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-xl text-destructive mb-2">Error al iniciar el procesamiento</CardTitle>
            <p className="text-muted-foreground max-w-md mb-6 text-sm">
              {routeError || 'No se pudo cargar la información de la ruta.'}
            </p>
            <Button variant="outline" onClick={() => router.push('/rutas')}>
              Volver al listado de rutas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage =
    metrics.total > 0 ? Math.round((metrics.processed / metrics.total) * 100) : 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      {/* Navigation Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/rutas" className="hover:text-foreground transition-colors">
          Rutas
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/rutas/${route.id}`}
          className="hover:text-foreground transition-colors truncate max-w-[150px]"
        >
          {route.nombre}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Procesar Facturas</span>
      </nav>

      {/* Header Viewport */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-full text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Procesamiento de Facturas</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Ruta: <strong className="text-foreground">{route.nombre}</strong> ({route.id_clientes.length} clientes)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/rutas/${route.id}`)}
            disabled={metrics.isRunning}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Detalle
          </Button>

          {metrics.isCompleted || metrics.processed > 0 ? (
            <Button
              onClick={startProcessing}
              disabled={metrics.isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Button>
          ) : (
            <Button
              onClick={startProcessing}
              disabled={metrics.isRunning || route.id_clientes.length === 0}
              size="lg"
              className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all bg-primary font-semibold"
            >
              {metrics.isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  Iniciar Procesamiento
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress & Status Card */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Progreso General
            </CardTitle>
            <span className="text-sm font-bold font-mono text-primary">
              {metrics.processed} / {metrics.total} ({progressPercentage}%)
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar Container */}
          <div className="w-full bg-muted rounded-full h-3.5 overflow-hidden p-0.5 border">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>
              {metrics.isRunning
                ? 'Ejecutando consulta secuencial de clientes...'
                : metrics.isCompleted
                ? 'Procesamiento completado con éxito.'
                : metrics.processed > 0
                ? 'Procesamiento pausado / finalizado.'
                : 'Presioná "Iniciar Procesamiento" para comenzar.'}
            </span>
            {metrics.isRunning && (
              <span className="flex items-center gap-1 text-primary font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                En curso
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Clientes</p>
              <p className="text-2xl font-bold mt-1">{metrics.total}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Con Facturas</p>
              <p className="text-2xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
                {metrics.withInvoices}
              </p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-500/20 bg-slate-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sin Facturas</p>
              <p className="text-2xl font-bold mt-1 text-slate-700 dark:text-slate-300">
                {metrics.empty}
              </p>
            </div>
            <div className="bg-slate-500/10 p-3 rounded-xl text-slate-600 dark:text-slate-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-destructive font-medium">Errores</p>
              <p className="text-2xl font-bold mt-1 text-destructive">
                {metrics.error}
              </p>
            </div>
            <div className="bg-destructive/10 p-3 rounded-xl text-destructive">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Per-Client Status Feed Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Estado en Tiempo Real por Cliente
              </CardTitle>
              <CardDescription className="mt-1">
                Monitoreo individual del estado de consulta de facturas emitidas por cada cliente.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {clientStates.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay clientes asignados a esta ruta.
            </div>
          ) : (
            <div className="divide-y border-t">
              {clientStates.map((client) => {
                const isExpanded = !!expandedClients[client.clientId];
                const hasInvoices = client.status === 'success' && client.invoices.length > 0;

                return (
                  <div key={client.clientId} className="transition-colors hover:bg-muted/30">
                    <div
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                      onClick={() => hasInvoices && toggleExpandClient(client.clientId)}
                    >
                      {/* Left side: Client ID & Status Badge */}
                      <div className="flex items-center gap-3">
                        <div className="font-mono font-semibold text-sm bg-muted/80 px-2.5 py-1 rounded border">
                          {client.clientId}
                        </div>

                        {/* Status Badges */}
                        {client.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Clock className="h-3 w-3" />
                            Pendiente
                          </span>
                        )}
                        {client.status === 'processing' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-800 animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin text-blue-600 dark:text-blue-400" />
                            Procesando...
                          </span>
                        )}
                        {client.status === 'success' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            Con Factura ({client.invoices.length})
                          </span>
                        )}
                        {client.status === 'empty' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            Sin Factura
                          </span>
                        )}
                        {client.status === 'error' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                            Error
                          </span>
                        )}
                      </div>

                      {/* Right side: Summary info & Toggle Button */}
                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        {client.status === 'success' && (
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>
                              Total: {' '}
                              <strong className="text-foreground font-mono">
                                {formatCurrency(
                                  client.invoices.reduce((acc, inv) => acc + (inv.total_amount || 0), 0)
                                )}
                              </strong>
                            </span>
                          </div>
                        )}
                        {client.status === 'error' && client.error && (
                          <span className="text-xs text-destructive truncate max-w-[250px]">
                            {client.error}
                          </span>
                        )}

                        {hasInvoices && (
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
                        )}
                      </div>
                    </div>

                    {/* Expandable Details Section for Client Invoices */}
                    {hasInvoices && isExpanded && (
                      <div className="bg-muted/40 p-4 border-t space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Facturas Emitidas Encontradas ({client.invoices.length})
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

      {/* CSV Route Invoice Ordering Section */}
      <div className="space-y-6 pt-4 border-t">
        <RouteCsvUploader
          isLocked={!metrics.isCompleted}
          onFileSelected={handleCsvFileSelected}
          onReset={handleResetCsv}
          currentFileName={csvFileName}
        />

        {csvReport && <RouteCsvValidationReport report={csvReport} />}
      </div>
    </div>
  );
}
