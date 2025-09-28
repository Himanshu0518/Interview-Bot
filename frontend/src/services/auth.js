// services/auth.js
import conf from "../conf/conf";

class AuthServices {
  constructor() {
    this.BASE_URL = conf.BASE_URL;
    this.API_URL = `${this.BASE_URL}/auth`;
  }

  // ✅ Register new user
async register({ username, email, password }) {
  const response = await fetch(`${this.API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      code: data?.detail?.code || null,
      message: data?.detail?.message || data?.detail || "Registration failed",
    };
  }

  return data;
}


  // ✅ Login user
  async login({ username, password }) {
    const response = await fetch(`${this.API_URL}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.detail?.message || data?.detail || "Login failed";
      throw new Error(message);
    }

    // Store JWT token in localStorage
    if (data.access_token) {
      localStorage.setItem("user", JSON.stringify(data));
    }

    return data;
  }

  logout() {
    localStorage.removeItem("user");
  }

  // ✅ Get current user
  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }

  // // Example: ✅ Fetch protected profile endpoint
  // async getProfile() {
  //   const user = this.getCurrentUser();
  //   if (!user?.access_token) throw new Error("No token found");
  //
  //   try {
  //     const response = await fetch(`${this.API_URL}/profile`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${user.access_token}`,
  //       },
  //     });
  //
  //     const data = await response.json();
  //
  //     if (!response.ok) {
  //       const message =
  //         data?.detail?.message || data?.detail || "Failed to fetch profile";
  //       throw new Error(message);
  //     }
  //
  //     return data;
  //   } catch (error) {
  //     console.error("Profile error:", error);
  //     throw error;
  //   }
  // }
}

// Export single instance
export default new AuthServices();
