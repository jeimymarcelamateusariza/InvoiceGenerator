import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { LoginForm } from "./LoginForm";
import { PermissionsProvider } from "@/context/PermissionsContext";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

vi.mock("@/services/auth.service");
vi.mock("sonner");
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("LoginForm", () => {
  const mockRouterPush = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({ push: mockRouterPush } as any);
    vi.clearAllMocks();
  });

  it("submits the form successfully and redirects", async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: "fake-token",
      user: { id: "1", email: "test@example.com", permissions: [] },
    });

    render(
      <PermissionsProvider>
        <LoginForm />
      </PermissionsProvider>
    );

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "password123" } });
    
    fireEvent.submit(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({ email: "test@example.com", password: "password123" });
    });
    
    expect(toast.success).toHaveBeenCalledWith("Inicio de sesión exitoso");
    expect(mockRouterPush).toHaveBeenCalledWith("/");
  });

  it("shows error on failed login", async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error("Invalid credentials"));

    render(
      <PermissionsProvider>
        <LoginForm />
      </PermissionsProvider>
    );

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "wrong" } });
    
    fireEvent.submit(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
  });
});

