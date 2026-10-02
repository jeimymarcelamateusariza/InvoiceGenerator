# Proposal: Main Dashboard Layout

## Intent

Provide a modern, responsive home dashboard layout for the application featuring primary background framing (`#6e11b0`), a 95% width dynamic container with rounded corners and generous padding, a clean header with "¡Bienvenido! 👋" and top controls (theme toggle + logout), and interactive navigation cards for Facturas and Rutas.

## Scope

### In Scope
- Primary color outer background framing visible in page margins.
- Container centered at `w-[95%] max-w-7xl` with `rounded-2xl`/`rounded-3xl` corners and `p-6` to `p-8` padding.
- Dynamic theme styling (Light: `bg-background`/`bg-white`, Dark: `bg-slate-900`/`bg-zinc-950`).
- Header component with left greeting "¡Bienvenido! 👋" and right action buttons (theme toggle sun/moon icon + logout outline/ghost button).
- Two module cards (Facturas -> `/invoices`, Rutas -> `/rutas`) with hover elevation (`hover:shadow-lg`, `hover:border-primary/50`), clear icon, description, and directional action arrow/button.

### Out of Scope
- Backend API endpoints or SQLite schema modifications.
- Authentication flow changes.

## Capabilities

### New Capabilities
- `dashboard-layout`: Visual container, header controls, theme switching integration, and module navigation card components.

### Modified Capabilities
None.

## Approach

1. Update `src/app/(main)/layout.tsx` to render the outer primary background frame and inner centered 95% max-w-7xl container.
2. Build `DashboardHeader` with theme toggle hook/state and logout action.
3. Build `NavigationCard` component supporting primary border highlights, hover shadows, and route redirection.
4. Compose `src/app/(main)/page.tsx` with the new dashboard header and navigation card grid.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/(main)/layout.tsx` | Modified | Wrap content in primary margin frame and 95% container |
| `src/app/(main)/page.tsx` | Modified | Render dashboard header and module navigation grid |
| `src/components/dashboard/DashboardHeader.tsx` | New | Header with greeting, theme toggle, and logout button |
| `src/components/dashboard/NavigationCard.tsx` | New | Interactive cards for Facturas and Rutas |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Theme toggle hydration mismatch | Low | Use standard client theme state with `mounted` check or existing theme context |

## Rollback Plan

Git revert changes in `src/app/(main)` and delete `src/components/dashboard/`.

## Success Criteria

- [ ] Outer page margins display primary color background (`#6e11b0`).
- [ ] Inner container occupies 95% width (`max-w-7xl`) with rounded corners and distinct light/dark background.
- [ ] Header includes "¡Bienvenido! 👋", theme toggle, and logout button.
- [ ] Navigation cards for Facturas and Rutas hover smoothly and redirect to `/invoices` and `/rutas`.
