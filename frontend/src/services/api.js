import axios from 'axios';

// Base axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://127.0.0.1:8000/api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout for requests
});

// Auto-attach Authentication Token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    // Only attach token if not already manually provided in the request call
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle Authentication Errors (401)
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

// Public Analytics & Stats
export const getSystemStats = async () => {
  const response = await api.get('/stats/');
  return response.data;
};


// IDENTITY & KYC MANAGEMENT


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

/**
 * Authenticate user via MetaMask Wallet Address.
 * 
 * @param {string} walletAddress - Ethereum wallet address (0x...)
 * @returns {Promise<{token: string, user_id: number, role: string}>} Authentication data
 * 
 * @example
 * const data = await loginWithWallet('0x123...');
 */
export const loginWithWallet = async (walletAddress, signature, message) => {
  const response = await api.post('/auth/wallet/', { 
    wallet_address: walletAddress,
    signature,
    message
  });
  return response.data;
};

/**
 * Register a new user profile linked to a MetaMask wallet.
 * 
 * @param {Object} userData - User registration details
 * @returns {Promise<{token: string, user_id: number, role: string}>} Authentication data
 */
export const registerWithWallet = async (userData) => {
  const response = await api.post('/auth/register/', userData, {
    headers: {
      'Content-Type' : 'multipart/form-data',
    },
  });
  return response.data;
};

export const checkRegistration = async (walletAddress) => {
  const response = await api.get(`/auth/check/?wallet_address=${walletAddress}`);
  return response.data;
};

// Send OTP to email
export const requestOtp = async (email, walletAddress = null) => {
  const payload = { email };
  if (walletAddress) payload.wallet_address = walletAddress;
  const response = await api.post('/auth/otp/request/', payload);
  return response.data;
};

// Verify OTP
export const verifyOtp = async (email, otp_code) => {
  const response = await api.post('/auth/otp/verify/', { email, otp_code });
  return response.data;
};

// Check if wallet is a whitelisted officer
export const checkOfficerStatus = async (walletAddress) => {
  const response = await api.get(`/auth/officer/status/?wallet_address=${walletAddress}`);
  return response.data;
};

// Activate officer role with signature
export const activateOfficerRole = async (walletAddress, signature, message) => {
  const response = await api.post('/auth/officer/activate/', {
    wallet_address: walletAddress,
    signature,
    message
  });
  return response.data;
};

// Master Admin: Manage whitelist
export const getOfficerWhitelist = async () => {
  const response = await api.get('/officers/whitelist/');
  return response.data;
};

export const authorizeNewOfficer = async (officerData) => {
  const response = await api.post('/officers/whitelist/', officerData);
  return response.data;
};

// User Profiles
export const lookupCitizen = async (citizenshipNo) => {
  const response = await api.get(`/users/lookup/?citizenship_no=${encodeURIComponent(citizenshipNo)}`);
  return response.data;
};

// KYC Approval/Rejection
export const approveKyc = async (profileId) => {
  const response = await api.post(`/users/${profileId}/approve_kyc/`);
  return response.data;
};

export const rejectKyc = async (profileId, reason) => {
  const response = await api.post(`/users/${profileId}/reject_kyc/`, { reason });
  return response.data;
};

// Fetch user list (Officers see all)
export const getUsers = async () => {
  const response = await api.get('/users/');
  return response.data.results || response.data || [];
};

export const getUserById = async (id, overrideToken = null) => {
  const config = {};
  if (overrideToken) {
    config.headers = { Authorization: `Token ${overrideToken}` };
  }
  const response = await api.get(`/users/${id}/`, config);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.patch(`/users/${id}/`, userData);
  return response.data;
};

// Registration Applications
export const getApplications = async () => {
  const response = await api.get('/applications/');
  return response.data.results || response.data || [];
};

export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}/`);
  return response.data;
};

// Create new application (Multipart/FormData)
export const createApplication = async (formData) => {
  const response = await api.post('/applications/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update an existing application (Multipart/FormData)
export const updateApplication = async (id, formData) => {
  const response = await api.patch(`/applications/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Sync Property Registry
export const getProperties = async () => {
  const response = await api.get('/properties/');
  return response.data.results || response.data || [];
};

export const getProperty = async (parcelId) => {
  const response = await api.get(`/properties/`, { params: { parcel_id: parcelId } });
  const data = response.data.results || response.data;
  return Array.isArray(data) ? data[0] : data;
};

// Sync blockchain transfer to DB
export const syncPropertyTransfer = async (parcelId, newWalletAddress, txHash, salePrice = null) => {
  const response = await api.post('/properties/sync-transfer/', {
    parcel_id: parcelId,
    new_wallet_address: newWalletAddress,
    tx_hash: txHash,
    sale_price: salePrice
  });
  return response.data;
};

// Delete application
export const deleteApplication = async (id) => {
  const response = await api.delete(`/applications/${id}/`);
  return response.data;
};

// KYC & Notifications
export const getTransferHistory = async (parcelId) => {
  const response = await api.get(`/properties/transfer-history/?parcel_id=${parcelId}`);
  return response.data;
};

export const getPendingCounts = async () => {
  const response = await api.get('/notifications/pending-counts/');
  return response.data;
};

// Fetch KYC update requests
export const getKYCUpdates = async () => {
  const response = await api.get('/kyc-updates/');
  return response.data.results || response.data || [];
};

// Submit a new KYC update request (Citizen)
export const submitKYCUpdate = async (formData) => {
  const response = await api.post('/kyc-updates/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Approve a KYC update (Officer)
export const approveKYCUpdate = async (id) => {
  const response = await api.post(`/kyc-updates/${id}/approve/`);
  return response.data;
};

// Reject a KYC update (Officer)
export const rejectKYCUpdate = async (id, reason) => {
  const response = await api.post(`/kyc-updates/${id}/reject/`, { reason });
  return response.data;
};

// Submit a public contact/support request
export const submitContact = async (contactData) => {
  const response = await api.post('/contact/', contactData);
  return response.data;
};

// Utilities
export const isAuthenticated = () => !!localStorage.getItem('authToken');
export const getAuthToken = () => localStorage.getItem('authToken');
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export default api;
