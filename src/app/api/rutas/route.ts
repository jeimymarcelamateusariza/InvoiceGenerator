import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseAndCleanClientIds } from '@/lib/rutas-utils';
import crypto from 'crypto';


export async function GET() {
  try {
    const routes = db
      .prepare(`
        SELECT 
          r.id, 
          r.nombre, 
          r.created_at, 
          r.updated_at,
          COUNT(rc.client_id) AS total_clientes
        FROM routes r
        LEFT JOIN route_clients rc ON r.id = rc.route_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `)
      .all();

    return NextResponse.json({ data: routes }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener la lista de rutas:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar las rutas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // Validar formato alfanumérico / IDs válidos
    const invalidIds = clientIds.filter((id) => !/^[a-zA-Z0-9_\-]+$/.test(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          error: `Se encontraron IDs de cliente con formato inválido: ${invalidIds.join(', ')}`,
          code: 'INVALID_CLIENT_FORMAT',
        },
        { status: 400 }
      );
    }

    const routeId = `ruta-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const insertTransaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO routes (id, nombre, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `).run(routeId, trimmedNombre, now, now);

      const insertClientStmt = db.prepare(`
        INSERT INTO route_clients (route_id, client_id, created_at)
        VALUES (?, ?, ?)
      `);

      for (const clientId of clientIds) {
        insertClientStmt.run(routeId, clientId, now);
      }
    });

    insertTransaction();

    return NextResponse.json(
      {
        data: {
          id: routeId,
          nombre: trimmedNombre,
          id_clientes: clientIds,
          created_at: now,
        },
        message: 'Ruta creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear la ruta:', error);
    return NextResponse.json(
      { error: 'Error interno al crear la ruta' },
      { status: 500 }
    );
  }
}
