const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

const DashboardServices = {
  //  Get Authorization header
  getAuthHeader() {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.access_token) throw new Error("No token found");
      return {
        Authorization: `Bearer ${user.access_token}`,
      };
    } catch (e) {
      console.error("Auth header error:", e.message);
      throw new Error("Invalid or missing token");
    }
  },

  //  Save test result (WITH AUTH)
  saveTestResult: async (testData) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...DashboardServices.getAuthHeader(),
      };

      const response = await fetch(`${API_URL}/dashboard/save_test`, {
        method: 'POST',
        headers,
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save test');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving test result:', error);
      throw error;
    }
  },

  //  Get test history (WITH AUTH)
  getTestHistory: async (limit = 10, userId = null) => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (userId) params.append('user_id', userId);

      const response = await fetch(`${API_URL}/dashboard/history?${params}`, {
        method: 'GET',
        headers: DashboardServices.getAuthHeader(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching test history:', error);
      throw error;
    }
  },

  //  Get test detail (WITH AUTH)
  getTestDetail: async (testId) => {
    try {
      const response = await fetch(`${API_URL}/dashboard/test/${testId}`, {
        method: 'GET',
        headers: DashboardServices.getAuthHeader(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch test details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching test detail:', error);
      throw error;
    }
  },

  //  Get dashboard stats (WITH AUTH)
  getDashboardStats: async (userId = null) => {
    try {
      const params = userId ? `?user_id=${userId}` : '';

      const response = await fetch(`${API_URL}/dashboard/stats${params}`, {
        method: 'GET',
        headers: DashboardServices.getAuthHeader(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  //  Download report (WITH AUTH)
  downloadReport: async (testId) => {
    try {
      const response = await fetch(`${API_URL}/dashboard/download_report/${testId}`, {
        method: 'GET',
        headers: DashboardServices.getAuthHeader(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to download report');
      }

      // Get blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interview_report_${testId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  },
};

export default DashboardServices;
