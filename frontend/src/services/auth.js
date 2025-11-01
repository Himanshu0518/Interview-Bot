// services/auth.js
import conf from "../conf/conf";

class AuthServices {
  constructor() {
    this.BASE_URL = conf.BASE_URL;
    this.API_URL = `${this.BASE_URL}/auth`;
  }

  // ✅ Register new user
  async register({ username, email, password }) {
    try {
      const response = await fetch(`${this.API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        // Handle different error formats
        let errorMessage = "Registration failed";
        
        if (data?.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (data.detail?.message) {
            errorMessage = data.detail.message;
          } else if (Array.isArray(data.detail)) {
            // Handle validation errors array
            errorMessage = data.detail.map(err => err.msg || JSON.stringify(err)).join(', ');
          }
        }

        throw {
          status: response.status,
          code: data?.detail?.code || null,
          message: errorMessage,
        };
      }

      return data;
    } catch (error) {
      // Re-throw if it's already our custom error
      if (error.message) {
        throw error;
      }
      // Handle network errors
      throw new Error("Network error. Please check if backend is running.");
    }
  }

  // ✅ Login user
  async login({ username, password }) {
    try {
      const response = await fetch(`${this.API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username,
          password,
        }),
      });

      // Check if response has content before parsing JSON
      const text = await response.text();
      
      if (!text) {
        throw new Error(`Empty response from server. Please check if backend is running on ${this.BASE_URL}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Server returned invalid response. Make sure backend is running at ${this.BASE_URL}`);
      }

      if (!response.ok) {
        // Handle different error formats from FastAPI
        let errorMessage = "Login failed";
        
        if (data?.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (data.detail?.message) {
            errorMessage = data.detail.message;
          } else if (Array.isArray(data.detail)) {
            // Handle validation errors array from FastAPI/Pydantic
            errorMessage = data.detail.map(err => {
              if (err.msg) return err.msg;
              if (err.message) return err.message;
              return JSON.stringify(err);
            }).join(', ');
          } else if (typeof data.detail === 'object') {
            // Handle object errors
            errorMessage = JSON.stringify(data.detail);
          }
        }

        throw new Error(errorMessage);
      }

      // Store JWT token in localStorage
      if (data.access_token) {
        localStorage.setItem("user", JSON.stringify(data));
      }

      return data;
    } catch (error) {
      // If it's already an Error object with a message, throw it
      if (error instanceof Error) {
        throw error;
      }
      // Handle unexpected errors
      throw new Error("An unexpected error occurred during login");
    }
  }

  logout() {
    localStorage.removeItem("user");
  }

  // ✅ Get current user
  getCurrentUser() {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      return null;
    }
  }
}

// Export single instance
export default new AuthServices();
