import axios, { AxiosError } from "axios";
import {
  ClientNetworkError,
  ServerNetworkError,
} from "../utils/network-errors";

export interface HttpResponse<T = any> {
  status: number;
  data: T;
}

export interface HttpRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
}

export class HttpClient {
  private baseUrl: string;

  constructor({ baseUrl = "" }: { baseUrl?: string }) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    url: string,
    method: string,
    data?: any,
    config: HttpRequestConfig = {},
  ): Promise<HttpResponse<T>> {
    const fullUrl = this.baseUrl ? `${this.baseUrl}${url}` : url;

    try {
      const response = await axios({
        url: fullUrl,
        method,
        data,
        headers: config.headers,
        timeout: config.timeout,
        params: config.params,
        withCredentials: true, // Required for sending cookies in cross-origin requests
      });

      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        // Check if we have a response (server error) or no response (network error)
        if (error.response) {
          // Server responded with error status
          throw new ServerNetworkError(
            `Server error ${error.response.status} for ${method} ${url}: ${error.response.statusText}`,
            {
              endpoint: url,
              method,
              statusCode: error.response.status,
              responseText: error.response.statusText,
              responseData: error.response.data,
            },
          );
        }
        if (error.request) {
          // Request was made but no response received
          throw ClientNetworkError.fromNetworkFailure(error, {
            endpoint: url,
            method,
          });
        }
        // Something happened in setting up the request
        throw ClientNetworkError.fromNetworkFailure(error, {
          endpoint: url,
          method,
        });
      }
      // Re-throw non-axios errors
      throw error;
    }
  }

  async get<T>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "GET", undefined, config);
  }

  async post<T>(
    url: string,
    data?: any,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "POST", data, config);
  }

  async put<T>(
    url: string,
    data?: any,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "PUT", data, config);
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "PATCH", data, config);
  }

  async delete<T>(
    url: string,
    data?: any,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "DELETE", data, config);
  }
}
