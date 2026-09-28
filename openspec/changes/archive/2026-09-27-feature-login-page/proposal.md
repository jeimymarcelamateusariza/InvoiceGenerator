## Intent
Implement a new login page matching the provided design to establish user authentication for the application.

## Scope

### In Scope
- Create `src/app/login/page.tsx`
- Create `src/components/auth/LoginForm.tsx`
- Create/Update generic UI components (`button`, `input-group`, `label`)
- Add missing state context (`PermissionsContext.tsx`)
- Add missing API service (`auth.service.ts`)
- Install dependencies: `js-cookie` and `sonner`

### Out of Scope
- Real functionality for Google login (UI placeholders only)
- Real functionality for Registration (UI placeholders only)
- Real functionality for Forgot Password (UI placeholders only)

## Capabilities

### New Capabilities
- `user-auth`: Authentication logic and UI, handling user login, error notifications, and session management via cookies.

### Modified Capabilities
- None

## Approach
Implement the login page and components using React/Next.js. Introduce `auth.service.ts` for handling authentication API requests and `PermissionsContext.tsx` for state management. Use `js-cookie` for session storage and `sonner` for toast error/success notifications.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/login/page.tsx` | New | Entry point for login page |
| `src/components/auth/LoginForm.tsx` | New | Main login form component |
| `src/components/ui/` | New/Modified | Base UI components (button, input-group, label) |
| `src/context/PermissionsContext.tsx` | New | Global permissions state |
| `src/services/auth.service.ts` | New | Authentication service layer |
| `package.json` | Modified | Adding `js-cookie` and `sonner` dependencies |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Auth state mismatch | Medium | Ensure `PermissionsContext` properly syncs on mount with `js-cookie` |
| UI Component conflicts | Low | Verify existing component styles aren't broken by new additions |

## Rollback Plan
Revert the commit introducing the feature files, remove `js-cookie` and `sonner` from package.json, and run the package manager install command to restore `node_modules` state.

## Dependencies
- `js-cookie` package
- `sonner` package

## Success Criteria
- [ ] Login page renders correctly matching the design.
- [ ] Form elements correctly capture user input.
- [ ] Successful login invokes `auth.service.ts` and stores the resulting session.
- [ ] Error notifications appear via `sonner` on failed login attempts.
