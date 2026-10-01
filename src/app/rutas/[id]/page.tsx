'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Users,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  UserCheck,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface RouteDetail {
  id: string;
  nombre: string;
  created_at: string;
  updated_at?: string;
  id_clientes: string[];
}

export default function RouteDetailPage() {
  const params = useParams<{ id: string }>();
  const routeId = params.id;
  const router = useRouter();

  const [route, setRoute] = useState<RouteDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRouteDetail = useCallback(async () => {
    if (!routeId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/rutas/${routeId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('La ruta especificada no existe.');
        }
        throw new Error('Error al cargar la información de la ruta.');
      }
      const json = await res.json();
      setRoute(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [routeId]);

  useEffect(() => {
    fetchRouteDetail();
  }, [fetchRouteDetail]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Cargando detalle de la ruta...</p>
      </div>
    );
  }

  if (error || !route) {
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
            <CardTitle className="text-xl text-destructive mb-2">Error al cargar la ruta</CardTitle>
            <p className="text-muted-foreground max-w-md mb-6 text-sm">
              {error || 'No se pudo encontrar la ruta solicitada.'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/rutas')}>
                Ir al listado de rutas
              </Button>
              <Button onClick={fetchRouteDetail} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      {/* Breadcrumb y navegación superior */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/rutas" className="hover:text-foreground transition-colors">
          Rutas
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground truncate max-w-[200px]">{route.nombre}</span>
      </nav>

      {/* Header con título y botón de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-full text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{route.nombre}</h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {route.id}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/rutas')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Button
            onClick={() => router.push(`/rutas/${route.id}/procesar`)}
            size="lg"
            className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all bg-primary font-semibold"
          >
            <Play className="h-4 w-4 fill-current" />
            Procesar Facturas
          </Button>
        </div>
      </div>

      {/* Tarjetas informativas de metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Asignados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{route.id_clientes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes configurados en esta ruta
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fecha de Creación</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {new Date(route.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(route.created_at).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Última Actualización</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {route.updated_at
                ? new Date(route.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Sin modificaciones'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {route.updated_at
                ? new Date(route.updated_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Fecha original de creación'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de clientes asignados */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Clientes en la Ruta
              </CardTitle>
              <CardDescription className="mt-1">
                Listado completo de IDs de cliente vinculados a esta ruta de facturación.
              </CardDescription>
            </div>
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
              {route.id_clientes.length} {route.id_clientes.length === 1 ? 'cliente' : 'clientes'}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {route.id_clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <Users className="h-10 w-10 mb-2 opacity-40" />
              <p className="font-medium text-foreground">No hay clientes asignados</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Podés editar esta ruta desde el módulo general de rutas para agregar IDs de cliente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {route.id_clientes.map((clientId, idx) => (
                <div
                  key={`${clientId}-${idx}`}
                  className="bg-muted/50 border hover:border-primary/50 transition-colors rounded-lg p-3 flex items-center gap-2.5"
                >
                  <div className="bg-primary/10 p-1.5 rounded-md text-primary shrink-0">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">ID Cliente</p>
                    <p className="font-mono text-sm font-semibold truncate text-foreground">
                      {clientId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
