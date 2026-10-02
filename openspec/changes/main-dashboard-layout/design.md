# Design: Main Dashboard Layout

## Technical Approach

Implement an aesthetic framing layout using Tailwind CSS v4 and Next.js App Router (`src/app/(main)`). The outer background uses `bg-primary` (`#6e11b0`), creating a margin border around a 95% centered container. Theme toggling (`dark` class on html/container) allows seamless light (`bg-white`) and dark (`bg-slate-900`) rendering.

## Architecture Decisions

### Decision 1: Outer Primary Frame via Main Layout
**Choice**: Apply `bg-primary` on `src/app/(main)/layout.tsx` outer container with padding (`p-4 sm:p-6`).
**Alternatives considered**: Inner border or box-shadow overlay.
**Rationale**: Native padding with primary background ensures clean responsive margins around the 95% inner card across all viewport sizes.

### Decision 2: Self-contained Navigation Cards Component
**Choice**: Create reusable component `NavigationCard` in `src/components/dashboard/NavigationCard.tsx`.
**Alternatives considered**: Inline card HTML in `page.tsx`.
**Rationale**: Encapsulates Lucide icons, hover elevation states, title, description, and directional redirection link cleanly.

### Decision 3: Theme Toggle Client Hook
**Choice**: Inline client `ThemeToggle` component managing `.dark` class state on `document.documentElement` with `localStorage` persistence.
**Alternatives considered**: Heavy context wrapper library.
**Rationale**: Lightweight, fast, zero hydration flicker when initialized cleanly.

## Data Flow

```
[ Layout (bg-primary) ]
    └─► [ Container w-[95%] max-w-7xl (Light: bg-white / Dark: bg-slate-900) ]
            ├─► [ DashboardHeader: "¡Bienvenido! 👋" | ThemeToggle | LogoutButton ]
            └─► [ Grid (2 cols) ]
                    ├─► NavigationCard (/invoices)
                    └─► NavigationCard (/rutas)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/(main)/layout.tsx` | Modify | Primary background frame & 95% centered container |
| `src/app/(main)/page.tsx` | Modify | Render header and module navigation cards |
| `src/components/dashboard/DashboardHeader.tsx` | Create | Header with greeting, theme toggle, and logout button |
| `src/components/dashboard/ThemeToggle.tsx` | Create | Client toggle button for Dark/Light mode |
| `src/components/dashboard/NavigationCard.tsx` | Create | Interactive module card component |

## Interfaces / Contracts

```typescript
export interface NavigationCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  actionText?: string;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Manual / Visual | Layout responsiveness, dark mode toggle, card hover states | Browser inspection & dark class verification |

## Migration / Rollout

No migration required.
