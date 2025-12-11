import axios from 'axios';
import { UserData } from '../types';

// Base URL for Node.js Express backend on port 5000
const API_URL = 'http://localhost:5000/api/userdata';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response types for Node.js backend
export interface LoginResponse {
  message: string;
  email?: string;
}

export interface VerifyMFAResponse {
  message: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    phoneCode?: string;
    location?: string;
    occupation?: string;
    bio?: string;
    avatar?: string;
    createdAt?: string;
  };
}

export interface SignupResponse {
  message: string;
  email?: string;
}

// API functions for Node.js backend
export const userDataAPI = {
  // POST - Signup new user
  signup: async (email: string, password: string, name: string): Promise<SignupResponse> => {
    try {
      const response = await axiosInstance.post('/', { 
        email, 
        password, 
        name 
      });
      return response.data;
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  // POST - Login user (sends MFA code)
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post('/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // POST - Verify MFA code
  verifyMFA: async (email: string, code: string): Promise<VerifyMFAResponse> => {
    try {
      const response = await axiosInstance.post('/verify-mfa', { email, code });
      return response.data;
    } catch (error: any) {
      console.error('Error verifying MFA:', error);
      throw error;
    }
  },

  // POST - Resend MFA code
  resendCode: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.post('/resend-code', { email });
      return response.data;
    } catch (error: any) {
      console.error('Error resending code:', error);
      throw error;
    }
  },

  // GET - Fetch all users from database
  getAll: async (): Promise<UserData[]> => {
    try {
      const response = await axiosInstance.get('/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // GET - Fetch single user by ID
  getById: async (id: string): Promise<UserData> => {
    try {
      const response = await axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // POST - Create new user (legacy)
  create: async (userData: Partial<UserData>): Promise<UserData> => {
    try {
      const response = await axiosInstance.post('/', userData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // PUT - Update existing user
  update: async (id: string, userData: Partial<UserData>): Promise<UserData> => {
    try {
      const response = await axiosInstance.put(`/${id}`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // DELETE - Remove user
  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/${id}`);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Custom endpoint - Check if email exists
  checkEmail: async (email: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.get(`/check-email/${email}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }
};