# Dashboard Layout Specification

## Purpose

Defines the requirements and user interaction scenarios for the main application dashboard layout, including primary color margin framing, dynamic light/dark 95% container, top header controls, and module navigation cards.

## Requirements

### Requirement: Outer Background and Container Layout

The system MUST render an outer background using the primary theme color (`var(--primary)` / `#6e11b0`) that frames a centered 95% width container (`w-[95%] max-w-7xl`). The container MUST feature rounded corners (`rounded-2xl` or `rounded-3xl`) and generous internal padding (`p-6` to `p-8`) allowing the primary background to be visible on the outer margins.

#### Scenario: Visual framing in Light and Dark mode
- GIVEN the user navigates to the main root route (`/`)
- WHEN the page renders in either Light or Dark mode
- THEN the outer viewport edges show the primary brand color frame
- AND the inner container occupies 95% width (`max-w-7xl`) with rounded corners and appropriate contrast background (`bg-background`/`bg-white` in Light, `bg-slate-900`/`bg-zinc-950` in Dark).

### Requirement: Header Greeting and Actions

The header MUST display a static welcome greeting "¡Bienvenido! 👋" on the left and control actions on the right (Theme Toggle button with sun/moon icon, and Logout button).

#### Scenario: Interacting with theme toggle in header
- GIVEN the user is on the main dashboard
- WHEN the user clicks the theme toggle button in the top right of the container header
- THEN the theme switches between Light and Dark mode smoothly
- AND the inner container background and typography update accordingly without affecting the outer primary frame.

### Requirement: Module Navigation Cards

The system MUST present two prominent navigation cards for **Facturas** (redirecting to `/invoices`) and **Rutas** (redirecting to `/rutas`). Each card MUST feature an icon, descriptive title, summary text, hover elevation (`hover:shadow-lg`, `hover:border-primary/50`), and visual redirection cue.

#### Scenario: Navigating to Facturas or Rutas
- GIVEN the user is on the main dashboard
- WHEN the user hovers over either the Facturas or Rutas card
- THEN the card displays a smooth elevation shadow and primary border highlight
- WHEN the user clicks the card
- THEN the application navigates to `/invoices` or `/rutas` respectively.
