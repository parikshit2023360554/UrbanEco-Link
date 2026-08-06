/**
 * UrbanEco Link Centralized API Client (Native Fetch Engine)
 * Zero external dependencies required - works seamlessly with Vite & Browser Fetch API.
 * Configured for Node.js + Express Backend running at http://localhost:5000/api/v1
 */
const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return 'http://localhost:5000/api/v1';
};

const API_BASE_URL = getBaseUrl();

/**
 * Core HTTP Request Processor with Centralized Auth Interceptor
 */
async function httpRequest(endpoint, options = {}) {
  // Retrieve JWT Bearer token from localStorage
  const token =
    localStorage.getItem('token') || localStorage.getItem('urbaneco_token');

  // Centralized Header Injection
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  // Convert payload body to JSON string if object
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // Build target URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    // Global 401 Unauthorized handling (token expired, missing, or invalid)
    if (response.status === 401) {
      console.warn('🔒 401 Unauthorized: Session expired or invalid token.');
      localStorage.removeItem('token');
      localStorage.removeItem('urbaneco_token');
      localStorage.removeItem('urbaneco_user');

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.dispatchEvent(new Event('urbaneco:session_expired'));
      }
    }

    // Parse JSON or text response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : {};
    }

    if (!response.ok) {
      const errorMessage =
        data?.error || data?.message || `HTTP ${response.status} Request Failed`;
      const err = new Error(errorMessage);
      err.status = response.status;
      throw err;
    }

    // Return body payload directly (matching Axios unwrap)
    return data;
  } catch (error) {
    if (error.status === 401) {
      throw error;
    }
    const err = new Error(error.message || 'An unexpected network error occurred.');
    err.status = error.status;
    throw err;
  }
}

/**
 * Axios-compatible API Client interface
 */
export const apiClient = {
  get: (endpoint, options = {}) => {
    let url = endpoint;
    if (options.params) {
      const searchParams = new URLSearchParams(options.params).toString();
      url = `${endpoint}?${searchParams}`;
    }
    return httpRequest(url, { ...options, method: 'GET' });
  },

  post: (endpoint, body, options = {}) => {
    return httpRequest(endpoint, { ...options, method: 'POST', body });
  },

  put: (endpoint, body, options = {}) => {
    return httpRequest(endpoint, { ...options, method: 'PUT', body });
  },

  patch: (endpoint, body, options = {}) => {
    return httpRequest(endpoint, { ...options, method: 'PATCH', body });
  },

  delete: (endpoint, options = {}) => {
    return httpRequest(endpoint, { ...options, method: 'DELETE' });
  },
};

export default apiClient;
