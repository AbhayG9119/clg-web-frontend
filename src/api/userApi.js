import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const userApi = {
  addUser: async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.post(`${API_BASE_URL}/api/users`, userData, config);
      if (response.status === 201) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to add user' };
      }
    } catch (error) {
      console.error('Error in userApi.addUser:', error);
      return { success: false, error: error.response?.data?.message || error.message || 'Network error' };
    }
  }
};

export default userApi;
