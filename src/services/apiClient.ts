/**
 * API Client - Global Infrastructure Service
 * 
 * Pure HTTP client for making API requests.
 * Framework-agnostic, no business logic.
 * Used by all modules for external API communication.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiClientConfig {
    headers?: HeadersInit;
    baseURL?: string;
}

/**
 * Generic HTTP client wrapper with error handling
 * @param endpoint - API endpoint path
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
export async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {},
    config: ApiClientConfig = {}
): Promise<T> {
    const baseURL = config.baseURL || API_BASE_URL;
    const url = `${baseURL}${endpoint}`;

    const requestConfig: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...config.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, requestConfig);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API call failed: ${endpoint}`, error);
        throw error;
    }
}

/**
 * GET request helper
 */
export async function get<T>(endpoint: string, config?: ApiClientConfig): Promise<T> {
    return fetchAPI<T>(endpoint, { method: 'GET' }, config);
}

/**
 * POST request helper
 */
export async function post<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiClientConfig
): Promise<T> {
    return fetchAPI<T>(
        endpoint,
        {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        },
        config
    );
}

/**
 * PUT request helper
 */
export async function put<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiClientConfig
): Promise<T> {
    return fetchAPI<T>(
        endpoint,
        {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        },
        config
    );
}

/**
 * PATCH request helper
 */
export async function patch<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiClientConfig
): Promise<T> {
    return fetchAPI<T>(
        endpoint,
        {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        },
        config
    );
}

/**
 * DELETE request helper
 */
export async function del<T>(endpoint: string, config?: ApiClientConfig): Promise<T> {
    return fetchAPI<T>(endpoint, { method: 'DELETE' }, config);
}

export const apiClient = {
    get,
    post,
    put,
    patch,
    delete: del,
    fetchAPI,
};
