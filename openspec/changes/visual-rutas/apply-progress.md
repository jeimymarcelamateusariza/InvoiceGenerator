# Apply Progress - visual-rutas

## Completed Tasks
- [x] 1.1 Crear `src/app/rutas/_lib/mock-data.ts`, definiendo la interfaz `RutaVisual` (id, nombre, clientes, facturas, estado, icono) y exportando un arreglo de datos simulados.
- [x] 2.1 Crear `src/app/rutas/page.tsx`. Importar los mocks desde `src/app/rutas/_lib/mock-data.ts` y los componentes base desde `src/components/ui/card.tsx`.
- [x] 2.2 Implementar en `src/app/rutas/page.tsx` el layout principal utilizando un grid responsive de Tailwind (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
- [x] 2.3 Mapear el arreglo de rutas en `src/app/rutas/page.tsx` para renderizar el componente `Card` mostrando el nombre, estado, clientes y facturas.
- [x] 2.4 Agregar en el footer de cada tarjeta en `src/app/rutas/page.tsx` un `<Link href={\`/rutas/\${ruta.id}\`}>` para navegar al detalle de la ruta con el texto "Ver ruta".

## Files Changed
- `src/app/rutas/_lib/mock-data.ts`
- `src/app/rutas/page.tsx`
- `openspec/changes/visual-rutas/tasks.md`

## Notes
- Mocks are providing basic data for visualization.
- UI built with shadcn/ui Card component and Lucide icons.
- Next.js App Router pattern followed.
