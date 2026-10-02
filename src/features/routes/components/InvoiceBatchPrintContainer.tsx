'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Printer, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { invoiceService } from '@/features/invoices/api/invoiceService';
import type { InvoiceFromApi } from '@/features/invoices/types';
import { InvoiceBatchPrintDocument } from './InvoiceBatchPrintDocument';

export interface InvoiceBatchPrintContainerProps {
  routeId?: string;
  initialInvoiceIds?: string[];
  initialCache?: Record<string, InvoiceFromApi>;
  onClose?: () => void;
}

const CONCURRENCY = 5;

export function InvoiceBatchPrintContainer({
  routeId,
  initialInvoiceIds,
  initialCache = {},
  onClose,
}: InvoiceBatchPrintContainerProps) {
  const [invoiceIds, setInvoiceIds] = useState<string[]>(initialInvoiceIds || []);
  const [cache, setCache] = useState<Record<string, InvoiceFromApi>>(initialCache);
  const [manifestLoading, setManifestLoading] = useState<boolean>(
    !initialInvoiceIds || initialInvoiceIds.length === 0
  );
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isCancelledRef = useRef<boolean>(false);

  // 1. Resolve ordered invoice IDs manifest
  useEffect(() => {
    isCancelledRef.current = false;

    if (initialInvoiceIds && initialInvoiceIds.length > 0) {
      setInvoiceIds(initialInvoiceIds);
      setManifestLoading(false);
      return;
    }

    if (!routeId) {
      setManifestLoading(false);
      setIsFetching(false);
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

    // Fallback: Fetch route and active client invoices
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
          if (!isSubscribed || isCancelledRef.current) break;
          const clientRes = await invoiceService.getInvoicesByClientId(cid, { status: 'ISSUED' });
          if (clientRes.status === 'success' && clientRes.invoices) {
            for (const inv of clientRes.invoices) {
              collectedInvoiceIds.push(inv.id);
            }
          }
        }

        if (isSubscribed && !isCancelledRef.current) {
          setInvoiceIds(collectedInvoiceIds);
        }
      } catch (err: unknown) {
        if (isSubscribed && !isCancelledRef.current) {
          setError(err instanceof Error ? err.message : 'Error al cargar la lista de facturas.');
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

  // 2. Chunked fetching runner (CONCURRENCY = 5) with cache reuse
  const fetchMissingInvoices = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    const missingIds = ids.filter((id) => !cache[id]);

    if (missingIds.length === 0) {
      setIsFetching(false);
      return;
    }

    for (let i = 0; i < missingIds.length; i += CONCURRENCY) {
      if (isCancelledRef.current) break;

      const chunk = missingIds.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        chunk.map((id) => invoiceService.getInvoiceById(id))
      );

      if (isCancelledRef.current) break;

      const newCacheItems: Record<string, InvoiceFromApi> = {};
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled' && res.value) {
          newCacheItems[chunk[idx]] = res.value;
        }
      });

      setCache((prev) => ({ ...prev, ...newCacheItems }));
    }

    if (!isCancelledRef.current) {
      setIsFetching(false);
    }
  }, [cache]);

  useEffect(() => {
    if (!manifestLoading && invoiceIds.length > 0) {
      fetchMissingInvoices(invoiceIds);
    } else if (!manifestLoading && invoiceIds.length === 0) {
      setIsFetching(false);
    }
  }, [manifestLoading, invoiceIds, fetchMissingInvoices]);

  const handleCancel = () => {
    isCancelledRef.current = true;
    setIsFetching(false);
    if (onClose) {
      onClose();
    }
  };

  const totalCount = invoiceIds.length;
  const loadedCount = invoiceIds.filter((id) => Boolean(cache[id])).length;
  const percentage = totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : (manifestLoading ? 0 : 100);

  const availableInvoices = invoiceIds
    .map((id) => cache[id])
    .filter((inv): inv is InvoiceFromApi => inv !== undefined);

  return (
    <div className="batch-print-container relative min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Top Floating Control Toolbar (hidden when printing) */}
      <div className="no-print sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b shadow-xs px-4 py-3">
        <div className="container mx-auto max-w-6xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Impresión Lote de Facturas</h2>
            <span className="text-xs text-muted-foreground font-mono">
              ({loadedCount}/{totalCount})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => window.print()}
              disabled={isFetching || manifestLoading || availableInvoices.length === 0}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <X className="h-4 w-4" />
                <span>Cerrar</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Overlay Modal */}
      {(manifestLoading || isFetching) && (
        <div
          data-testid="batch-print-progress-modal"
          className="no-print fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-background border rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Cargando facturas para impresión...</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono font-medium">
                <span>
                  {manifestLoading
                    ? 'Cargando lista de facturas...'
                    : `Factura ${loadedCount} de ${totalCount} cargadas - ${percentage}%`}
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !manifestLoading && availableInvoices.length === 0 && (
        <div className="no-print container mx-auto max-w-md p-6 my-12 text-center bg-destructive/10 border border-destructive/30 rounded-lg space-y-3">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-sm font-semibold text-destructive">{error}</p>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Volver
            </Button>
          )}
        </div>
      )}

      {/* Printable Document Rendering */}
      {availableInvoices.length > 0 && (
        <main className="container mx-auto py-6 flex justify-center print:block print:p-0 print:m-0 print:w-full print:max-w-none">
          <InvoiceBatchPrintDocument invoices={availableInvoices} />
        </main>
      )}
    </div>
  );
}
