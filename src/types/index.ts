// This file defines TypeScript types for your data structures

export interface UserData {
  _id?: string;           // MongoDB auto-generates this ID
  name: string;           // User's full name
  email: string;          // User's email
  phone?: string;         // Optional phone number
  location?: string;      // Optional location
  occupation?: string;    // Optional job/profession
  bio?: string;           // Optional biography
  avatar?: string;        // Avatar identifier
  password?: string;      // Password (will be hashed in production)
  createdAt?: Date;       // Auto-generated timestamp
  phoneCode?: string; 
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}