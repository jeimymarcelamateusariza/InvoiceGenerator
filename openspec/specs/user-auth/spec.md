<user-auth Specification>
## Purpose

Defines the authentication logic and UI, handling user login, error notifications, and session management.

## Requirements

### Requirement: Successful Login

The system MUST allow users to log in with an email and password via a custom API, and redirect them upon success.

#### Scenario: Valid credentials

- GIVEN the user is on the login page
- WHEN the user submits valid email and password credentials
- THEN the system stores the user session via js-cookie and user context
- AND the user is redirected to `/dashboard`

#### Scenario: Already logged in

- GIVEN the user has an active session via js-cookie and user context
- WHEN the user navigates to the login page
- THEN the system immediately redirects the user to `/dashboard`

### Requirement: Error Handling

The system MUST display error notifications for invalid login attempts.

#### Scenario: Invalid credentials

- GIVEN the user is on the login page
- WHEN the user submits an invalid email or password
- THEN the system displays an error notification
- AND the user remains on the login page

### Requirement: UI-Only Actions

The system MUST display non-functional placeholder buttons for third-party logins and account recovery options.

#### Scenario: Clicking placeholder buttons

- GIVEN the user is on the login page
- WHEN the user clicks the Google login, Register, or Forgot Password buttons
- THEN no functional action occurs
- AND the user remains on the login page
</user-auth Specification>
