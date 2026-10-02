# Tasks: Main Dashboard Layout

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150-220 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full dashboard visual layout implementation | Single PR | Complete component and layout refactor |

## Phase 1: Client Components (Foundation)

- [x] 1.1 Create `src/components/dashboard/ThemeToggle.tsx` client button toggling dark mode on document element.
- [x] 1.2 Create `src/components/dashboard/DashboardHeader.tsx` displaying "¡Bienvenido! 👋", `ThemeToggle`, and `LogoutButton`.
- [x] 1.3 Create `src/components/dashboard/NavigationCard.tsx` with Lucide icons, hover elevation (`hover:shadow-lg`, `hover:border-primary/50`), and redirection link.

## Phase 2: Main Layout and Page Wiring (Core Implementation)

- [x] 2.1 Update `src/app/(main)/layout.tsx` to render outer primary margin frame (`bg-primary`) around centered 95% container (`w-[95%] max-w-7xl rounded-3xl`).
- [x] 2.2 Update `src/app/(main)/page.tsx` to render `DashboardHeader` and 2-column grid of `NavigationCard` components for Facturas (`/invoices`) and Rutas (`/rutas`).

## Phase 3: Polish & Verification

- [x] 3.1 Verify Light mode and Dark mode transitions on the container without altering outer primary background color.
- [x] 3.2 Verify responsive layout behavior on desktop, tablet, and mobile views.
