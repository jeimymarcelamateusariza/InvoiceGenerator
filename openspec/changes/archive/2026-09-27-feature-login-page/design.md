## Technical Approach

Implement a new login page in Next.js using React Server Components for the layout and Client Components for interactive elements. The solution relies on standard HTML forms managed by React state within a `LoginForm` component. Authentication API calls will be abstracted into `auth.service.ts`, while session and permission state will be managed globally via a React Context (`PermissionsContext`). For side-effects like session persistence and user notifications, we will leverage `js-cookie` and `sonner`, respectively.

## Architecture Decisions

### Decision: State Management for Authentication

**Choice**: React Context (`PermissionsContext`) paired with `js-cookie`.
**Alternatives considered**: Redux, Zustand, or NextAuth.js.
**Rationale**: The application needs simple, lightweight global access to permission states. NextAuth.js is heavier and may be overkill for a custom backend API. React Context handles our requirements without adding unnecessary complexity, and `js-cookie` provides an easy way to persist tokens across requests.

### Decision: UI Notifications

**Choice**: `sonner` for toast notifications.
**Alternatives considered**: React-Toastify or custom built notification system.
**Rationale**: `sonner` is highly customizable, accessible out of the box, and lightweight compared to older libraries, integrating cleanly with modern Next.js applications.

### Decision: API Abstraction

**Choice**: Dedicated service layer (`services/auth.service.ts`).
**Alternatives considered**: Inline `fetch` calls inside components.
**Rationale**: Abstracting API calls keeps components clean and makes it much easier to mock authentication endpoints during testing or adapt to backend changes in the future.

## Data Flow

    [User Interaction]
           │
           ▼
    LoginForm (UI Component) ──(onSubmit)──▶ auth.service.ts (API Request)
           │                                      │
       (Success/Error)                      (Response Data)
           │                                      ▼
           ▼                              js-cookie (Store Token)
    sonner (Toast Notification)                   │
                                                  ▼
                                      PermissionsContext (Update State)

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/login/page.tsx` | Create | Entry point for login page. Renders layout and `LoginForm`. |
| `src/components/auth/LoginForm.tsx` | Create | Main client component handling form state and submission. |
| `src/components/ui/button.tsx` | Create/Modify | Base button UI component used in the form. |
| `src/components/ui/input-group.tsx` | Create/Modify | Wrapper component for inputs and labels. |
| `src/components/ui/label.tsx` | Create/Modify | Accessible label component for inputs. |
| `src/context/PermissionsContext.tsx` | Create | Global React Context provider for user permissions and auth state. |
| `src/services/auth.service.ts` | Create | Abstraction layer for authentication API requests (login, etc.). |
| `package.json` | Modify | Add `js-cookie` and `sonner` to dependencies. |

## Interfaces / Contracts

```typescript
// src/services/auth.service.ts
export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    permissions: string[];
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // API call implementation
  }
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `auth.service.ts` | Mock `fetch` to test successful and failed API responses. |
| Unit | `PermissionsContext.tsx` | Test context provider renders children and updates state correctly. |
| Integration | `LoginForm.tsx` | Render form with context provider, simulate input and submit. Verify `authService.login` is called and toasts trigger. |

## Migration / Rollout

No migration required. Ensure that `npm install` is run after code changes to resolve `js-cookie` and `sonner` dependencies.

## Open Questions

- [ ] What is the exact API endpoint URL for the backend authentication service?
- [ ] Are there specific validation rules (e.g., minimum password length) required for the frontend beyond standard empty checks?
