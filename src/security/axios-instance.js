import axios from 'axios';

const ENV = window.location.hostname; // Get current environment
let baseURL = '';
const apiBaseUrlDev = import.meta.env.VITE_API_BASE_URL_DEV;
const apiBaseUrlDevProd = import.meta.env.VITE_API_BASE_URL_DEV_PROD;

switch (ENV) {
  case 'localhost':
    baseURL = apiBaseUrlDev;
    break;
  case 'd2ymcql1l53g3b.cloudfront.net':
    baseURL = apiBaseUrlDevProd;
    break;
  default:
    throw new Error('Unknown environment');
}

const axiosInstance = axios.create({
  baseURL,
});

// Attach token dynamically before each request
// Attach token dynamically before each request
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // 1. **Retrieve token from localStorage**
      const authToken = localStorage.getItem('authToken');

      // 2. **Set the Authorization header if the token exists**
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`; // Common practice is to use 'Bearer' prefix
      }
    } catch (error) {
      console.error('Error retrieving token from localStorage:', error);
    }

    // Set Content-Type for FormData requests
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
