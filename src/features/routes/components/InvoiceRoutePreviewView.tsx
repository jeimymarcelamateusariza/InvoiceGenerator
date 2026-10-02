'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, AlertCircle, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { invoiceService } from '@/features/invoices/api/invoiceService';
import type { InvoiceFromApi } from '@/features/invoices/types';
import { InvoicePrintView } from '@/features/invoices/components/InvoicePrintView';

export interface InvoiceRoutePreviewViewProps {
  routeId: string;
  initialInvoiceIds?: string[];
  initialIndex?: number;
}

export function InvoiceRoutePreviewView({
  routeId,
  initialInvoiceIds,
  initialIndex = 0,
}: InvoiceRoutePreviewViewProps) {
  const [invoiceIds, setInvoiceIds] = useState<string[]>(initialInvoiceIds || []);
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [cache, setCache] = useState<Record<string, InvoiceFromApi>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [manifestLoading, setManifestLoading] = useState<boolean>(!initialInvoiceIds || initialInvoiceIds.length === 0);

  // Ref to prevent duplicate in-flight fetches for the same ID
  const fetchingRef = useRef<Set<string>>(new Set());

  // 1. Resolve ordered invoice IDs list on mount if not provided as props
  useEffect(() => {
    if (initialInvoiceIds && initialInvoiceIds.length > 0) {
      setInvoiceIds(initialInvoiceIds);
      setManifestLoading(false);
      return;
    }

    // Try reading from sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(`route_preview_${routeId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInvoiceIds(parsed);
            setManifestLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Error reading route_preview manifest from sessionStorage:', e);
      }
    }

    // Fallback: Fetch route and query active client invoices sequentially
    let isSubscribed = true;
    async function loadFallbackManifest() {
      setManifestLoading(true);
      try {
        const res = await fetch(`/api/rutas/${routeId}`);
        if (!res.ok) throw new Error('No se pudo cargar la información de la ruta.');
        const json = await res.json();
        const clientIds: string[] = json.data?.id_clientes || [];

        const collectedInvoiceIds: string[] = [];
        for (const cid of clientIds) {
          const clientRes = await invoiceService.getInvoicesByClientId(cid, { status: 'ISSUED' });
          if (clientRes.status === 'success' && clientRes.invoices) {
            for (const inv of clientRes.invoices) {
              collectedInvoiceIds.push(inv.id);
            }
          }
        }

        if (isSubscribed) {
          setInvoiceIds(collectedInvoiceIds);
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Error al cargar la ruta de facturas.');
          setStatus('error');
        }
      } finally {
        if (isSubscribed) {
          setManifestLoading(false);
        }
      }
    }

    loadFallbackManifest();

    return () => {
      isSubscribed = false;
    };
  }, [routeId, initialInvoiceIds]);

  const totalInvoices = invoiceIds.length;
  const activeInvoiceId = invoiceIds[currentIndex] || null;

  // 2. Main Active Invoice Fetching Logic
  const fetchActiveInvoice = useCallback(
    async (id: string, forceRetry = false) => {
      if (!id) return;

      // Use cache if available and not forcing retry
      if (!forceRetry && cache[id]) {
        setStatus('success');
        setError(null);
        return;
      }

      setStatus('loading');
      setError(null);

      try {
        fetchingRef.current.add(id);
        const invoice = await invoiceService.getInvoiceById(id);
        setCache((prev) => ({ ...prev, [id]: invoice }));
        setStatus('success');
        setError(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al cargar la factura';
        setError(msg);
        setStatus('error');
      } finally {
        fetchingRef.current.delete(id);
      }
    },
    [cache]
  );

  // 3. Non-blocking Background Prefetching for next index (currentIndex + 1)
  const prefetchNextInvoice = useCallback(
    (nextIdx: number) => {
      if (nextIdx >= invoiceIds.length) return;
      const nextId = invoiceIds[nextIdx];
      if (!nextId || cache[nextId] || fetchingRef.current.has(nextId)) return;

      fetchingRef.current.add(nextId);
      invoiceService
        .getInvoiceById(nextId)
        .then((nextInvoice) => {
          setCache((prev) => ({ ...prev, [nextId]: nextInvoice }));
        })
        .catch(() => {
          // Silent failure for background prefetching
        })
        .finally(() => {
          fetchingRef.current.delete(nextId);
        });
    },
    [invoiceIds, cache]
  );

  // Effect to trigger fetch & prefetch on active index change
  useEffect(() => {
    if (!activeInvoiceId || manifestLoading) return;

    fetchActiveInvoice(activeInvoiceId);

    // Trigger non-blocking prefetch for next index if valid
    const nextIndex = currentIndex + 1;
    if (nextIndex < totalInvoices) {
      prefetchNextInvoice(nextIndex);
    }
  }, [currentIndex, activeInvoiceId, manifestLoading, fetchActiveInvoice, prefetchNextInvoice, totalInvoices]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0 && status !== 'loading') {
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < totalInvoices - 1 && status !== 'loading') {
        setCurrentIndex((prev) => prev + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalInvoices, status]);

  const handlePrev = () => {
    if (currentIndex > 0 && status !== 'loading') {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalInvoices - 1 && status !== 'loading') {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleRetry = () => {
    if (activeInvoiceId) {
      fetchActiveInvoice(activeInvoiceId, true);
    }
  };

  const activeInvoice = activeInvoiceId ? cache[activeInvoiceId] || null : null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-12">
      {/* Top Fixed / Sticky Toolbar */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b shadow-xs py-3 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Return Navigation */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <Link
              href={`/rutas/${routeId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md hover:bg-accent"
              aria-label="Volver a la ruta"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver a la Ruta</span>
            </Link>

            <span className="hidden sm:inline-block text-border">|</span>
            <span className="text-xs font-medium text-muted-foreground truncate hidden sm:inline-block">
              Vista Previa de Facturas
            </span>
          </div>

          {/* Center / Right: Navigation Controls & Status Counter */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0 || status === 'loading' || manifestLoading}
              aria-label="Factura anterior"
              className="flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Anterior</span>
            </Button>

            {/* Indicator Badge */}
            <div
              data-testid="invoice-counter"
              className="px-3 py-1 bg-primary/10 text-primary font-mono text-xs font-bold rounded-md border border-primary/20 shrink-0 text-center"
            >
              {manifestLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Cargando...
                </span>
              ) : totalInvoices > 0 ? (
                `Factura ${currentIndex + 1} de ${totalInvoices}`
              ) : (
                'Sin facturas'
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === totalInvoices - 1 || status === 'loading' || manifestLoading}
              aria-label="Factura siguiente"
              className="flex items-center gap-1 cursor-pointer"
            >
              <span className="hidden xs:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Preview Content Canvas */}
      <main className="container mx-auto px-4 py-8 max-w-6xl flex justify-center items-center">
        {/* State 1: Manifest Loading */}
        {manifestLoading && (
          <div className="w-full max-w-[8.5in] min-h-[5.5in] bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl border border-border animate-pulse flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2" />
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-md w-full mt-6" />
              <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-md w-full mt-4" />
            </div>
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-md w-full" />
          </div>
        )}

        {/* State 2: Empty Invoices List */}
        {!manifestLoading && totalInvoices === 0 && (
          <Card className="w-full max-w-md text-center py-12">
            <CardContent className="flex flex-col items-center space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground/60" />
              <p className="text-base font-semibold">No se encontraron facturas</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                No hay facturas asociadas a esta secuencia para mostrar en la vista previa.
              </p>
              <Button variant="outline" asChild className="mt-2">
                <Link href={`/rutas/${routeId}`}>Volver al detalle de la ruta</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* State 3: Invoice Fetch Loading Skeleton */}
        {!manifestLoading && totalInvoices > 0 && status === 'loading' && !activeInvoice && (
          <div
            data-testid="invoice-skeleton"
            className="w-full max-w-[8.5in] min-h-[5.5in] bg-white rounded-lg p-6 shadow-xl border border-border animate-pulse flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b">
                <div className="h-12 w-12 bg-slate-200 rounded-md" />
                <div className="h-6 w-32 bg-slate-200 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-5/6 bg-slate-200 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-2/3 bg-slate-200 rounded" />
                  <div className="h-3 w-4/5 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-44 bg-slate-200 rounded-md w-full" />
            </div>
            <div className="h-16 bg-slate-200 rounded-md w-full" />
          </div>
        )}

        {/* State 4: Fetch Error Card */}
        {!manifestLoading && totalInvoices > 0 && status === 'error' && (
          <Card data-testid="invoice-error-card" className="w-full max-w-[8.5in] min-h-[350px] border-destructive/40 bg-destructive/5 shadow-xl flex items-center justify-center p-6">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                <AlertCircle className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-destructive">Error al cargar la factura</h3>
                <p className="text-xs text-muted-foreground max-w-xs font-mono">
                  {error || 'No se pudo establecer conexión con el servidor.'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 font-semibold cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* State 5: Success - Render Half-Letter Invoice Print View */}
        {!manifestLoading && totalInvoices > 0 && activeInvoice && (
          <div className="w-full flex justify-center">
            <InvoicePrintView invoice={activeInvoice} />
          </div>
        )}
      </main>
    </div>
  );
}
