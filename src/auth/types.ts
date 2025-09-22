export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface AuthToken {
  token: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

export interface User {
  // Core fields from auth.users table
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar_url?: string;
  email_verified?: boolean;
  phone?: string;
  phone_verified?: boolean;
  
  // Profile fields from auth.users table
  bio?: string;
  location?: string;
  website?: string;
  date_of_birth?: string;
  gender?: string;
  
  // Metadata fields for app-specific data
  metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  
  // Security/tracking fields
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  
  // OAuth tracking
  oauth_providers?: string[];
  
  // For response compatibility
  user?: User; // Some responses nest user object
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PasswordResetRequest {
  token: string;
  newPassword: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  databaseName: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Only returned on creation
  keyPrefix: string;
  projectId?: string;
  appId?: string;
  role: string;
  permissions: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}