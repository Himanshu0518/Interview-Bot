import conf from "../conf/conf";

class MockServices {
  constructor() {
    this.BASE_URL = conf.BASE_URL;
    this.API_URL = `${this.BASE_URL}/mock`;
  }

  getAuthHeader() {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.access_token) throw new Error("No token found");
      return {
        Authorization: `Bearer ${user.access_token}`,
      };
    } catch (e) {
      throw new Error("Invalid or missing token");
    }
  }


  async get_mock_questions({ num_questions, difficulty_level, job_description, interview_type }) {
    try {
      const response = await fetch(`${this.API_URL}/get_questions`, {
        method: "POST", // 🔹 changed from GET
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeader(),
        },
        body: JSON.stringify({ num_questions, difficulty_level, job_description, interview_type }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Fetching mock questions failed: ${response.status} - ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get mock questions error:", error);
      throw error;
    }
  }

  async get_rating({ question, expected_answer, user_answer }) {
    try {
      const response = await fetch(`${this.API_URL}/get_rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeader(),
        },
        body: JSON.stringify({ question, expected_answer, user_answer }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Fetching rating failed: ${response.status} - ${errorData}`);
      }

      return await response.json(); 
    } catch (error) {
      console.error("Get rating error:", error);
      throw error;
    }
  }
}

export default new MockServices();
