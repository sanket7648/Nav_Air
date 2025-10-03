import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Only redirect to login for actual authentication errors (401)
    // Don't redirect for other errors like 400 (bad request) or 404 (not found)
    if (error.response?.status === 401) {
          // Token expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register user
  register: async (userData: {
    email: string;
    password: string;
    username: string;
    contact_number?: string;
    country?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  // Update user profile
  updateProfile: async (profileData: { city?: string; country?: string }) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Google OAuth URL
  getGoogleAuthUrl: () => {
    return `${API_BASE_URL}/auth/google`;
  },

  // Verify OTP
  verifyOtp: async (data: { otp: string }) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },
};

// Auth utilities
export const authUtils = {
  // Set auth token and user data
  setAuth: (token: string, user: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get user data
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Clear auth data
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const baggageAPI = {
  // List all baggage
  list: async () => {
    const res = await api.get('/baggage');
    return res.data;
  },
  // Get baggage by bagId
  get: async (bagId: string) => {
    const res = await api.get(`/baggage/${bagId}`);
    return res.data;
  },
  // Create new baggage
  create: async (data: { bagId?: string; flightNumber: string; carouselNumber: number }) => {
    const res = await api.post('/baggage', data);
    return res.data;
  },
  // Update baggage status
  updateStatus: async (bagId: string, status: string) => {
    const res = await api.patch(`/baggage/${bagId}/status`, { status });
    return res.data;
  },
  // Delete baggage
  remove: async (bagId: string) => {
    const res = await api.delete(`/baggage/${bagId}`);
    return res.data;
  },
};

// Add a type definition for the booking data
interface SlotBookingData {
    serviceType: string;
    bookingDate: string;
    bookingTime: string;
}

export const bookingAPI = {
  // Create new slot booking
  create: async (data: SlotBookingData) => {
    const res = await api.post('/booking', data);
    return res.data;
  },
};



export const sendLocation = async (locationData: any) => {
  const res = await api.post('/location', locationData);
  return res.data;
};

export const queryFlights = async (locationData: any) => {
  const res = await api.post('/flights', locationData);
  return res.data;
};

export const getUserRegionFlights = async () => {
  const res = await api.get('/user-region-flights');
  return res.data;
};

export default api; 