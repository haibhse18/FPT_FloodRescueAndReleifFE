/**
 * Map API Client - External Infrastructure Service
 *
 * Wrapper around axios for map APIs (OpenMap, Nominatim, etc.)
 * Does NOT include auth interceptors that might cause CORS issues
 * or send sensitive tokens to third-party services.
 */

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const MAP_API_BASE_URL = "/api/openmap"; // Dùng Proxy NextJS để vượt tường lửa CORS từ trình duyệt

export const mapAxiosInstance = axios.create({
    baseURL: MAP_API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor - you can add custom logic here if external API needs normalization
mapAxiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export interface MapClientConfig extends AxiosRequestConfig { }

export async function fetchMapAPI<T>(
    endpoint: string,
    config: AxiosRequestConfig = {}
): Promise<T> {
    const response = await mapAxiosInstance.request<T>({
        url: endpoint,
        ...config,
    });
    return response.data;
}

export async function get<T>(
    endpoint: string,
    config?: MapClientConfig
): Promise<T> {
    const response = await mapAxiosInstance.get<T>(endpoint, config);
    return response.data;
}

export async function post<T>(
    endpoint: string,
    data?: unknown,
    config?: MapClientConfig
): Promise<T> {
    const response = await mapAxiosInstance.post<T>(endpoint, data, config);
    return response.data;
}

export const mapClient = {
    get,
    post,
    fetchAPI: fetchMapAPI,
};
