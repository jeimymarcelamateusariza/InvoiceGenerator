import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./LoginForm";
import { PermissionsProvider } from "@/context/PermissionsContext";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

jest.mock("@/services/auth.service");
jest.mock("sonner");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("LoginForm", () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (authService.login as jest.Mock).mockClear();
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
  });

  it("submits the form successfully and redirects", async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      token: "fake-token",
      user: { id: "1", email: "test@example.com", permissions: [] },
    });

    render(
      <PermissionsProvider>
        <LoginForm />
      </PermissionsProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({ email: "test@example.com", password: "password123" });
    });
    
    expect(toast.success).toHaveBeenCalledWith("Login successful");
    expect(mockRouterPush).toHaveBeenCalledWith("/");
  });

  it("shows error on failed login", async () => {
    (authService.login as jest.Mock).mockRejectedValue(new Error("Invalid credentials"));

    render(
      <PermissionsProvider>
        <LoginForm />
      </PermissionsProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } });
    
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
  });
});
