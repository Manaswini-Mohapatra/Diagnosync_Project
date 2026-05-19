import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, 
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  
  (response) => response,

  
  (error) => {
    const status = error.response?.status;

   
    if (status === 401) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAuthenticated');
      
      if (hadToken) {
        window.location.href = '/signin';
      }
      return Promise.reject(error);
    }

    
    if (status === 403) {
      console.warn('Access denied:', error.response?.data?.error);
    }

    
    if (status >= 500) {
      console.error('Server error:', error.response?.data?.error || 'Unknown server error');
    }

    return Promise.reject(error);
  }
);

export default api;
