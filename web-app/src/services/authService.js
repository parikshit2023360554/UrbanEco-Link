import apiClient from './api';

/**
 * Authentication API Services
 */
export const authService = {
  /**
   * Register a new user profile with address & geolocation metadata
   * @param {object} userData - Full user, profile, address & GPS location data
   */
  async signup(userData) {
    const data = await apiClient.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('urbaneco_token', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('urbaneco_user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Alias for signup
   */
  async register(userData) {
    return this.signup(userData);
  },

  /**
   * Authenticate user with credentials
   * @param {object} credentials - { email, password }
   */
  async login(credentials) {
    const data = await apiClient.post('/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('urbaneco_token', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('urbaneco_user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getProfile() {
    const data = await apiClient.get('/auth/me');
    if (data.user) {
      localStorage.setItem('urbaneco_user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Logout user and clear stored authentication session
   */
  logout() {
    localStorage.removeItem('urbaneco_token');
    localStorage.removeItem('token');
    localStorage.removeItem('urbaneco_user');
  },

  /**
   * Retrieve cached user object from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('urbaneco_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Retrieve cached JWT auth token
   */
  getToken() {
    return localStorage.getItem('urbaneco_token') || localStorage.getItem('token');
  },
};

export default authService;
