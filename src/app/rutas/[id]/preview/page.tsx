'use client';

import { use, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { InvoiceRoutePreviewView } from '@/features/routes/components/InvoiceRoutePreviewView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoutePreviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();

  const routeId = resolvedParams.id;
  const initialIndex = useMemo(() => {
    const idxStr = searchParams.get('index');
    if (idxStr) {
      const parsed = parseInt(idxStr, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    return 0;
  }, [searchParams]);

  return <InvoiceRoutePreviewView routeId={routeId} initialIndex={initialIndex} />;
}
