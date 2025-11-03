// Social Provider Type (following Firebase/Supabase pattern - string literals instead of enums)
export type SocialProvider = 'google' | 'github' | 'facebook' | 'apple' | 'twitter';

// Team Role Type (following Firebase/Supabase pattern - string literals instead of enums)
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'member';

// Request DTOs
export interface TenantRegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  metadata?: Record<string, any>;
  frontendUrl?: string;
}

export interface TenantLoginRequest {
  email: string;
  password: string;
}

export interface TenantVerifyEmailRequest {
  token: string;
}

export interface TenantForgotPasswordRequest {
  email: string;
  frontendUrl: string;
}

export interface TenantResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface TenantSocialAuthRequest {
  provider: SocialProvider;
  providerId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  providerData?: Record<string, any>;
}

export interface TenantLinkSocialRequest {
  provider: SocialProvider;
  providerId: string;
  providerData?: Record<string, any>;
}

export interface TenantRefreshTokenRequest {
  refreshToken: string;
}

export interface TenantLogoutRequest {
  refreshToken?: string;
}

// Team Management DTOs
export interface CreateTeamRequest {
  name: string;
  description?: string;
  settings?: Record<string, any>;
}

export interface InviteMemberRequest {
  teamId: string;
  email: string;
  role: TeamRole;
  frontendUrl: string;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface RemoveMemberRequest {
  teamId: string;
  userId: string;
}

export interface UpdateMemberRoleRequest {
  teamId: string;
  userId: string;
  newRole: TeamRole;
}

// Social Provider Configuration
export interface ConfigureSocialProviderRequest {
  provider: SocialProvider;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];
  enabled?: boolean;
}

// Response Types (matching Fluxez backend DTOs)
export interface TenantAuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: TenantUser;
}

export interface TenantUser {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName?: string;
  avatarUrl?: string;
}

export interface TenantTeam {
  id: string;
  name: string;
  description?: string;
  role: string;
  joinedAt: Date;
}

export interface TenantTeamMember {
  userId: string;
  email: string;
  role: string;
  joinedAt: Date;
  fullName?: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

export interface TenantSocialProvider {
  provider: string;
  configured: boolean;
  enabled: boolean;
  redirectUri?: string;
  scopes?: string[];
}

// Generic API Response
export interface TenantApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Error Response
export interface TenantAuthError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

// Auth validation errors
export class TenantAuthValidationError extends Error {
  public readonly code: string = 'VALIDATION_ERROR';
  public readonly statusCode: number = 400;
  public readonly details: any;
  
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'TenantAuthValidationError';
    this.details = details;
  }
}

// Auth network errors
export class TenantAuthNetworkError extends Error {
  public readonly code: string = 'NETWORK_ERROR';
  public readonly statusCode: number = 0;
  
  constructor(message: string = 'Network error - no response received') {
    super(message);
    this.name = 'TenantAuthNetworkError';
  }
}

// Auth API errors
export class TenantAuthApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;
  
  constructor(message: string, statusCode: number, code?: string, details?: any) {
    super(message);
    this.name = 'TenantAuthApiError';
    this.statusCode = statusCode;
    this.code = code || 'API_ERROR';
    this.details = details;
  }
}