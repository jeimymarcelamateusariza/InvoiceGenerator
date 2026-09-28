## Exploration: Implement a new login page

### Current State
The project is a Next.js 15 application using the App Router (`src/app`). 
- Currently, there is no `/login` page. 
- The required UI components (`button`, `input-group`, `label`) under `@/components/ui` do not exist.
- The `auth.service.ts` and `PermissionsContext` files do not exist.
- `lucide-react` is installed, but `js-cookie` and `sonner` are not listed in `package.json`.

### Affected Areas
- `src/app/login/page.tsx` — New entry point for the login route.
- `src/components/auth/LoginForm.tsx` — Location for the provided login form code.
- `src/components/ui/{button,input-group,label}.tsx` — Missing UI components that must be created.
- `src/services/auth.service.ts` — Missing service that must be created for the custom API (`https://back.ispstart.com/api/v1/auth/login`).
- `src/context/PermissionsContext.tsx` — Missing context that must be scaffolded.
- `package.json` — Will be updated with `js-cookie` and `sonner`.

### Approaches
1. **Full Implementation with Mocks** — Create the login page, create all missing UI components, add dependencies, and scaffold basic structures for `auth.service` and `PermissionsContext`.
   - Pros: Unblocks frontend work while keeping proper separation of concerns.
   - Cons: Adds multiple new files that might need substantial adjustments later.
   - Effort: Medium

2. **UI-Only Scaffold** — Create the `/login` route and `LoginForm`, but inline or simplify the missing context/services, avoiding deep architectural additions for now.
   - Pros: Faster, focused solely on the visual output.
   - Cons: Harder to connect to real state later.
   - Effort: Low

### Recommendation
Proceed with **Approach 1 (Full Implementation with Mocks)**. This ensures that the components, services, and contexts are properly placed, maintaining a scalable Next.js App Router architecture.

### Risks
- Adding dependencies (`sonner`, `js-cookie`) if they conflict with existing app patterns.
- Mocking `PermissionsContext` and `auth.service` might diverge from eventual actual requirements.

### Ready for Proposal
Yes — The orchestrator should notify the user that several missing UI components, contexts, services, and npm dependencies (`js-cookie`, `sonner`) will need to be created/installed.
