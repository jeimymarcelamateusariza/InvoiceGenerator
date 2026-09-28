import Cookies from "js-cookie";

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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://back.ispstart.com";
    const tenantDomain = process.env.NEXT_PUBLIC_TENANT_DOMAIN;

    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(tenantDomain ? { "X-Tenant-Domain": tenantDomain } : {}),
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let errorMessage = "Login failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Fallback to default message
      }
      throw new Error(errorMessage);
    }

    const payload = await response.json();

    // Save the token to cookies so the rest of the app can use it
    // The response is { data: { access_token: "..." } }
    const token = payload.data?.access_token || payload.access_token || payload.token;
    if (token) {
      Cookies.set("auth_token", token, { expires: 7 });
    }

    return payload;
  },
};
