export declare enum SocialProvider {
    GOOGLE = "google",
    GITHUB = "github",
    FACEBOOK = "facebook",
    APPLE = "apple",
    TWITTER = "twitter"
}
export declare enum TeamRole {
    OWNER = "owner",
    ADMIN = "admin",
    EDITOR = "editor",
    VIEWER = "viewer",
    MEMBER = "member"
}
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
export interface ConfigureSocialProviderRequest {
    provider: SocialProvider;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    scopes?: string[];
    enabled?: boolean;
}
export interface TenantAuthResponse {
    success: boolean;
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        emailVerified: boolean;
    };
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
export interface TenantApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface TenantAuthError {
    message: string;
    code?: string;
    statusCode?: number;
    details?: any;
}
export declare class TenantAuthValidationError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details: any;
    constructor(message: string, details?: any);
}
export declare class TenantAuthNetworkError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(message?: string);
}
export declare class TenantAuthApiError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: any;
    constructor(message: string, statusCode: number, code?: string, details?: any);
}
//# sourceMappingURL=tenant-auth.types.d.ts.map