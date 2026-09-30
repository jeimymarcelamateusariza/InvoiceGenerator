import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseAndCleanClientIds } from '@/lib/rutas-utils';


interface RouteParams {
  params: Promise<{ id: string }>;
}


export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await Promise.resolve(params);

    const route = db
      .prepare(`SELECT id, nombre, created_at, updated_at FROM routes WHERE id = ?`)
      .get(id) as { id: string; nombre: string; created_at: string; updated_at: string } | undefined;

    if (!route) {
      return NextResponse.json(
        { error: 'La ruta especificada no existe', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const clientRows = db
      .prepare(`SELECT client_id FROM route_clients WHERE route_id = ? ORDER BY id ASC`)
      .all(id) as { client_id: string }[];

    const clientIds = clientRows.map((row) => row.client_id);

    return NextResponse.json(
      {
        data: {
          ...route,
          id_clientes: clientIds,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener la ruta:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar la ruta' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await Promise.resolve(params);

    const existingRoute = db
      .prepare(`SELECT id FROM routes WHERE id = ?`)
      .get(id);

    if (!existingRoute) {
      return NextResponse.json(
        { error: 'La ruta especificada no existe', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Cuerpo de solicitud inválido o no provisto', code: 'INVALID_BODY' },
        { status: 400 }
      );
    }

    const { nombre, id_clientes } = body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre de la ruta es obligatorio', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    const trimmedNombre = nombre.trim();
    const clientIds = parseAndCleanClientIds(id_clientes);

    if (clientIds.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un ID de cliente válido', code: 'INVALID_CLIENT_IDS' },
        { status: 400 }
      );
    }

    const invalidIds = clientIds.filter((clientId) => !/^[a-zA-Z0-9_\-]+$/.test(clientId));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          error: `Se encontraron IDs de cliente con formato inválido: ${invalidIds.join(', ')}`,
          code: 'INVALID_CLIENT_FORMAT',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const updateTransaction = db.transaction(() => {
      db.prepare(`
        UPDATE routes
        SET nombre = ?, updated_at = ?
        WHERE id = ?
      `).run(trimmedNombre, now, id);

      db.prepare(`DELETE FROM route_clients WHERE route_id = ?`).run(id);

      const insertClientStmt = db.prepare(`
        INSERT INTO route_clients (route_id, client_id, created_at)
        VALUES (?, ?, ?)
      `);

      for (const clientId of clientIds) {
        insertClientStmt.run(id, clientId, now);
      }
    });

    updateTransaction();

    return NextResponse.json(
      {
        data: {
          id,
          nombre: trimmedNombre,
          id_clientes: clientIds,
          updated_at: now,
        },
        message: 'Ruta actualizada exitosamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al actualizar la ruta:', error);
    return NextResponse.json(
      { error: 'Error interno al actualizar la ruta' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await Promise.resolve(params);

    const existingRoute = db
      .prepare(`SELECT id FROM routes WHERE id = ?`)
      .get(id);

    if (!existingRoute) {
      return NextResponse.json(
        { error: 'La ruta especificada no existe', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    db.prepare(`DELETE FROM routes WHERE id = ?`).run(id);

    return NextResponse.json(
      { message: 'Ruta eliminada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar la ruta:', error);
    return NextResponse.json(
      { error: 'Error interno al eliminar la ruta' },
      { status: 500 }
    );
  }
}
