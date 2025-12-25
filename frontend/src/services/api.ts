import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Local backend API - always use this
const API_BASE_URL = 'https://car-rental-staff.preview.emergentagent.com/api';

console.log('API URL:', API_BASE_URL);

// Platform-specific storage helper
const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.removeItem(key);
    }
    return await SecureStore.deleteItemAsync(key);
  },
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, handle logout
      storage.deleteItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const reservationService = {
  getAll: async (params?: { status?: string; search?: string }) => {
    const response = await api.get('/reservations', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },
};

export const vehicleService = {
  getAll: async () => {
    const response = await api.get('/vehicles');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
};

export const deliveryService = {
  create: async (data: {
    reservation_id: string;
    km_reading: number;
    fuel_level: number;
    photos: string[];
    notes?: string;
    kvkk_consent: boolean;
  }) => {
    const response = await api.post('/deliveries', data);
    return response.data;
  },
};

export const returnService = {
  create: async (data: {
    reservation_id: string;
    km_reading: number;
    fuel_level: number;
    photos: string[];
    damage_photos?: string[];
    damage_notes?: string;
    extra_charges?: number;
    notes?: string;
  }) => {
    const response = await api.post('/returns', data);
    return response.data;
  },
};

export const gpsService = {
  getVehicles: async () => {
    const response = await api.get('/gps/vehicles');
    return response.data;
  },
};

export default api;
