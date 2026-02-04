/**
 * API Service for BhuChain Frontend
 * 
 * Centralized service for all HTTP requests to the Django REST API.
 * Handles authentication, request/response interceptors, and provides
 * typed methods for each backend endpoint.
 * 
 * @module services/api
 */

import axios from 'axios';

// ============================================================================
// AXIOS INSTANCE CONFIGURATION
// ============================================================================

/**
 * Pre-configured axios instance with base URL and default headers.
 * All API requests should use this instance to ensure consistent configuration.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://127.0.0.1:8000/api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout for requests
});

// ============================================================================
// REQUEST INTERCEPTOR - Auto-attach Authentication Token
// ============================================================================

/**
 * Intercepts all outgoing requests to automatically attach the auth token.
 * 
 * Flow:
 * 1. Retrieves token from localStorage
 * 2. If token exists, adds it to Authorization header
 * 3. Django expects format: "Token <token_value>"
 * 
 * This eliminates the need to manually add auth headers to every request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle Authentication Errors
// ============================================================================

/**
 * Intercepts all incoming responses to handle authentication failures.
 * 
 * Flow:
 * 1. If response is successful, pass it through
 * 2. If status is 401 (Unauthorized):
 *    - Clear invalid token from localStorage
 *    - Clear user data
 *    - Redirect to login page
 * 3. For other errors, reject the promise
 * 
 * This provides automatic logout when tokens expire or become invalid.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to login page (only if not already there)
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Authenticate user with Django backend.
 * 
 * @param {string} username - Django username
 * @param {string} password - User password
 * @returns {Promise<{token: string}>} Authentication token
 * 
 * @example
 * const { token } = await login('citizen1', 'password123');
 * localStorage.setItem('authToken', token);
 */
export const login = async (username, password) => {
  const response = await api.post('/login/', { username, password });
  return response.data;
};

// ============================================================================
// USER PROFILE ENDPOINTS
// ============================================================================

/**
 * Fetch all user profiles (paginated).
 * 
 * Security:
 * - Officers: See all users
 * - Citizens: See only their own profile (filtered by backend)
 * 
 * @returns {Promise<{count: number, results: Array}>} Paginated user list
 * 
 * @example
 * const { results } = await getUsers();
 * console.log(results[0].full_name);
 */
export const getUsers = async () => {
  const response = await api.get('/users/');
  return response.data;
};

/**
 * Fetch a specific user profile by ID.
 * 
 * @param {number} id - User profile ID
 * @returns {Promise<Object>} User profile object
 * 
 * @example
 * const user = await getUserById(1);
 */
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}/`);
  return response.data;
};

/**
 * Create a new user profile (registration).
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.full_name - Full name
 * @param {string} userData.email - Email address (unique)
 * @param {string} userData.citizenship_no - 10-digit citizenship number (unique)
 * @param {string} userData.wallet_address - Ethereum wallet address (0x...)
 * @param {string} userData.role - "Citizen" or "Officer"
 * @returns {Promise<Object>} Created user profile
 * 
 * @example
 * const newUser = await createUser({
 *   full_name: "John Doe",
 *   email: "john@example.com",
 *   citizenship_no: "1234567890",
 *   wallet_address: "0x1234...",
 *   role: "Citizen"
 * });
 */
export const createUser = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

/**
 * Update an existing user profile.
 * 
 * @param {number} id - User profile ID
 * @param {Object} userData - Fields to update
 * @returns {Promise<Object>} Updated user profile
 */
export const updateUser = async (id, userData) => {
  const response = await api.patch(`/users/${id}/`, userData);
  return response.data;
};

// ============================================================================
// REGISTRATION APPLICATION ENDPOINTS
// ============================================================================

/**
 * Fetch all registration applications.
 * 
 * Security:
 * - Officers: See all applications
 * - Citizens: See only their own applications (filtered by backend)
 * 
 * @returns {Promise<{count: number, results: Array}>} Paginated application list
 * 
 * @example
 * const { results } = await getApplications();
 * const pending = results.filter(app => app.status === 'Pending');
 */
export const getApplications = async () => {
  const response = await api.get('/applications/');
  return response.data;
};

/**
 * Fetch a specific application by ID.
 * 
 * @param {number} id - Application ID
 * @returns {Promise<Object>} Application object
 */
export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}/`);
  return response.data;
};

/**
 * Create a new land registration application.
 * 
 * IMPORTANT: This endpoint expects multipart/form-data for file upload.
 * 
 * @param {FormData} formData - Form data with file upload
 * @returns {Promise<Object>} Created application
 * 
 * @example
 * const formData = new FormData();
 * formData.append('user', userId);
 * formData.append('document_path', fileInput.files[0]);
 * const application = await createApplication(formData);
 */
export const createApplication = async (formData) => {
  const response = await api.post('/applications/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update an existing application (approve/reject, add parcel_id).
 * 
 * @param {number} id - Application ID
 * @param {Object} data - Fields to update
 * @param {string} [data.status] - "Pending" | "Approved" | "Rejected"
 * @param {number} [data.parcel_id] - Blockchain parcel ID (set after approval)
 * @returns {Promise<Object>} Updated application
 * 
 * @example
 * // Officer approves application and links blockchain parcel
 * await updateApplication(5, {
 *   status: 'Approved',
 *   parcel_id: 123
 * });
 */
export const updateApplication = async (id, data) => {
  const response = await api.patch(`/applications/${id}/`, data);
  return response.data;
};

/**
 * Delete an application.
 * 
 * @param {number} id - Application ID
 * @returns {Promise<void>}
 */
export const deleteApplication = async (id) => {
  const response = await api.delete(`/applications/${id}/`);
  return response.data;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user is currently authenticated.
 * 
 * @returns {boolean} True if auth token exists in localStorage
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Get the current auth token.
 * 
 * @returns {string|null} Auth token or null if not logged in
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Clear all authentication data (logout).
 */
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Export the configured axios instance for custom requests.
 * Use the named exports above for standard operations.
 */
export default api;
