<invoice-listing Specification>
## Purpose

Viewing, filtering, and navigating paginated invoices, as well as handling authentication redirection.

## Requirements

### Requirement: Authentication Redirect

The system MUST restrict access to authenticated users.

#### Scenario: Unauthenticated access

- GIVEN a user without a valid `auth_token` cookie
- WHEN they attempt to access any page
- THEN they MUST be redirected to the login page

#### Scenario: Authenticated access

- GIVEN a user with a valid `auth_token` cookie
- WHEN they navigate to the invoice list
- THEN they MUST be granted access to the application

### Requirement: Invoice Listing

The system MUST display a paginated list of existing invoices.

#### Scenario: Viewing the first page

- GIVEN the user is on the invoice listing page
- WHEN the page loads
- THEN the system MUST display the first page of invoices fetched from `GET /api/v1/invoices`

### Requirement: Invoice Filtering

The system SHOULD allow users to filter and search the invoice list.

#### Scenario: Filtering by search term

- GIVEN the user is on the invoice listing page
- WHEN they enter a search term and submit
- THEN the system MUST display only the invoices matching the search criteria
