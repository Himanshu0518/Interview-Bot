// services/auth.js
import conf from "../conf/conf";


class AuthServices {
  constructor() {
    this.BASE_URL = conf.BASE_URL ;
    this.API_URL =  `${this.BASE_URL}/auth`
  }

  // ✅ Register new user (FastAPI endpoint: /auth/register)
  async register({username, email, password}) {
    try {
      
      const response = await fetch(`${this.API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) throw new Error("Registration failed");
      return await response.json();
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  // ✅ Login user (FastAPI endpoint: /auth/token uses OAuth2PasswordRequestForm)
  async login({username, password}) {
    try {
      const response = await fetch(`${this.API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username,
          password,
        }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();

      // Store JWT token in localStorage
      if (data.access_token) {
        localStorage.setItem("user", JSON.stringify(data));
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // ✅ Logout user
  logout() {
    localStorage.removeItem("user");
  }

  // ✅ Get current user from localStorage
  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }

  // // ✅ Get user profile (protected endpoint: /auth/profile)
  // async getProfile() {
  //   const user = this.getCurrentUser();
  //   if (!user?.access_token) throw new Error("No token found");

  //   try {
  //     const response = await fetch(`${this.API_URL}/profile`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${user.access_token}`,
  //       },
  //     });

  //     if (!response.ok) throw new Error("Failed to fetch profile");

  //     return await response.json();
  //   } catch (error) {
  //     console.error("Profile error:", error);
  //     throw error;
  //   }
  // }
}

// Export single instance
export default new AuthServices();
