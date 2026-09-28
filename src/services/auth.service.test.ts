import { authService } from "./auth.service";

describe("authService", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("handles successful login", async () => {
    const mockResponse = { token: "fake-token", user: { id: "1", email: "test@test.com", permissions: [] } };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await authService.login({ email: "test@test.com", password: "password" });
    expect(result).toEqual(mockResponse);
  });

  it("handles failed login", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    await expect(authService.login({ email: "test@test.com", password: "wrong" })).rejects.toThrow("Invalid credentials");
  });
});
