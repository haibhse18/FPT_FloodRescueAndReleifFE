/**
 * Auth Session - Global Infrastructure Service
 * 
 * Manages authentication tokens and session state.
 * Framework-agnostic token storage and retrieval.
 * No business logic - purely infrastructure concern.
 */

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Get authentication token from storage
 * @returns Token string or null if not found
 */
export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
}

/**
 * Set authentication token in storage
 * @param token - JWT token to store
 */
export function setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
    }
}

/**
 * Remove authentication token from storage
 */
export function removeAuthToken(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
}

/**
 * Get refresh token from storage
 * @returns Refresh token string or null if not found
 */
export function getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
}

/**
 * Set refresh token in storage
 * @param token - Refresh token to store
 */
export function setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
}

/**
 * Get authorization headers with Bearer token
 * @returns Headers object with Authorization header if token exists
 */
export function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Check if user is authenticated
 * @returns True if auth token exists
 */
export function isAuthenticated(): boolean {
    return getAuthToken() !== null;
}

/**
 * Store auth tokens (access and refresh)
 * @param accessToken - Access token
 * @param refreshToken - Optional refresh token
 */
export function setAuthTokens(accessToken: string, refreshToken?: string): void {
    setAuthToken(accessToken);
    if (refreshToken) {
        setRefreshToken(refreshToken);
    }
}

/**
 * Clear all auth tokens
 */
export function clearAuthTokens(): void {
    removeAuthToken();
}

export const authSession = {
    getAuthToken,
    setAuthToken,
    removeAuthToken,
    getRefreshToken,
    setRefreshToken,
    getAuthHeaders,
    isAuthenticated,
    setAuthTokens,
    clearAuthTokens,
};
