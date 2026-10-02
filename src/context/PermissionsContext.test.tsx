import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { PermissionsProvider, usePermissions } from "./PermissionsContext";
import Cookies from "js-cookie";

vi.mock("js-cookie");

const TestComponent = () => {
  const { user, setUser, isAuthenticated, hasPermission, logout } = usePermissions();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? "Logged In" : "Logged Out"}</div>
      <div data-testid="permission-status">{hasPermission("admin") ? "Is Admin" : "Not Admin"}</div>
      <button onClick={() => setUser({ id: "1", email: "test@test.com", permissions: ["admin"] })}>
        Login User
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("PermissionsContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides authentication state and handles login/logout", () => {
    render(
      <PermissionsProvider>
        <TestComponent />
      </PermissionsProvider>
    );

    expect(screen.getByTestId("auth-status").textContent).toBe("Logged Out");

    act(() => {
      screen.getByText("Login User").click();
    });

    expect(screen.getByTestId("auth-status").textContent).toBe("Logged In");
    expect(screen.getByTestId("permission-status").textContent).toBe("Is Admin");
    expect(Cookies.set).toHaveBeenCalled();

    act(() => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("auth-status").textContent).toBe("Logged Out");
    expect(Cookies.remove).toHaveBeenCalled();
  });
});

