'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  MapPin,
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  Eye,
  UserCheck,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

interface RutaItem {
  id: string;
  nombre: string;
  total_clientes: number;
  created_at: string;
  updated_at?: string;
}

interface RutaDetail {
  id: string;
  nombre: string;
  id_clientes: string[];
}

export default function RutasPage() {
  const router = useRouter();
  const [rutas, setRutas] = useState<RutaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fetchingDetail, setFetchingDetail] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado del formulario de creación/edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string>('');
  const [idClientesInput, setIdClientesInput] = useState<string>('');

  // Estado para modal "Ver Clientes"
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [viewRouteData, setViewRouteData] = useState<RutaDetail | null>(null);
  const [loadingViewDetail, setLoadingViewDetail] = useState<boolean>(false);
  const [viewError, setViewError] = useState<string | null>(null);

  // Estado para modal de confirmación de eliminación
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string>('');

  const fetchRutas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/rutas');
      if (!res.ok) throw new Error('Error al cargar la lista de rutas');
      const json = await res.json();
      setRutas(json.data || []);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar las rutas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRutas();
  }, [fetchRutas]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setNombre('');
    setIdClientesInput('');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEdit = async (id: string, currentNombre: string) => {
    try {
      setFetchingDetail(true);
      setErrorMsg(null);
      const res = await fetch(`/api/rutas/${id}`);
      if (!res.ok) throw new Error('Error al consultar el detalle de la ruta');
      const json = await res.json();
      const clientIds: string[] = json.data?.id_clientes || [];

      setEditingId(id);
      setNombre(json.data?.nombre || currentNombre);
      setIdClientesInput(clientIds.join('\n'));
      setModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el detalle para editar');
    } finally {
      setFetchingDetail(false);
    }
  };

  const handleViewClients = async (id: string, currentNombre: string) => {
    try {
      setViewModalOpen(true);
      setLoadingViewDetail(true);
      setViewError(null);
      setViewRouteData({ id, nombre: currentNombre, id_clientes: [] });

      const res = await fetch(`/api/rutas/${id}`);
      if (!res.ok) {
        throw new Error('No se pudo obtener la lista de clientes de la ruta');
      }

      const json = await res.json();
      setViewRouteData({
        id: json.data?.id || id,
        nombre: json.data?.nombre || currentNombre,
        id_clientes: json.data?.id_clientes || [],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar clientes';
      setViewError(msg);
      toast.error(msg);
    } finally {
      setLoadingViewDetail(false);
    }
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditingId(null);
    setNombre('');
    setIdClientesInput('');
    setErrorMsg(null);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewRouteData(null);
    setViewError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre de la ruta es obligatorio.');
      return;
    }
    if (!idClientesInput.trim()) {
      setErrorMsg('Debe ingresar al menos un ID de cliente.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const endpoint = editingId ? `/api/rutas/${editingId}` : '/api/rutas';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          id_clientes: idClientesInput,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Ocurrió un error al procesar la solicitud');
      }

      toast.success(editingId ? 'Ruta actualizada con éxito' : 'Ruta creada con éxito');
      handleCloseModal();
      fetchRutas();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la ruta';
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id: string, name: string) => {
    setDeletingId(id);
    setDeletingName(name);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/rutas/${deletingId}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Error al eliminar la ruta');
      }

      toast.success('Ruta eliminada correctamente');
      setDeletingId(null);
      setDeletingName('');
      fetchRutas();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la ruta';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Encabezado de la página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rutas de Facturación</h1>
          <p className="text-muted-foreground mt-1">
            Gestión y configuración de rutas con sus clientes asociados.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Ruta
        </Button>
      </div>

      {/* Indicador de Carga Inicial */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
          <p>Cargando rutas...</p>
        </div>
      ) : rutas.length === 0 ? (
        /* Estado Vacío */
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl mb-2">No hay rutas registradas</CardTitle>
          <p className="text-muted-foreground max-w-md mb-6">
            Comenzá creando tu primera ruta para asignar los IDs de los clientes correspondientes.
          </p>
          <Button onClick={handleOpenCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear primera ruta
          </Button>
        </Card>
      ) : (
        /* Grilla de Tarjetas de Rutas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rutas.map((ruta) => (
            <Card key={ruta.id} className="flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Link href={`/rutas/${ruta.id}`} className="hover:underline flex-1 min-w-0">
                  <CardTitle className="text-lg font-bold truncate pr-2 text-primary hover:text-primary/80 transition-colors">{ruta.nombre}</CardTitle>
                </Link>
                <div className="bg-primary/10 p-2.5 rounded-full shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>

              <CardContent className="pt-4 flex-grow">
                <Link href={`/rutas/${ruta.id}`} className="block group">
                  <div className="flex items-center gap-2 text-base font-medium text-foreground group-hover:text-primary transition-colors">
                    <Users className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>{ruta.total_clientes} Clientes asignados</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Creada el: {new Date(ruta.created_at).toLocaleDateString()}
                  </p>
                </Link>
              </CardContent>

              <CardFooter className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push(`/rutas/${ruta.id}`)}
                  className="flex items-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver detalle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(ruta.id, ruta.nombre)}
                  disabled={fetchingDetail}
                  className="flex items-center gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => confirmDelete(ruta.id, ruta.nombre)}
                  className="flex items-center gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Ver Clientes de la Ruta */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold leading-none">
                    {viewRouteData?.nombre || 'Clientes de la Ruta'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {loadingViewDetail
                      ? 'Cargando clientes...'
                      : `${viewRouteData?.id_clientes.length || 0} cliente(s) asignado(s)`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseViewModal}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto flex-grow">
              {loadingViewDetail ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
                  <p className="text-sm">Consultando clientes de la ruta...</p>
                </div>
              ) : viewError ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{viewError}</span>
                </div>
              ) : !viewRouteData?.id_clientes || viewRouteData.id_clientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mb-2 opacity-40" />
                  <p className="font-medium text-foreground">Esta ruta no tiene clientes asignados</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Podés agregar clientes haciendo clic en el botón Editar de la tarjeta.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                    <span>Lista de IDs asignados:</span>
                    <span>Total: {viewRouteData.id_clientes.length}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {viewRouteData.id_clientes.map((clientId, idx) => (
                      <div
                        key={`${clientId}-${idx}`}
                        className="bg-muted/60 border rounded-lg px-3 py-2 text-sm font-mono flex items-center gap-2 hover:bg-muted transition-colors"
                      >
                        <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{clientId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
              {viewRouteData && (
                <Button
                  onClick={() => router.push(`/rutas/${viewRouteData.id}/procesar`)}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Procesar Facturas
                </Button>
              )}
              <Button variant="outline" onClick={handleCloseViewModal}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear / Editar Ruta */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Editar Ruta' : 'Nueva Ruta'}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2.5 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Ruta</Label>
                <Input
                  id="nombre"
                  placeholder="Ej. Ruta Centro, Ruta Norte..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={submitting}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_clientes">IDs de Clientes</Label>
                <Textarea
                  id="id_clientes"
                  placeholder="Ingresá los IDs de cliente (ej: 10001, 10002 10003)"
                  value={idClientesInput}
                  onChange={(e) => setIdClientesInput(e.target.value)}
                  rows={6}
                  disabled={submitting}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Podés separar los IDs utilizando comas, espacios o saltos de línea. Los duplicados se eliminarán automáticamente.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingId ? 'Guardar Cambios' : 'Crear Ruta'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-xl border shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              ¿Eliminar Ruta?
            </h2>
            <p className="text-muted-foreground text-sm">
              ¿Estás seguro de que querés eliminar la ruta <strong className="text-foreground">{deletingName}</strong>? Esta acción eliminará la configuración y la asociación de sus clientes.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingId(null)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Sí, Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
