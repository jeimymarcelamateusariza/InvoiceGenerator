<Tasks: visual-rutas>
## Review Workload Forecast
| Field | Value |
| ----- | ----- |
| Decision needed before apply | No |
| Chained PRs recommended | No |
| Chain strategy | pending |
| 400-line budget risk | Low |

## Phase 1: Datos Mock
- [x] 1.1 Crear `src/app/rutas/_lib/mock-data.ts`, definiendo la interfaz `RutaVisual` (id, nombre, clientes, facturas, estado, icono) y exportando un arreglo de datos simulados.

## Phase 2: Interfaz Gráfica
- [x] 2.1 Crear `src/app/rutas/page.tsx`. Importar los mocks desde `src/app/rutas/_lib/mock-data.ts` y los componentes base desde `src/components/ui/card.tsx`.
- [x] 2.2 Implementar en `src/app/rutas/page.tsx` el layout principal utilizando un grid responsive de Tailwind (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
- [x] 2.3 Mapear el arreglo de rutas en `src/app/rutas/page.tsx` para renderizar el componente `Card` mostrando el nombre, estado, clientes y facturas.
- [x] 2.4 Agregar en el footer de cada tarjeta en `src/app/rutas/page.tsx` un `<Link href={\`/rutas/\${ruta.id}\`}>` para navegar al detalle de la ruta con el texto "Ver ruta".
</Tasks: visual-rutas>
