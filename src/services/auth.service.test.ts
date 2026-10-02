import { describe, beforeEach, it, expect, vi } from "vitest";
import { authService } from "./auth.service";

describe("authService", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("handles successful login", async () => {
    const mockResponse = { token: "fake-token", user: { id: "1", email: "test@test.com", permissions: [] } };
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await authService.login({ email: "test@test.com", password: "password" });
    expect(result).toEqual(mockResponse);
  });

  it("handles failed login", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    await expect(authService.login({ email: "test@test.com", password: "wrong" })).rejects.toThrow("Invalid credentials");
  });
});

