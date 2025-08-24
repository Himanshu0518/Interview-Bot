import conf from "../conf/conf";

class TestServices {
  constructor() {
    this.BASE_URL = conf.BASE_URL;
  }

  // ✅ Helper: get token from localStorage
  getAuthHeader() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.access_token) throw new Error("No token found");
    return {
      Authorization: `Bearer ${user.access_token}`,
    };
  }

  // ✅ Upload resume (POST /upload_resume)
  async upload_resume(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${this.BASE_URL}/upload_resume`, {
        method: "POST",
        headers: this.getAuthHeader(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Resume upload failed: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log("Upload response:", result); // Debug log
      return result;
    } catch (error) {
      console.error("Upload resume error:", error);
      throw error;
    }
  }

  async submit_resume_data(resumeData) {
    try {
      const response = await fetch(`${this.BASE_URL}/resume_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeader(),
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Resume data submission failed: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log("Submit resume data response:", result);
      return result;
    } catch (error) {
      console.error("Submit resume data error:", error);
      throw error;
    }
  }
  
  // ✅ Get resume (GET /get_resume)
  async get_resume() {
    try {
      const response = await fetch(`${this.BASE_URL}/get_resume`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeader(),
        },
      });

      console.log("Get resume response status:", response.status); // Debug log

      if (!response.ok) {
        if (response.status === 404) {
          console.log("No resume found for user");
          return null; // User doesn't have a resume yet
        }
        const errorData = await response.text();
        throw new Error(`Fetching resume failed: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log("Get resume response:", result); // Debug log
      
      // Handle different possible response structures
      if (result.data) {
        return result.data; // If the response has a 'data' wrapper
      } else if (result.resume) {
        return result.resume; // If the response has a 'resume' wrapper
      } else {
        return result; // If the response is the resume data directly
      }
    } catch (error) {
      console.error("Get resume error:", error);
      throw error;
    }
  }

  // ✅ Get questions (POST /get_questions)
  async get_questions({num_questions, difficulty_level , target_companies, interview_type, interview_description}) {
    try {
      const response = await fetch(`${this.BASE_URL}/get_questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeader(),
        },
        body: JSON.stringify({ num_questions, difficulty_level , target_companies, interview_type, interview_description }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Fetching questions failed: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log("Get questions response:", result);
      return result;
    } catch (error) {
      console.error("Get questions error:", error);
      throw error;
    }
  }
}

export default new TestServices();