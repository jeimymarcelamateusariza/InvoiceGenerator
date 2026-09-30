<Design: visual-rutas>
## Technical Approach
Implementar una nueva vista para listar las rutas de facturación utilizando un diseño de grid de tarjetas (`grid` en Tailwind CSS).
Se usará el componente existente `Card` (ubicado en `src/components/ui/card.tsx`) para representar cada ruta, el cual ya soporta la estructura base y los estilos del sistema.
Para satisfacer el requerimiento de diseño, la tarjeta contendrá un ícono centrado en la parte superior, seguido por un título en negrita (nombre de la ruta) y texto descriptivo abajo (cantidad de clientes, facturas y estado).

## Architecture Decisions
- **Next.js App Router**: Se creará la nueva página bajo el directorio `rutas` en `src/app/rutas/page.tsx`.
- **Componente Card Reutilizable**: Se utilizarán las piezas de `Card` (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) y un contenedor flex o grid para la alineación del icono en la parte superior central.
- **Responsive Design**: Se utilizarán utilidades de Tailwind (`grid`, `grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-3`, `gap-6`) para garantizar la adaptación móvil (una columna) a desktop (múltiples columnas).
- **Aislamiento de Datos**: Según el requerimiento `REQ-RUTAS-05`, la provisión de datos será simulada usando un mock local exportado.

## Data Flow
1. El usuario navega a la ruta `/rutas`.
2. El Server Component `Page` en `src/app/rutas/page.tsx` importa la función de obtención de datos.
3. Esta función retornará de manera síncrona o asíncrona un array de objetos proveniente de un archivo de mocks.
4. El render de la página iterará sobre el arreglo, pintando un `<Card>` por cada ruta.
5. Cada tarjeta incluirá un componente `<Link href={`/rutas/${ruta.id}`}>` en su acción "Ver ruta" para navegar al detalle.

## File Changes
- **`src/app/rutas/page.tsx`**: Componente principal y punto de entrada para la página de rutas. Renderiza el layout grid y las tarjetas.
- **`src/app/rutas/_lib/mock-data.ts`** (o equivalente en el dominio local): Archivo que expone la data de rutas simuladas y las interfaces/types, para aislar la dependencia mockeada de la UI real.

## Interfaces / Contracts
```typescript
export interface RutaVisual {
  id: string;
  nombre: string;
  clientes: number;
  facturas?: number;
  estado: 'Pendiente' | 'En Proceso' | 'Completado';
  icono?: string;
}
```

## Testing Strategy
- **Verificación Responsiva**: Pruebas manuales ajustando el viewport para validar que las tarjetas pasen de 1 a N columnas.
- **Verificación Visual de Componentes**: Confirmar que los componentes de la interfaz utilizan exclusivamente las clases CSS de Tailwind existentes y el componente `Card` del proyecto sin estilos en duro (hardcoded colors).
- **Resiliencia de Datos**: Validar la visualización correcta cuando las propiedades opcionales (como `facturas`) no vengan en la respuesta del mock.

## Migration / Rollout
Esta es una adición aditiva (nueva ruta). No requiere migración de datos. El lanzamiento simplemente habilitará la navegación a `/rutas`.

## Open Questions
- ¿Existe un límite esperado de tarjetas a renderizar al mismo tiempo, o será necesaria paginación/scroll infinito para las rutas?
- ¿Dónde se agregará el enlace de entrada a esta vista (ej. Sidebar, Header)?
