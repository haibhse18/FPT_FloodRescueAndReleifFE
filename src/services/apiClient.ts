/**
 * API Client - Global Infrastructure Service
 *
 * Wrapper around axiosInstance for standardized API calls.
 * Used by all modules for external API communication.
 */

import axiosInstance from "@/lib/axios";
import { AxiosRequestConfig } from "axios";

export interface ApiClientConfig extends AxiosRequestConfig {}

/**
 * Generic HTTP client wrapper using Axios
 * @param endpoint - API endpoint path
 * @param config - Axios request config
 * @returns Parsed JSON response (data)
 */
export async function fetchAPI<T>(
  endpoint: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const response = await axiosInstance.request<T>({
    url: endpoint,
    ...config,
  });
  return response.data;
}

/**
 * GET request helper
 */
export async function get<T>(
  endpoint: string,
  config?: ApiClientConfig,
): Promise<T> {
  const response = await axiosInstance.get<T>(endpoint, config);
  return response.data;
}

/**
 * POST request helper
 */
export async function post<T>(
  endpoint: string,
  data?: unknown,
  config?: ApiClientConfig,
): Promise<T> {
  const response = await axiosInstance.post<T>(endpoint, data, config);
  return response.data;
}

/**
 * PUT request helper
 */
export async function put<T>(
  endpoint: string,
  data?: unknown,
  config?: ApiClientConfig,
): Promise<T> {
  const response = await axiosInstance.put<T>(endpoint, data, config);
  return response.data;
}

/**
 * PATCH request helper
 */
export async function patch<T>(
  endpoint: string,
  data?: unknown,
  config?: ApiClientConfig,
): Promise<T> {
  const response = await axiosInstance.patch<T>(endpoint, data, config);
  return response.data;
}

/**
 * DELETE request helper
 */
export async function del<T>(
  endpoint: string,
  config?: ApiClientConfig,
): Promise<T> {
  const response = await axiosInstance.delete<T>(endpoint, config);
  return response.data;
}

export const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del,
  fetchAPI,
};
