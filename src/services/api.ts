import axios from 'axios';
import { UserData } from '../types';

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions for interacting with backend
export const userDataAPI = {
  // GET - Fetch all users from database
  getAll: async (): Promise<UserData[]> => {
    try {
      const response = await axiosInstance.get('/userdata');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // GET - Fetch single user by ID
  getById: async (id: string): Promise<UserData> => {
    try {
      const response = await axiosInstance.get(`/userdata/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // POST - Create new user (signup)
  create: async (userData: Partial<UserData>): Promise<UserData> => {
    try {
      const response = await axiosInstance.post('/userdata', userData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // POST - Login user
  login: async (email: string, password: string): Promise<{ message: string; user: UserData }> => {
    try {
      const response = await axiosInstance.post('/userdata/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // PUT - Update existing user
  update: async (id: string, userData: Partial<UserData>): Promise<UserData> => {
    try {
      const response = await axiosInstance.put(`/userdata/${id}`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // DELETE - Remove user
  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/userdata/${id}`);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Custom endpoint - Check if email exists
  checkEmail: async (email: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.get(`/userdata/check-email/${email}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }
};